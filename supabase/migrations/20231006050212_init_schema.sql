create table "public"."booking" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "booker_id" uuid,
    "service_slot_id" uuid
);


alter table "public"."booking" enable row level security;

create table "public"."service" (
    "id" uuid not null default gen_random_uuid(),
    "service_group_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "booking_limit" bigint,
    "price" bigint,
    "is_deleted" boolean not null default false
);


alter table "public"."service" enable row level security;

create table "public"."service_group" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "priority" integer,
    "is_deleted" boolean not null default false,
    "is_horizontal" boolean not null default false,
    "user_id" uuid not null
);


alter table "public"."service_group" enable row level security;

create table "public"."service_slot" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "service_id" uuid not null,
    "start" bigint not null,
    "duration" bigint not null,
    "repeat_start" bigint,
    "repeat_interval" bigint,
    "providers" json,
    "is_deleted" boolean not null default false
);


alter table "public"."service_slot" enable row level security;

create table "public"."user" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "handle" text not null,
    "email" text not null,
    "title" text,
    "description" text
);


alter table "public"."user" enable row level security;

CREATE UNIQUE INDEX booking_pkey ON public.booking USING btree (id);

CREATE UNIQUE INDEX service_group_pkey ON public.service_group USING btree (id);

CREATE UNIQUE INDEX service_pkey ON public.service USING btree (id);

CREATE UNIQUE INDEX service_slot_pkey ON public.service_slot USING btree (id);

CREATE UNIQUE INDEX user_pkey ON public."user" USING btree (id);

alter table "public"."booking" add constraint "booking_pkey" PRIMARY KEY using index "booking_pkey";

alter table "public"."service" add constraint "service_pkey" PRIMARY KEY using index "service_pkey";

alter table "public"."service_group" add constraint "service_group_pkey" PRIMARY KEY using index "service_group_pkey";

alter table "public"."service_slot" add constraint "service_slot_pkey" PRIMARY KEY using index "service_slot_pkey";

alter table "public"."user" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."booking" add constraint "booking_booker_id_fkey" FOREIGN KEY (booker_id) REFERENCES "user"(id) not valid;

alter table "public"."booking" validate constraint "booking_booker_id_fkey";

alter table "public"."booking" add constraint "booking_service_slot_id_fkey" FOREIGN KEY (service_slot_id) REFERENCES service_slot(id) not valid;

alter table "public"."booking" validate constraint "booking_service_slot_id_fkey";

alter table "public"."service" add constraint "service_service_group_id_fkey" FOREIGN KEY (service_group_id) REFERENCES service_group(id) ON DELETE CASCADE not valid;

alter table "public"."service" validate constraint "service_service_group_id_fkey";

alter table "public"."service_group" add constraint "service_group_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE not valid;

alter table "public"."service_group" validate constraint "service_group_user_id_fkey";

alter table "public"."service_slot" add constraint "service_slot_service_id_fkey" FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE not valid;

alter table "public"."service_slot" validate constraint "service_slot_service_id_fkey";


