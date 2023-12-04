set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_scheduled_events_in_time_range(
    business_handle text,
    start_time timestamptz,
    end_time timestamptz,
    availability_schedule_id_arg uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$

DECLARE
    result jsonb;
    service_event_data RECORD;
BEGIN
    -- Initialize the result JSON array.
    result := '[]'::jsonb;

    -- Query to fetch the schedule data directly from service_events and related tables.
    FOR service_event_data IN
        SELECT jsonb_build_object(
            'id', ss.id, 
            'start', ss.start,
            'end', ss.end,
            'recurrence_start', ss.recurrence_start,
            'recurrence_interval', ss.recurrence_interval,
            'recurrence_count', ss.recurrence_count,
            'color', s.color,
            'availability_schedule_id', ss.availability_schedule_id, -- if service event has availability schedule, it means the event's time slot will be blocked off from the availability schedule.
            'service', jsonb_build_object(
                'availabiltiy_schedule_id', s.availability_schedule_id,
                'color', s.color,
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
        ) as service_event
        FROM public.services AS s
        JOIN public.service_events AS ss ON s.id = ss.service_id
        WHERE s.business_id = (
            SELECT id FROM public.businesses WHERE handle = business_handle
        ) AND s.availability_schedule_id IS NULL -- ignore availability based services. 
        AND (availability_schedule_id_arg IS NULL OR ss.availability_schedule_id = availability_schedule_id_arg)
        AND (
            -- Include slots within the specified timestamp range
            (ss.start >= start_time AND ss.start <= end_time)
            OR (ss.recurrence_start IS NOT NULL AND (
                -- If the slot recurrence_start is within the specified range
                (ss.recurrence_start >= start_time AND ss.recurrence_start <= end_time)
                OR
                -- Check if the recurring event has occurrences in the specified range
                (
                    ss.recurrence_start <= start_time
                    AND (
                        -- if repeat count is null, we treat the recurrence as infinite, and continue to evaluate occurrences.
                        ss.recurrence_count IS NULL OR (
                            -- num repeat intervals to jump <= repeat count
                            FLOOR(EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000 / ss.recurrence_interval) + 1 <= ss.recurrence_count
                        )
                    )
                    AND (
                        EXTRACT(EPOCH FROM ss.recurrence_start) * 1000 +
                        -- total jumped
                        (ss.recurrence_interval * (
                            -- num repeat intervals to jump
                            FLOOR(EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000 / ss.recurrence_interval) + 1
                        ))
                    ) <= EXTRACT(EPOCH FROM end_time::timestamptz) * 1000
                    AND (
                        EXTRACT(EPOCH FROM ss.recurrence_start) * 1000 +
                        -- total jumped
                        (ss.recurrence_interval * (
                            -- num repeat intervals to jump
                            FLOOR(EXTRACT(EPOCH FROM (start_time::timestamptz - ss.recurrence_start)) * 1000 / ss.recurrence_interval) + 1
                        ))
                    ) >= EXTRACT(EPOCH FROM start_time::timestamptz) * 1000
                )
            ))
        )
        GROUP BY ss.id, s.color, s.price, s.title, s.booking_limit, s.description, s.duration, s.id
        ORDER BY ss.start
    LOOP
        -- Append each service event data to the result.
        result := result || (jsonb_agg(service_event_data.service_event) - 'service_event')::jsonb;
    END LOOP;

    -- Return the result JSON array.
    RETURN result;
END;
$function$
;