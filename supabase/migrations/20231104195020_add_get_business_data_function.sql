CREATE OR REPLACE FUNCTION public.get_business_data(business_handle text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    var_business_id uuid;
    services_data jsonb;
    staffs_data jsonb;
    service_groups_data jsonb;
    result jsonb;
BEGIN
    -- Get the business ID based on the handle.
    SELECT id INTO var_business_id FROM public.business WHERE handle = business_handle;

    -- Initialize the result JSON object.
    result := '{}'::jsonb;

    -- Fetch services data with color derived from service_group.
    SELECT COALESCE(jsonb_agg(
        jsonb_set(
            jsonb_build_object(
                'id', s.id,
                'title', s.title,
                'description', s.description,
                'booking_limit', s.booking_limit,
                'duration', s.duration,
                'price', s.price
            ),
            '{color}', ('"' || sg.color || '"')::jsonb
        )
    ), '[]'::jsonb)
    INTO services_data
    FROM public.service s
    JOIN public.service_group sg ON s.service_group_id = sg.id
    WHERE sg.business_id = var_business_id;

    -- Fetch staff data.
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', staff.id,
            'email', staff.email,
            'instagram_handle', staff.instagram_handle,
            'first_name', staff.first_name,
            'last_name', staff.last_name
        )), '[]'::jsonb)
    INTO staffs_data
    FROM public.staff staff
    WHERE staff.business_id = var_business_id;

    -- Fetch service group data.
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', sg.id,
            'title', sg.title,
            'description', sg.description,
            'color', sg.color,
            'priority', sg.priority
        )), '[]'::jsonb)
    INTO service_groups_data
    FROM public.service_group sg
    WHERE sg.business_id = var_business_id;

    -- Append the data to the result object.
    result := jsonb_set(result, '{services}', services_data);
    result := jsonb_set(result, '{staffs}', staffs_data);
    result := jsonb_set(result, '{service_groups}', service_groups_data);

    -- Return the final JSON object.
    RETURN result;
END;
$$;