create table "public"."service_event_live_stream" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "service_event_id" uuid,
    "join_url" text,
    "password" text,
    "start_url" text,
    "start" timestamp with time zone not null
);

create policy "Enable all for authenticated users only"
on "public"."service_event_live_stream"
as permissive
for all
to authenticated
using (true)
with check (true);


alter table "public"."service_event_live_stream" enable row level security;

CREATE UNIQUE INDEX service_event_live_stream_pkey ON public.service_event_live_stream USING btree (id);

alter table "public"."service_event_live_stream" add constraint "service_event_live_stream_pkey" PRIMARY KEY using index "service_event_live_stream_pkey";

alter table "public"."service_event_live_stream" add constraint "service_event_live_stream_service_event_id_fkey" FOREIGN KEY (service_event_id) REFERENCES service_event(id) ON DELETE CASCADE not valid;

alter table "public"."service_event_live_stream" validate constraint "service_event_live_stream_service_event_id_fkey";

-- TODO VERY IMPORTANT - we need to encrypt the password and start_url so they don't leak and the meeting can't be hijacked. 