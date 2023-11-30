drop policy "Enable all for authenticated" on "public"."services_availability_schedules";

alter table "public"."services_availability_schedules" drop constraint "services_availability_schedules_availability_schedule_id_fkey";

alter table "public"."services_availability_schedules" drop constraint "services_availability_schedules_service_id_fkey";

alter table "public"."services_availability_schedules" drop constraint "services_availability_schedules_pkey";

drop index if exists "public"."services_availability_schedules_pkey";

drop table "public"."services_availability_schedules";

alter table "public"."services" add column "availability_schedule_id" uuid;

alter table "public"."services" add constraint "services_availability_schedule_id_fkey" FOREIGN KEY (availability_schedule_id) REFERENCES availability_schedules(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_availability_schedule_id_fkey";


