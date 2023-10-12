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
    service_group_data RECORD;
BEGIN
    -- Initialize the result JSON array.
    result := '[]'::jsonb;

    -- Query to fetch the schedule data.
    FOR service_group_data IN
        SELECT  sg.id as id,
                sg.title as title,
                sg.priority as priority, 
                sg.is_horizontal as is_horizontal, 
                sg.description as description,
                json_agg(
                    jsonb_build_object(
                        'id', ss.id,
                        'start', ss.start,
                        'duration', ss.duration,
                        'repeat_start', ss.repeat_start,
                        'repeat_interval', ss.repeat_interval,
                        'repeat_count', ss.repeat_count,
                        'image_url', ss.image_url,
                        'service', jsonb_build_object(
                            'price', s.price,
                            'title', s.title,
                            'booking_limit', s.booking_limit,
                            'description', s.description,
                            'image_url', s.image_url
                        ),
                        'staffs', (
                            SELECT json_agg(jsonb_build_object(
                                'id', staff.id,
                                'email', staff.email,
                                'image_url', staff.image_url,
                                'first_name', staff.first_name,
                                'last_name', staff.last_name,
                                'instagram_handle', staff.instagram_handle
                            ))
                            FROM public.service_slot_staff AS sss
                            JOIN public.staff AS staff ON sss.staff_id = staff.id
                            WHERE sss.service_slot_id = ss.id
                        )
                   ) ORDER BY ss.start
               ) AS service_slots
        FROM public.service_group AS sg
        JOIN public.service AS s ON sg.id = s.service_group_id
        JOIN public.service_slot AS ss ON s.id = ss.service_id
        WHERE sg.business_id = (
            SELECT id FROM public.business WHERE handle = business_handle
        )
        AND (
            -- Include slots within the specified timestamp range
            (ss.start >= start_time AND ss.start <= end_time)
            OR (ss.repeat_start IS NOT NULL
                AND (
                    -- If the slot repeat_start is within the specified range
                    (ss.repeat_start >= start_time AND ss.repeat_start <= end_time) OR

                    -- Check if the recurring event has occurrences in the specified range
                    /* 
                      start_time = 24
                      repeat_start = 2
                      interval = 10
                      num_intervals_to_jump = ((start_time - repeat_start) / repeat_interval) + 1
                      future_start = repeat_start + (repeat_interval * num_intervals_to_jump) 
                      future_start >= start_time and =< end_time
                     */
                    (ss.repeat_start <= start_time
                        AND (
                            -- if repeat count is null, we treat the recurrence as infinite, and continue to evaluate occurences.
                            ss.repeat_count IS NULL OR (
                                -- num repeat repeat intervals to jump <= repeat count
                                FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.repeat_start)) * 1000) / ss.repeat_interval) + 1 <= ss.repeat_count 
                            ))
                        AND ((EXTRACT(EPOCH FROM ss.repeat_start) * 1000) +
                            -- total jumped
                            (ss.repeat_interval * 
                                (
                                    -- num repeat intervals to jump 
                                    FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.repeat_start)) * 1000) / ss.repeat_interval) + 1
                                )
                            )) <= (EXTRACT(EPOCH FROM (end_time::timestamptz)) * 1000)
                        AND ((EXTRACT(EPOCH FROM ss.repeat_start) * 1000) + 
                            -- total jumped
                            (ss.repeat_interval * 
                                (
                                    -- num repeat intervals to jump
                                    FLOOR((EXTRACT(EPOCH FROM (start_time::timestamptz - ss.repeat_start)) * 1000) / ss.repeat_interval) + 1
                                )
                            )) >= (EXTRACT(EPOCH FROM (start_time::timestamptz)) * 1000)
                    )
                )
            )
        )
        GROUP BY sg.id
    LOOP
        -- Append each service group data to the result.
        result := result || row_to_json(service_group_data)::jsonb;
    END LOOP;

    -- Return the result JSON array.
    RETURN result;
END;
$function$
;