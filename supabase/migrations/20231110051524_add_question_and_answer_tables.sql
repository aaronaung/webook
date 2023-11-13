create table "public"."booking_question_answers" (
    "booking_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "bool_answer" boolean,
    "text_answer" text,
    "select_answer" text,
    "multiselect_answer" text[],
    "question_id" uuid not null,
    "type" text not null
);


alter table "public"."booking_question_answers" enable row level security;

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

CREATE UNIQUE INDEX booking_question_answers_pkey ON public.booking_question_answers USING btree (booking_id, question_id);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX services_questions_pkey ON public.services_questions USING btree (service_id, question_id);

alter table "public"."booking_question_answers" add constraint "booking_question_answers_pkey" PRIMARY KEY using index "booking_question_answers_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."services_questions" add constraint "services_questions_pkey" PRIMARY KEY using index "services_questions_pkey";

alter table "public"."booking_question_answers" add constraint "booking_question_answers_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) not valid;

alter table "public"."booking_question_answers" validate constraint "booking_question_answers_booking_id_fkey";

alter table "public"."booking_question_answers" add constraint "booking_question_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) not valid;

alter table "public"."booking_question_answers" validate constraint "booking_question_answers_question_id_fkey";

alter table "public"."questions" add constraint "questions_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE not valid;

alter table "public"."questions" validate constraint "questions_business_id_fkey";

alter table "public"."services_questions" add constraint "services_questions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE not valid;

alter table "public"."services_questions" validate constraint "services_questions_question_id_fkey";

alter table "public"."services_questions" add constraint "services_questions_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE not valid;

alter table "public"."services_questions" validate constraint "services_questions_service_id_fkey";

create policy "Enable all for authenticated"
on "public"."booking_question_answers"
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



