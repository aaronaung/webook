create table "public"."bookings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "booker_id" uuid,
    "service_event_id" uuid not null,
    "status" text not null default 'pending'
);


alter table "public"."bookings" enable row level security;

create table "public"."businesses" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "handle" text not null,
    "title" text not null,
    "description" text,
    "owner_id" uuid not null,
    "phone" text,
    "email" text not null,
    "inactive" boolean default false,
    "address" text,
    "city" text,
    "state" text,
    "zip" text,
    "country_code" text,
    "logo_url" text,
    "cover_photo_url" text
);


alter table "public"."businesses" enable row level security;

create table "public"."services" (
    "id" uuid not null default gen_random_uuid(),
    "service_category_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "booking_limit" bigint,
    "duration" bigint not null,
    "price" bigint not null
);


alter table "public"."services" enable row level security;

create table "public"."service_categories" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "color" text not null,
    "priority" integer,
    "business_id" uuid not null
);


alter table "public"."service_categories" enable row level security;

create table "public"."service_events" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "service_id" uuid not null,
    "start" timestamp with time zone not null,
    "recurrence_start" timestamp with time zone,
    "recurrence_interval" bigint,
    "recurrence_count" bigint
);


alter table "public"."service_events" enable row level security;

create table "public"."service_events_staffs" (
    "service_event_id" uuid not null,
    "staff_id" uuid not null
);


alter table "public"."service_events_staffs" enable row level security;

create table "public"."staffs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text,
    "instagram_handle" text,
    "first_name" text not null default '',
    "last_name" text not null default '',
    "business_id" uuid
);


alter table "public"."staffs" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text,
    "first_name" text,
    "last_name" text,
    "email_verified_at" timestamp with time zone
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX businesses_pkey ON public.businesses USING btree (id);

CREATE UNIQUE INDEX businesses_handle_unique ON public.businesses USING btree (handle);

CREATE UNIQUE INDEX service_categories_pkey ON public.service_categories USING btree (id);

CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id);

CREATE UNIQUE INDEX service_events_pkey ON public.service_events USING btree (id);

CREATE UNIQUE INDEX service_events_staffs_pkey ON public.service_events_staffs USING btree (service_event_id, staff_id);

CREATE UNIQUE INDEX staffs_pkey ON public.staffs USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public."users" USING btree (id);

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."businesses" add constraint "businesses_pkey" PRIMARY KEY using index "businesses_pkey";

alter table "public"."services" add constraint "services_pkey" PRIMARY KEY using index "services_pkey";

alter table "public"."service_categories" add constraint "service_categories_pkey" PRIMARY KEY using index "service_categories_pkey";

alter table "public"."service_events" add constraint "service_events_pkey" PRIMARY KEY using index "service_events_pkey";

alter table "public"."service_events_staffs" add constraint "service_events_staffs_pkey" PRIMARY KEY using index "service_events_staffs_pkey";

alter table "public"."staffs" add constraint "staffs_pkey" PRIMARY KEY using index "staffs_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."bookings" add constraint "bookings_booker_id_fkey" FOREIGN KEY (booker_id) REFERENCES "users"(id) ON DELETE CASCADE not valid;

alter table "public"."bookings" validate constraint "bookings_booker_id_fkey";

alter table "public"."bookings" add constraint "bookings_service_event_id_fkey" FOREIGN KEY (service_event_id) REFERENCES service_events(id) not valid;

alter table "public"."bookings" validate constraint "bookings_service_event_id_fkey";

alter table "public"."businesses" add constraint "businesses_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES "users"(id) ON DELETE CASCADE not valid;

alter table "public"."businesses" validate constraint "businesses_owner_id_fkey";

alter table "public"."services" add constraint "services_service_category_id_fkey" FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_service_category_id_fkey";

alter table "public"."service_categories" add constraint "service_categories_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE not valid;

alter table "public"."service_categories" validate constraint "service_categories_business_id_fkey";

alter table "public"."service_events" add constraint "service_events_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE not valid;

alter table "public"."service_events" validate constraint "service_events_service_id_fkey";

alter table "public"."service_events_staffs" add constraint "service_events_staffs_service_event_id_fkey" FOREIGN KEY (service_event_id) REFERENCES service_events(id) ON DELETE CASCADE not valid;

alter table "public"."service_events_staffs" validate constraint "service_events_staffs_service_event_id_fkey";

alter table "public"."service_events_staffs" add constraint "service_events_staffs_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE not valid;

alter table "public"."service_events_staffs" validate constraint "service_events_staffs_staff_id_fkey";

alter table "public"."staffs" add constraint "staffs_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE not valid;

alter table "public"."staffs" validate constraint "staffs_business_id_fkey";

create policy "Enable read access for all users"
on "public"."businesses"
as permissive
for select
to public
using (true);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id) -- TODO (IMPORTANT): Collect other fields.
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create public business assets bucket.
insert into storage.buckets
  (id, name)
values
  ('public-business-assets', 'public-business-assets');

CREATE POLICY "Enable select to authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'public-business-assets');

CREATE POLICY "Enable insert to authenticated" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-business-assets');

CREATE POLICY "Enable update to authenticated" ON storage.objects FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'public-business-assets');

CREATE POLICY "Enable delete to authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'public-business-assets');

create policy "Read access to public-business-assets bucket to anon users"
on storage.objects
for select                              -- Allow read access
to anon                  -- Allow access to anonymous users
using ( bucket_id = 'public-business-access' );   -- Identify the bucket