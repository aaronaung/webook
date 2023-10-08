set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_today_business_schedule(business_handle text)
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
        SELECT sg.title as title, sg.description as description, sg.is_horizontal as is_horizontal,
               json_agg(
                    DISTINCT jsonb_build_object(
                       'title', s.title,
                       'staffs', (
                           SELECT json_agg(
                               jsonb_build_object(
                                   'instagram_handle', staff.instagram_handle,
                                   'first_name', staff.first_name,
                                   'last_name', staff.last_name,
                                   'email', staff.email
                               )
                           ) FROM public.service_slot_staff AS sss
                           JOIN public.staff AS staff ON sss.staff_id = staff.id
                           WHERE sss.service_slot_id = ss.id
                       ),
                       'start', ss.start,
                       'price', s.price,
                       'booking_limit', s.booking_limit
                   )
               ) AS service_slots
        FROM public.service_group AS sg
        JOIN public.service AS s ON sg.id = s.service_group_id
        JOIN public.service_slot AS ss ON s.id = ss.service_id
        WHERE sg.business_id = (
            SELECT id FROM public.business WHERE handle = business_handle
        )
        AND (
            -- Include slots for today and recurring events for today
            date(ss.start) = current_date
            OR (ss.repeat_start IS NOT NULL
                AND date(ss.repeat_start) <= current_date
                AND (
                    date(ss.repeat_start) = current_date
                    OR date(ss.repeat_start) + (ss.repeat_interval || ' milliseconds')::interval = current_date
                )
            )
        )
        GROUP BY sg.id, sg.title, sg.description
    LOOP
        -- Append each service group data to the result.
        result := result || jsonb_build_object(
            'title', service_group_data.title,
            'description', service_group_data.description,
            'is_horizontal', service_group_data.is_horizontal,
            'service_slots', service_group_data.service_slots
        );
    END LOOP;

    -- Return the result JSON array.
    RETURN result;
END;
$function$
;

create policy "Enable read access for all users"
on "public"."business"
as permissive
for select
to public
using (true);



