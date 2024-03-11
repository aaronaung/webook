alter table "public"."services" add column "stripe_product_id" text unique;
alter table "public"."services" add column "stripe_price_id" text unique;