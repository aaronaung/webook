create table "public"."booking" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "booker_id" uuid,
    "service_slot_id" uuid not null
);


alter table "public"."booking" enable row level security;

create table "public"."business" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "handle" text not null,
    "title" text not null,
    "description" text,
    "owner_id" uuid not null,
    "phone" text,
    "email" text,
    "inactive" boolean default false,
    "address" text,
    "city" text,
    "state" text,
    "zip" text,
    "country_code" text,
    "logo_url" text,
    "cover_photo_url" text
);


alter table "public"."business" enable row level security;

create table "public"."service" (
    "id" uuid not null default gen_random_uuid(),
    "service_group_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "booking_limit" bigint,
    "image_url" text,
    "duration" bigint not null,
    "price" bigint
);


alter table "public"."service" enable row level security;

create table "public"."service_group" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "priority" integer,
    "is_horizontal" boolean not null default false,
    "business_id" uuid not null
);


alter table "public"."service_group" enable row level security;

create table "public"."service_slot" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "service_id" uuid not null,
    "start" timestamp with time zone not null,
    "recurrence_start" timestamp with time zone ,
    "recurrence_interval" bigint,
    "recurrence_count" bigint,
    "image_url" text
);


alter table "public"."service_slot" enable row level security;

create table "public"."service_slot_staff" (
    "service_slot_id" uuid not null,
    "staff_id" uuid not null
);


alter table "public"."service_slot_staff" enable row level security;

create table "public"."staff" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text,
    "instagram_handle" text,
    "first_name" text not null default '',
    "last_name" text not null default '',
    "image_url" text,
    "business_id" uuid
);


alter table "public"."staff" enable row level security;

create table "public"."user" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text,
    "first_name" text,
    "last_name" text,
    "email_verified_at" timestamp with time zone
);


alter table "public"."user" enable row level security;

CREATE UNIQUE INDEX booking_pkey ON public.booking USING btree (id);

CREATE UNIQUE INDEX business_pkey ON public.business USING btree (id);

CREATE UNIQUE INDEX service_group_pkey ON public.service_group USING btree (id);

CREATE UNIQUE INDEX service_pkey ON public.service USING btree (id);

CREATE UNIQUE INDEX service_slot_pkey ON public.service_slot USING btree (id);

CREATE UNIQUE INDEX service_slot_staff_pkey ON public.service_slot_staff USING btree (service_slot_id, staff_id);

CREATE UNIQUE INDEX staff_pkey ON public.staff USING btree (id);

CREATE UNIQUE INDEX user_pkey ON public."user" USING btree (id);

alter table "public"."booking" add constraint "booking_pkey" PRIMARY KEY using index "booking_pkey";

alter table "public"."business" add constraint "business_pkey" PRIMARY KEY using index "business_pkey";

alter table "public"."service" add constraint "service_pkey" PRIMARY KEY using index "service_pkey";

alter table "public"."service_group" add constraint "service_group_pkey" PRIMARY KEY using index "service_group_pkey";

alter table "public"."service_slot" add constraint "service_slot_pkey" PRIMARY KEY using index "service_slot_pkey";

alter table "public"."service_slot_staff" add constraint "service_slot_staff_pkey" PRIMARY KEY using index "service_slot_staff_pkey";

alter table "public"."staff" add constraint "staff_pkey" PRIMARY KEY using index "staff_pkey";

alter table "public"."user" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."booking" add constraint "booking_booker_id_fkey" FOREIGN KEY (booker_id) REFERENCES business(id) not valid;

alter table "public"."booking" validate constraint "booking_booker_id_fkey";

alter table "public"."booking" add constraint "booking_service_slot_id_fkey" FOREIGN KEY (service_slot_id) REFERENCES service_slot(id) not valid;

alter table "public"."booking" validate constraint "booking_service_slot_id_fkey";

alter table "public"."business" add constraint "business_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE not valid;

alter table "public"."business" validate constraint "business_owner_id_fkey";

alter table "public"."service" add constraint "service_service_group_id_fkey" FOREIGN KEY (service_group_id) REFERENCES service_group(id) ON DELETE SET NULL not valid;

alter table "public"."service" validate constraint "service_service_group_id_fkey";

alter table "public"."service_group" add constraint "service_group_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE not valid;

alter table "public"."service_group" validate constraint "service_group_business_id_fkey";

alter table "public"."service_slot" add constraint "service_slot_service_id_fkey" FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE not valid;

alter table "public"."service_slot" validate constraint "service_slot_service_id_fkey";

alter table "public"."service_slot_staff" add constraint "service_slot_staff_service_slot_id_fkey" FOREIGN KEY (service_slot_id) REFERENCES service_slot(id) ON DELETE CASCADE not valid;

alter table "public"."service_slot_staff" validate constraint "service_slot_staff_service_slot_id_fkey";

alter table "public"."service_slot_staff" add constraint "service_slot_staff_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE not valid;

alter table "public"."service_slot_staff" validate constraint "service_slot_staff_staff_id_fkey";

alter table "public"."staff" add constraint "staff_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE not valid;

alter table "public"."staff" validate constraint "staff_business_id_fkey";

create policy "Enable read access for all users"
on "public"."business"
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
  insert into public.user (id) -- TODO (IMPORTANT): Collect other fields.
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

create policy "Enable upload access for authenticated users"
on storage.objects for insert to authenticated with check (
    -- restrict bucket
    bucket_id = 'public-business-assets'
);

create policy "Public Access"
on storage.objects
for select                              -- Allow read access
to anon, authenticated                  -- Allow access to anonymous and authenticated users
using ( bucket_id = 'my_bucket_id' );   -- Identify the bucket