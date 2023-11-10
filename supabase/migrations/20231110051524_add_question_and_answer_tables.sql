create table "public"."booking_question_answer" (
    "booking_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "bool_answer" boolean,
    "text_answer" text,
    "select_answer" text,
    "multiselect_answer" text[],
    "question_id" uuid not null,
    "type" smallint not null
);


alter table "public"."booking_question_answer" enable row level security;

create table "public"."question" (
    "created_at" timestamp with time zone default now(),
    "question" text not null,
    "type" smallint not null,
    "required" boolean default false,
    "enabled" boolean default false,
    "options" text[],
    "id" uuid not null default gen_random_uuid(),
    "business_id" uuid not null
);


alter table "public"."question" enable row level security;

create table "public"."service_question" (
    "service_id" uuid not null,
    "question_id" uuid not null
);


alter table "public"."service_question" enable row level security;

CREATE UNIQUE INDEX booking_question_answer_pkey ON public.booking_question_answer USING btree (booking_id, question_id);

CREATE UNIQUE INDEX question_pkey ON public.question USING btree (id);

CREATE UNIQUE INDEX service_question_pkey ON public.service_question USING btree (service_id, question_id);

alter table "public"."booking_question_answer" add constraint "booking_question_answer_pkey" PRIMARY KEY using index "booking_question_answer_pkey";

alter table "public"."question" add constraint "question_pkey" PRIMARY KEY using index "question_pkey";

alter table "public"."service_question" add constraint "service_question_pkey" PRIMARY KEY using index "service_question_pkey";

alter table "public"."booking_question_answer" add constraint "booking_question_answer_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES booking(id) not valid;

alter table "public"."booking_question_answer" validate constraint "booking_question_answer_booking_id_fkey";

alter table "public"."booking_question_answer" add constraint "booking_question_answer_question_id_fkey" FOREIGN KEY (question_id) REFERENCES question(id) not valid;

alter table "public"."booking_question_answer" validate constraint "booking_question_answer_question_id_fkey";

alter table "public"."question" add constraint "question_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE not valid;

alter table "public"."question" validate constraint "question_business_id_fkey";

alter table "public"."service_question" add constraint "service_question_question_id_fkey" FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE not valid;

alter table "public"."service_question" validate constraint "service_question_question_id_fkey";

alter table "public"."service_question" add constraint "service_question_service_id_fkey" FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE not valid;

alter table "public"."service_question" validate constraint "service_question_service_id_fkey";

create policy "Enable all for authenticated"
on "public"."booking_question_answer"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."question"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."service_question"
as permissive
for all
to authenticated
using (true)
with check (true);



