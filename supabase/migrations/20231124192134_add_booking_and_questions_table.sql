create table "public"."bookings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "booker_id" uuid not null,
    "service_event_id" uuid, -- service_event_id is only be used for event based booking.
    "availability_based_service_id" uuid, -- availability based service id is only be used for availability based booking
    "start" timestamp with time zone not null, 
    "end" timestamp with time zone not null, 
    "business_id" uuid not null,
    "status" text not null default 'PENDING'::text,
    "chat_room_id" uuid not null
);


alter table "public"."bookings" enable row level security;

create table "public"."question_answers" (
    "created_at" timestamp with time zone default now(),
    "bool_answer" boolean,
    "text_answer" text,
    "select_answer" text,
    "multiselect_answer" text[],
    "question_id" uuid not null,
    "booking_id" uuid not null
);


alter table "public"."question_answers" enable row level security;

create table "public"."questions" (
    "created_at" timestamp with time zone default now(),
    "question" text not null,
    "type" text not null,
    "required" boolean default false,
    "enabled" boolean default false,
    "options" text[],
    "id" uuid not null default gen_random_uuid(),
    "business_id" uuid not null
);


alter table "public"."questions" enable row level security;

create table "public"."services_questions" (
    "service_id" uuid not null,
    "question_id" uuid not null
);


alter table "public"."services_questions" enable row level security;

-- same booker can't make multiple bookings that start at the same time.
CREATE UNIQUE INDEX bookings_booker_id_start_key ON public.bookings USING btree (booker_id, start);

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX question_answers_pkey ON public.question_answers USING btree (booking_id, question_id);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX services_questions_pkey ON public.services_questions USING btree (service_id, question_id);

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."question_answers" add constraint "question_answers_pkey" PRIMARY KEY using index "question_answers_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."services_questions" add constraint "services_questions_pkey" PRIMARY KEY using index "services_questions_pkey";

alter table "public"."bookings" add constraint "bookings_booker_id_fkey" FOREIGN KEY (booker_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."bookings" validate constraint "bookings_booker_id_fkey";

alter table "public"."bookings" add constraint "bookings_availability_based_service_id_fkey" FOREIGN KEY (availability_based_service_id) REFERENCES services(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_availability_based_service_id_fkey";

alter table "public"."bookings" add constraint "bookings_booker_id_start_key" UNIQUE using index "bookings_booker_id_start_key";

alter table "public"."bookings" add constraint "bookings_chat_room_id_fkey" FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_chat_room_id_fkey";

alter table "public"."bookings" add constraint "bookings_service_event_id_fkey" FOREIGN KEY (service_event_id) REFERENCES service_events(id) not valid;

alter table "public"."bookings" validate constraint "bookings_service_event_id_fkey";

alter table "public"."question_answers" add constraint "question_answers_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) not valid;

alter table "public"."question_answers" validate constraint "question_answers_booking_id_fkey";

alter table "public"."question_answers" add constraint "question_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) not valid;

alter table "public"."question_answers" validate constraint "question_answers_question_id_fkey";

alter table "public"."questions" add constraint "questions_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE not valid;

alter table "public"."questions" validate constraint "questions_business_id_fkey";

alter table "public"."services_questions" add constraint "services_questions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE not valid;

alter table "public"."services_questions" validate constraint "services_questions_question_id_fkey";

alter table "public"."services_questions" add constraint "services_questions_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE not valid;

alter table "public"."services_questions" validate constraint "services_questions_service_id_fkey";

create policy "Enable all for authenticated users only"
on "public"."bookings"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."question_answers"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."questions"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."services_questions"
as permissive
for all
to authenticated
using (true)
with check (true);



