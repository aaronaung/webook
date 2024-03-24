CREATE OR REPLACE FUNCTION get_auth_user_classes()
RETURNS TABLE (
    id uuid,
    business_id uuid,
    business jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    title text,
    description text,
    price bigint,
    stripe_product_id text,
    stripe_price_id text,
    difficulty text
)
AS $$
DECLARE
    business_record jsonb;
BEGIN
    RETURN QUERY
    SELECT c.id,
           c.business_id,
           jsonb_build_object(
               'id', b.id,
               'handle', b.handle,
               'title', b.title,
               'description', b.description,
               'owner_id', b.owner_id,
               'phone', b.phone,
               'email', b.email,
               'inactive', b.inactive,
               'address', b.address,
               'city', b.city,
               'state', b.state,
               'zip', b.zip,
               'country_code', b.country_code,
               'logo_url', b.logo_url,
               'cover_photo_url', b.cover_photo_url,
               'stripe_account_id', b.stripe_account_id
           ) AS business,
           c.created_at,
           c.updated_at,
           c.title,
           c.description,
           c.price,
           c.stripe_product_id,
           c.stripe_price_id,
           c.difficulty
    FROM classes c
    JOIN user_stripe_products usp ON c.stripe_product_id = usp.stripe_product_id
    JOIN businesses b ON c.business_id = b.id
    WHERE usp.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_non_auth_user_classes()
RETURNS TABLE (
    id uuid,
    business_id uuid,
    business jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    title text,
    description text,
    price bigint,
    stripe_product_id text,
    stripe_price_id text,
    difficulty text
)
AS $$
DECLARE
    business_record jsonb;
BEGIN
    RETURN QUERY
    SELECT c.id,
           c.business_id,
           jsonb_build_object(
               'id', b.id,
               'handle', b.handle,
               'title', b.title,
               'description', b.description,
               'owner_id', b.owner_id,
               'phone', b.phone,
               'email', b.email,
               'inactive', b.inactive,
               'address', b.address,
               'city', b.city,
               'state', b.state,
               'zip', b.zip,
               'country_code', b.country_code,
               'logo_url', b.logo_url,
               'cover_photo_url', b.cover_photo_url,
               'stripe_account_id', b.stripe_account_id
           ) AS business,
           c.created_at,
           c.updated_at,
           c.title,
           c.description,
           c.price,
           c.stripe_product_id,
           c.stripe_price_id,
           c.difficulty
    FROM classes c
    JOIN user_stripe_products usp ON c.stripe_product_id = usp.stripe_product_id
    JOIN businesses b ON c.business_id = b.id
    WHERE usp.user_id != auth.uid();
END;
$$ LANGUAGE plpgsql;

