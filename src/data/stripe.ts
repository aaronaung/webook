import { CheckOutRequest } from "@/app/api/stripe/check-out/dto/check-out.dto";
import { UpsertStripeProductRequest } from "@/app/api/stripe/products/dto/upsert-product.dto";
import Stripe from "stripe";

export const createStripeCheckoutSession = async (
  req: CheckOutRequest,
): Promise<Stripe.Checkout.Session> => {
  const resp = await fetch("/api/stripe/check-out", {
    method: "POST",
    body: JSON.stringify(req),
  });

  return resp.json();
};

export const upsertStripeProduct = async (
  req: UpsertStripeProductRequest,
): Promise<Stripe.Product> => {
  const resp = await fetch("/api/stripe/products/upsert", {
    method: "POST",
    body: JSON.stringify(req),
  });

  return resp.json();
};

export const deleteStripeProduct = async (
  stripeProductId: string,
): Promise<void> => {
  const resp = await fetch(`/api/stripe/products/${stripeProductId}`, {
    method: "DELETE",
  });

  return resp.json();
};
export const getStripeAccount = async (
  stripeAccountId: string,
): Promise<Stripe.Account> => {
  const resp = await fetch(`/api/stripe/accounts/${stripeAccountId}`);
  return resp.json();
};
