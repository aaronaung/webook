import { Tables } from "@/types/db";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";
import { UpsertStripeProductRequest } from "@/app/api/stripe/products/dto/upsert-product.dto";
import { ProductType } from "@/app/api/stripe/products";
import { upsertStripeProduct } from "./stripe";

export const getClass = async (id: string, { client }: SupabaseOptions) => {
  return throwOrData(client.from("classes").select("*").eq("id", id).single());
};

export const listClasses = async ({ client }: SupabaseOptions) => {
  // TODO IMPLEMENT PAGINATION
  return throwOrData(client.from("classes").select("*"));
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
