create table "public"."classes" (
    "id" uuid not null default gen_random_uuid(),
    "business_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "description" text,
    "price" bigint not null,
    "stripe_product_id" text unique,
    "stripe_price_id" text unique
);

create unique index "classes_pkey" on "public"."classes" using btree (id);

create policy "Enable classes read to all users"
on "public"."classes"
as permissive
for select
to public
using (true);


alter table "public"."classes" enable row level security;

alter table "public"."classes" add constraint "classes_business_id_fkey" foreign key ("business_id") references "public"."businesses"("id") on update cascade on delete cascade;

create table "public"."user_stripe_products" (
    "user_id" uuid not null,
    "stripe_product_id" text not null,
    "type" text not null,
    "created_at" timestamp with time zone default now()
);

create unique index "user_stripe_products_pkey" on "public"."user_stripe_products" using btree ("user_id", "stripe_product_id");

create policy "Enable all for authenticated users only"
on "public"."user_stripe_products"
as permissive
for all
to authenticated
using (true)
with check (true);


alter table "public"."user_stripe_products" enable row level security;

alter table "public"."user_stripe_products" add constraint "user_stripe_products_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on update cascade on delete cascade;

-- select * from classes as c join user_stripe_products as usp on c.stripe_product_id = usp.stripe_product_id where user_id;
