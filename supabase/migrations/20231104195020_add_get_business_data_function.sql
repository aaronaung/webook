CREATE OR REPLACE FUNCTION public.get_business_data(business_handle text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    var_business_id uuid;
    services_data jsonb;
    staffs_data jsonb;
    availability_schedules_data jsonb;
    result jsonb;
BEGIN
    -- Get the business ID based on the handle.
    SELECT id INTO var_business_id FROM public.businesses WHERE handle = business_handle;

    -- Initialize the result JSON object.
    result := '{}'::jsonb;

    -- Fetch services data with color derived from service_categories.
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'title', s.title,
            'description', s.description,
            'booking_limit', s.booking_limit,
            'duration', s.duration,
            'price', s.price,
            'color', s.color,
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
            ),
            'availability_schedule_id', s.availability_schedule_id
        )), '[]'::jsonb)
    INTO services_data
    FROM public.services s
    WHERE s.business_id = var_business_id;

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
    FROM public.staffs staff
    WHERE staff.business_id = var_business_id;

    -- Fetch availability schedules.
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', availability_schedule.id,
            'name', availability_schedule.name
        )), '[]'::jsonb)
    INTO availability_schedules_data
    FROM public.availability_schedules availability_schedule
    WHERE availability_schedule.business_id = var_business_id;

    -- Append the data to the result object.
    result := jsonb_set(result, '{services}', services_data);
    result := jsonb_set(result, '{staffs}', staffs_data);
    result := jsonb_set(result, '{availability_schedules}', availability_schedules_data);

    -- Return the final JSON object.
    RETURN result;
END;
$$;