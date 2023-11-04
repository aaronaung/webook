CREATE OR REPLACE FUNCTION public.get_business_data(business_handle text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    var_business_id uuid;
    result jsonb;
BEGIN
    -- Get the business ID based on the handle.
    SELECT id INTO var_business_id FROM public.business WHERE handle = business_handle;

    -- Initialize the result JSON object.
    result := '{}'::jsonb;

    -- Add services to the result with color derived from service_group.
    result = jsonb_set(result, '{services}', (
        SELECT jsonb_agg(
            jsonb_set(
                jsonb_build_object(
                    'id', s.id,
                    'title', s.title,
                    'description', s.description,
                    'booking_limit', s.booking_limit,
                    'duration', s.duration,
                    'price', s.price
                ),
                '{color}', ('"' || sg.color || '"')::jsonb  -- Derive color from service_group
            )
        )
        FROM public.service s
        JOIN public.service_group sg ON s.service_group_id = sg.id
        WHERE sg.business_id = var_business_id
    ));

    -- Add staff to the result.
    result = jsonb_set(result, '{staffs}', (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', staff.id,
                'email', staff.email,
                'instagram_handle', staff.instagram_handle,
                'first_name', staff.first_name,
                'last_name', staff.last_name
            )
        )
        FROM public.staff staff
        WHERE staff.business_id = var_business_id
    ));

    -- Add service groups to the result.
    result = jsonb_set(result, '{service_groups}', (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', sg.id,
                'title', sg.title,
                'description', sg.description,
                'color', sg.color,
                'priority', sg.priority
            )
        )
        FROM public.service_group sg
        WHERE sg.business_id = var_business_id
    ));

    -- Return the final JSON object.
    RETURN result;
END;
$$;