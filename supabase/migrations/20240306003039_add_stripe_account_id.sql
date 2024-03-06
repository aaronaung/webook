
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "public";

ALTER SCHEMA "public" OWNER TO "pg_database_owner";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."get_business_data"("business_handle" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
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

ALTER FUNCTION "public"."get_business_data"("business_handle" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_scheduled_events_in_time_range"("business_handle" "text", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "availability_schedule_id_arg" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$

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
$$;

ALTER FUNCTION "public"."get_scheduled_events_in_time_range"("business_handle" "text", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "availability_schedule_id_arg" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id, email) 
  values (new.id, new.email);
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."availability_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."availability_schedules" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."availability_slot_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start" integer NOT NULL,
    "end" integer NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "availability_schedule_id" "uuid" NOT NULL
);

ALTER TABLE "public"."availability_slot_overrides" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."availability_weekly_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day" "text" NOT NULL,
    "start" integer NOT NULL,
    "end" integer NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "availability_schedule_id" "uuid" NOT NULL
);

ALTER TABLE "public"."availability_weekly_slots" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "booker_id" "uuid" NOT NULL,
    "service_event_id" "uuid",
    "service_id" "uuid" NOT NULL,
    "start" timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    "business_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "chat_room_id" "uuid" NOT NULL
);

ALTER TABLE "public"."bookings" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "handle" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "owner_id" "uuid" NOT NULL,
    "phone" "text",
    "email" "text" NOT NULL,
    "inactive" boolean DEFAULT false,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "country_code" "text",
    "logo_url" "text",
    "cover_photo_url" "text",
    "stripe_account_id" "text"
);

ALTER TABLE "public"."businesses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "content" "text",
    "room_id" "uuid" NOT NULL,
    "sender_user_id" "uuid",
    "sender_business_id" "uuid"
);

ALTER TABLE "public"."chat_messages" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."chat_room_participants" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_id" "uuid" NOT NULL
);

ALTER TABLE "public"."chat_room_participants" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."chat_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text"
);

ALTER TABLE "public"."chat_rooms" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."question_answers" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bool_answer" boolean,
    "text_answer" "text",
    "select_answer" "text",
    "multiselect_answer" "text"[],
    "question_id" "uuid" NOT NULL,
    "booking_id" "uuid" NOT NULL
);

ALTER TABLE "public"."question_answers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."questions" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "question" "text" NOT NULL,
    "type" "text" NOT NULL,
    "required" boolean DEFAULT false,
    "enabled" boolean DEFAULT false,
    "options" "text"[],
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL
);

ALTER TABLE "public"."questions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."service_event_live_streams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "service_event_id" "uuid",
    "join_url" "text",
    "password" "text",
    "start_url" "text",
    "start" timestamp with time zone NOT NULL
);

ALTER TABLE "public"."service_event_live_streams" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."service_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "service_id" "uuid" NOT NULL,
    "start" timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    "recurrence_start" timestamp with time zone,
    "recurrence_interval" bigint,
    "recurrence_count" bigint,
    "availability_schedule_id" "uuid"
);

ALTER TABLE "public"."service_events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."service_events_staffs" (
    "service_event_id" "uuid" NOT NULL,
    "staff_id" "uuid" NOT NULL
);

ALTER TABLE "public"."service_events_staffs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text",
    "booking_limit" bigint,
    "duration" bigint NOT NULL,
    "price" bigint NOT NULL,
    "color" "text",
    "availability_schedule_id" "uuid",
    "stripe_product_id" "text",
    "stripe_price_id" "text"
);

ALTER TABLE "public"."services" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."services_questions" (
    "service_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL
);

ALTER TABLE "public"."services_questions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."staffs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "instagram_handle" "text",
    "first_name" "text" DEFAULT ''::"text" NOT NULL,
    "last_name" "text" DEFAULT ''::"text" NOT NULL,
    "business_id" "uuid"
);

ALTER TABLE "public"."staffs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "email_verified_at" timestamp with time zone
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."availability_schedules"
    ADD CONSTRAINT "availability_schedules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."availability_slot_overrides"
    ADD CONSTRAINT "availability_slot_overrides_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."availability_weekly_slots"
    ADD CONSTRAINT "availability_weekly_slots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booker_id_start_key" UNIQUE ("booker_id", "start");

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."chat_room_participants"
    ADD CONSTRAINT "chat_room_participants_pkey" PRIMARY KEY ("room_id", "user_id", "business_id");

ALTER TABLE ONLY "public"."chat_rooms"
    ADD CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."question_answers"
    ADD CONSTRAINT "question_answers_pkey" PRIMARY KEY ("booking_id", "question_id");

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."service_event_live_streams"
    ADD CONSTRAINT "service_event_live_streams_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."service_events"
    ADD CONSTRAINT "service_events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."service_events_staffs"
    ADD CONSTRAINT "service_events_staffs_pkey" PRIMARY KEY ("service_event_id", "staff_id");

ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."services_questions"
    ADD CONSTRAINT "services_questions_pkey" PRIMARY KEY ("service_id", "question_id");

ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "businesses_handle_unique" ON "public"."businesses" USING "btree" ("handle");

ALTER TABLE ONLY "public"."availability_schedules"
    ADD CONSTRAINT "availability_schedules_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."availability_slot_overrides"
    ADD CONSTRAINT "availability_slot_overrides_availability_schedule_id_fkey" FOREIGN KEY ("availability_schedule_id") REFERENCES "public"."availability_schedules"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."availability_weekly_slots"
    ADD CONSTRAINT "availability_weekly_slots_availability_schedule_id_fkey" FOREIGN KEY ("availability_schedule_id") REFERENCES "public"."availability_schedules"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booker_id_fkey" FOREIGN KEY ("booker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_service_event_id_fkey" FOREIGN KEY ("service_event_id") REFERENCES "public"."service_events"("id");

ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_business_id_fkey" FOREIGN KEY ("sender_business_id") REFERENCES "public"."businesses"("id");

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."chat_room_participants"
    ADD CONSTRAINT "chat_room_participants_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");

