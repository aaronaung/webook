import { Tables } from "@/types/db";
import { SupabaseOptions } from "./types";
import { throwOrCount, throwOrData } from "./util";
import { UpsertStripeProductRequest } from "@/app/api/stripe/products/dto/upsert-product.dto";
import { ProductType } from "@/app/api/stripe/products";
import { upsertStripeProduct } from "./stripe";

export const getClass = async (
  { id, userId }: { id: string; userId?: string },
  { client }: SupabaseOptions,
) => {
  const danceClass = await throwOrData(
    client.from("classes").select("*").eq("id", id).single(),
  );
  if (!danceClass.stripe_product_id || !userId) {
    return {
      danceClass,
      isUserOwner: false,
    };
  }

  const isUserOwner =
    (await throwOrCount(
      client
        .from("user_stripe_products")
        .select("*", { count: "exact", head: true })
        .eq("stripe_product_id", danceClass.stripe_product_id)
        .eq("user_id", userId),
    )) > 0;

  return {
    danceClass,
    isUserOwner,
  };
};

export const listClasses = async ({ client }: SupabaseOptions) => {
  // TODO IMPLEMENT PAGINATION
  return throwOrData(
    client
      .from("classes")
      .select("*, business:businesses(*)")
      .order("created_at"),
  );
};

export const listClassProductIdsUserOwn = async (
  userId: string,
  { client }: SupabaseOptions,
) => {
  const ownedClassProductIds = await throwOrData(
    client
      .from("user_stripe_products")
      .select("stripe_product_id")
      .eq("user_id", userId)
      .eq("type", ProductType.Class),
  );

  return ownedClassProductIds.map((p) => p.stripe_product_id);
};

export const saveClass = async (
  {
    danceClass,
    priceChanged,
    titleChanged,
  }: {
    danceClass: Partial<Tables<"classes">>;
    priceChanged: boolean;
    titleChanged: boolean;
  },
  { client }: SupabaseOptions,
) => {
  let saved = await throwOrData(
    client
      .from("classes")
      .upsert({ ...(danceClass as Tables<"classes">) })
      .select("*")
      .limit(1)
      .single(),
  );

  if (titleChanged || priceChanged) {
    const upsertStripeProductReq: UpsertStripeProductRequest = {
      stripeProductId: saved.stripe_product_id,
      internalProductId: saved.id,
      name: saved.title,
      description: saved.description,
      priceData: priceChanged
        ? {
            id: saved.stripe_price_id,
            unitAmount: saved.price,
          }
        : null,
      type: ProductType.Class,
    };
    const upsertProductResp = await upsertStripeProduct(upsertStripeProductReq);
    await throwOrData(
      client
        .from("classes")
        .update({
          stripe_product_id: upsertProductResp.id,
          stripe_price_id: upsertProductResp.default_price?.toString(),
        })
        .eq("id", saved.id),
    );
  }

  return saved;
};
