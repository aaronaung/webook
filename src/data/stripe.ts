import { UpsertStripeProductRequest } from "@/app/api/stripe/products/dto/upsert-product.dto";
import Stripe from "stripe";

export const upsertStripeProduct = async (
  req: UpsertStripeProductRequest,
): Promise<Stripe.Product> => {
  const resp = await fetch("/api/stripe/products/upsert", {
    method: "POST",
    body: JSON.stringify(req),
  });

  return await resp.json();
};