ALTER TABLE ONLY "public"."chat_room_participants"
    ADD CONSTRAINT "chat_room_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chat_room_participants"
    ADD CONSTRAINT "chat_room_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."question_answers"
    ADD CONSTRAINT "question_answers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");

ALTER TABLE ONLY "public"."question_answers"
    ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."service_event_live_streams"
    ADD CONSTRAINT "service_event_live_streams_service_event_id_fkey" FOREIGN KEY ("service_event_id") REFERENCES "public"."service_events"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."service_events"
    ADD CONSTRAINT "service_events_availability_schedule_id_fkey" FOREIGN KEY ("availability_schedule_id") REFERENCES "public"."availability_schedules"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."service_events"
    ADD CONSTRAINT "service_events_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."service_events_staffs"
    ADD CONSTRAINT "service_events_staffs_service_event_id_fkey" FOREIGN KEY ("service_event_id") REFERENCES "public"."service_events"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."service_events_staffs"
    ADD CONSTRAINT "service_events_staffs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_availability_schedule_id_fkey" FOREIGN KEY ("availability_schedule_id") REFERENCES "public"."availability_schedules"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."services_questions"
    ADD CONSTRAINT "services_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."services_questions"
    ADD CONSTRAINT "services_questions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;

CREATE POLICY "Enable all for authenticated" ON "public"."availability_schedules" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."availability_slot_overrides" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."availability_weekly_slots" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."chat_messages" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."chat_room_participants" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."chat_rooms" TO "authenticated" USING (true);

CREATE POLICY "Enable all for authenticated" ON "public"."question_answers" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."questions" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated" ON "public"."services_questions" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated user" ON "public"."users" TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Enable all for authenticated users only" ON "public"."bookings" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users only" ON "public"."service_event_live_streams" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users only" ON "public"."service_events" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users only" ON "public"."service_events_staffs" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users only" ON "public"."services" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users only" ON "public"."staffs" TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable availability_schedules read for public" ON "public"."availability_schedules" FOR SELECT USING (true);

CREATE POLICY "Enable availability_slot_overrides read for public" ON "public"."availability_slot_overrides" FOR SELECT USING (true);

CREATE POLICY "Enable availability_weekly_slots read for public" ON "public"."availability_weekly_slots" FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."businesses" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable questions read for public" ON "public"."questions" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."businesses" FOR SELECT USING (true);

CREATE POLICY "Enable services read to all users" ON "public"."services" FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on email" ON "public"."businesses" FOR UPDATE USING (("auth"."uid"() = "owner_id"));

ALTER TABLE "public"."availability_schedules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."availability_slot_overrides" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."availability_weekly_slots" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chat_room_participants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chat_rooms" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."question_answers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_event_live_streams" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."service_events_staffs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."services_questions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."staffs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_business_data"("business_handle" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_business_data"("business_handle" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_business_data"("business_handle" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_scheduled_events_in_time_range"("business_handle" "text", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "availability_schedule_id_arg" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_scheduled_events_in_time_range"("business_handle" "text", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "availability_schedule_id_arg" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_scheduled_events_in_time_range"("business_handle" "text", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "availability_schedule_id_arg" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."availability_schedules" TO "anon";
GRANT ALL ON TABLE "public"."availability_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_schedules" TO "service_role";

GRANT ALL ON TABLE "public"."availability_slot_overrides" TO "anon";
GRANT ALL ON TABLE "public"."availability_slot_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_slot_overrides" TO "service_role";

GRANT ALL ON TABLE "public"."availability_weekly_slots" TO "anon";
GRANT ALL ON TABLE "public"."availability_weekly_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_weekly_slots" TO "service_role";

GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";

GRANT ALL ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT ALL ON TABLE "public"."businesses" TO "service_role";

GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";

GRANT ALL ON TABLE "public"."chat_room_participants" TO "anon";
GRANT ALL ON TABLE "public"."chat_room_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_room_participants" TO "service_role";

GRANT ALL ON TABLE "public"."chat_rooms" TO "anon";
GRANT ALL ON TABLE "public"."chat_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_rooms" TO "service_role";

GRANT ALL ON TABLE "public"."question_answers" TO "anon";
GRANT ALL ON TABLE "public"."question_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."question_answers" TO "service_role";

GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";

GRANT ALL ON TABLE "public"."service_event_live_streams" TO "anon";
GRANT ALL ON TABLE "public"."service_event_live_streams" TO "authenticated";
GRANT ALL ON TABLE "public"."service_event_live_streams" TO "service_role";

GRANT ALL ON TABLE "public"."service_events" TO "anon";
GRANT ALL ON TABLE "public"."service_events" TO "authenticated";
GRANT ALL ON TABLE "public"."service_events" TO "service_role";

GRANT ALL ON TABLE "public"."service_events_staffs" TO "anon";
GRANT ALL ON TABLE "public"."service_events_staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."service_events_staffs" TO "service_role";

GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";

GRANT ALL ON TABLE "public"."services_questions" TO "anon";
GRANT ALL ON TABLE "public"."services_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."services_questions" TO "service_role";

GRANT ALL ON TABLE "public"."staffs" TO "anon";
GRANT ALL ON TABLE "public"."staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."staffs" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
