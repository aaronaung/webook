alter table "public"."service_events" add column "availability_schedule_id" uuid;

alter table "public"."service_events" add constraint "service_events_availability_schedule_id_fkey" FOREIGN KEY (availability_schedule_id) REFERENCES availability_schedules(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."service_events" validate constraint "service_events_availability_schedule_id_fkey";