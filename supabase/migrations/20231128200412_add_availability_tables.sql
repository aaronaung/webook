create table "public"."availability_schedules" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "business_id" uuid not null,
    "name" text not null,
    "updated_at" timestamp with time zone default now()
);


alter table "public"."availability_schedules" enable row level security;

create table "public"."availability_slot_overrides" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "start" integer not null,
    "end" integer not null,
    "date" timestamp with time zone not null,
    "availability_schedule_id" uuid not null
);


alter table "public"."availability_slot_overrides" enable row level security;

create table "public"."availability_weekly_slots" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "day" text not null,
    "start" integer not null,
    "end" integer not null,
    "updated_at" timestamp with time zone default now(),
    "availability_schedule_id" uuid not null
);


alter table "public"."availability_weekly_slots" enable row level security;

CREATE UNIQUE INDEX availability_schedules_pkey ON public.availability_schedules USING btree (id);

CREATE UNIQUE INDEX availability_slot_overrides_pkey ON public.availability_slot_overrides USING btree (id);

CREATE UNIQUE INDEX availability_weekly_slots_pkey ON public.availability_weekly_slots USING btree (id);

alter table "public"."availability_schedules" add constraint "availability_schedules_pkey" PRIMARY KEY using index "availability_schedules_pkey";

alter table "public"."availability_slot_overrides" add constraint "availability_slot_overrides_pkey" PRIMARY KEY using index "availability_slot_overrides_pkey";

alter table "public"."availability_weekly_slots" add constraint "availability_weekly_slots_pkey" PRIMARY KEY using index "availability_weekly_slots_pkey";

alter table "public"."availability_schedules" add constraint "availability_schedules_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."availability_schedules" validate constraint "availability_schedules_business_id_fkey";

alter table "public"."availability_slot_overrides" add constraint "availability_slot_overrides_availability_schedule_id_fkey" FOREIGN KEY (availability_schedule_id) REFERENCES availability_schedules(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."availability_slot_overrides" validate constraint "availability_slot_overrides_availability_schedule_id_fkey";

alter table "public"."availability_weekly_slots" add constraint "availability_weekly_slots_availability_schedule_id_fkey" FOREIGN KEY (availability_schedule_id) REFERENCES availability_schedules(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."availability_weekly_slots" validate constraint "availability_weekly_slots_availability_schedule_id_fkey";

alter table "public"."services" add column "availability_schedule_id" uuid;

alter table "public"."services" add constraint "services_availability_schedule_id_fkey" FOREIGN KEY (availability_schedule_id) REFERENCES availability_schedules(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_availability_schedule_id_fkey";

create policy "Enable all for authenticated"
on "public"."availability_schedules"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."availability_slot_overrides"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable all for authenticated"
on "public"."availability_weekly_slots"
as permissive
for all
to authenticated
using (true)
with check (true);

