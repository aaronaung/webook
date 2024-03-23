import { Tables } from "@/types/db";
import { SupabaseOptions } from "./types";
import { throwOrCount, throwOrData, throwOrJsonData } from "./util";
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

export type ClassWithBusiness = Tables<"classes"> & {
  business: Tables<"businesses"> | null;
};

export const listAuthUserClasses = async ({
  client,
}: SupabaseOptions): Promise<ClassWithBusiness[]> => {
  // @ts-ignore - we can't correctly type the Json types in the response of postgres functions.
  return throwOrJsonData(client.rpc("get_auth_user_classes"));
};

export const listNonAuthUserClasses = async ({
  client,
}: SupabaseOptions): Promise<ClassWithBusiness[]> => {
  // @ts-ignore - we can't correctly type the Json types in the response of postgres functions.
  return throwOrJsonData(client.rpc("get_non_auth_user_classes"));
};

export const listClasses = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  // TODO IMPLEMENT PAGINATION
  return throwOrData(
    client
      .from("classes")
      .select("*, business:businesses(*)")
      .eq("business_id", businessId)
      .order("created_at"),
  );
};

export const getExploreClasses = async ({ client }: SupabaseOptions) => {
  // todo - for now, return all classe user doesn't own; implement pagination.
  const nonAuthUserClasses = await listNonAuthUserClasses({ client });
  const authUserClasses = await listAuthUserClasses({ client });

  // show nonAuthUserClasses first
  return {
    owned: authUserClasses,
    notOwned: nonAuthUserClasses,
  };
};

export const listClassProductIdsUserOwn = async (
  { userId }: { [key: string]: string | undefined },
  { client }: SupabaseOptions,
) => {
  if (!userId) {
    return [];
  }
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

export const deleteClass = async (
  danceClass: Tables<"classes">,
  { client }: SupabaseOptions,
) => {
  const resp = await throwOrData(
    client.from("classes").delete().eq("id", danceClass.id),
  );

  // CLEAN UP

  // if (danceClass.stripe_product_id) {
  //   await deleteStripeProduct(danceClass.stripe_product_id);
  // }

  // todo: delete assets related to the class
  return resp;
};
