set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_business_schedule_in_range(
    business_handle text,
    start_time timestamptz,
    end_time timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result jsonb;
    service_category_data RECORD;
BEGIN
    -- Initialize the result JSON array.
    result := '[]'::jsonb;

    -- Query to fetch the schedule data.
    FOR service_category_data IN
        SELECT  sg.id as id,
                sg.title as title,
                sg.priority as priority, 
                sg.description as description,
                sg.business_id as business_id,
                json_agg(
                    jsonb_build_object(
                        'id', ss.id,
                        'start', ss.start,
                        'recurrence_start', ss.recurrence_start,
                        'recurrence_interval', ss.recurrence_interval,
                        'recurrence_count', ss.recurrence_count,
                        'color', sg.color,
                        'service', jsonb_build_object(
                            'color', sg.color,
                            'price', s.price,
                            'title', s.title,
                            'booking_limit', s.booking_limit,
                            'description', s.description,
                            'duration', s.duration,
                            'id', s.id,
                            'questions', (
                                SELECT json_agg(jsonb_build_object(
                                    'id', q.id,
                                    'question', q.question,
                                    'type', q.type,
                                    'required', q.required,
                                    'options', q.options,
                                    'enabled', q.enabled
                                ))
                                FROM public.services_questions AS sq
                                JOIN public.questions AS q ON sq.question_id = q.id
                                WHERE sq.service_id = s.id
                            )
                        ),
                        'staffs', (
                            SELECT json_agg(jsonb_build_object(
                                'id', staff.id,
                                'email', staff.email,
                                'first_name', staff.first_name,
                                'last_name', staff.last_name,
                                'instagram_handle', staff.instagram_handle
                            ))
                            FROM public.service_events_staffs AS sss
                            JOIN public.staffs AS staff ON sss.staff_id = staff.id
                            WHERE sss.service_event_id = ss.id
                        ),
                        'live_stream', (
                            SELECT jsonb_build_object(
                                'join_url', sls.join_url,
                                'start_url', sls.start_url,
                                'password', sls.password
                            )
                            FROM public.service_event_live_streams AS sls
                            WHERE sls.service_event_id = ss.id
                        )
                   ) ORDER BY ss.start
               ) AS service_events
        FROM public.service_categories AS sg
        JOIN public.services AS s ON sg.id = s.service_category_id
        JOIN public.service_events AS ss ON s.id = ss.service_id
        WHERE sg.business_id = (
            SELECT id FROM public.businesses WHERE handle = business_handle
        )
        AND (
            -- Include slots within the specified timestamp range
            (ss.start >= start_time AND ss.start <= end_time)
            OR (ss.recurrence_start IS NOT NULL
                AND (
                    -- If the slot recurrence_start is within the specified range
                    (ss.recurrence_start >= start_time AND ss.recurrence_start <= end_time) OR

                    -- Check if the recurring event has occurrences in the specified range
                    /* 
                      start_time = 24
                      recurrence_start = 2
                      interval = 10
                      num_intervals_to_jump = ((start_time - recurrence_start) / recurrence_interval) + 1
                      future_start = recurrence_start + (recurrence_interval * num_intervals_to_jump) 
                      future_start >= start_time and =< end_time
                     */
                    (ss.recurrence_start <= start_time
                        AND (
                            -- if repeat count is null, we treat the recurrence as infinite, and continue to evaluate occurences.
                            ss.recurrence_count IS NULL OR (
                                -- num repeat repeat intervals to jump <= repeat count
                                FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000) / ss.recurrence_interval) + 1 <= ss.recurrence_count 
                            ))
                        AND ((EXTRACT(EPOCH FROM ss.recurrence_start) * 1000) +
                            -- total jumped
                            (ss.recurrence_interval * 
                                (
                                    -- num repeat intervals to jump 
                                    FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000) / ss.recurrence_interval) + 1
                                )
                            )) <= (EXTRACT(EPOCH FROM (end_time::timestamptz)) * 1000)
                        AND ((EXTRACT(EPOCH FROM ss.recurrence_start) * 1000) + 
                            -- total jumped
                            (ss.recurrence_interval * 
                                (
                                    -- num repeat intervals to jump
                                    FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000) / ss.recurrence_interval) + 1
                                )
                            )) >= (EXTRACT(EPOCH FROM (start_time::timestamptz)) * 1000)
                    )
                )
            )
        )
        GROUP BY sg.id
    LOOP
        -- Append each service category data to the result.
        result := result || row_to_json(service_category_data)::jsonb;
    END LOOP;

    -- Return the result JSON array.
    RETURN result;
END;
$function$
;