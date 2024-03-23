import { NextRequest } from "next/server";
import { stripeClient } from "..";
import { CheckOutRequestSchema } from "./dto/check-out.dto";
import Stripe from "stripe";
import { StripeCheckoutMetadata } from ".";
import { StripeProductMetadata } from "../products";

export async function POST(req: NextRequest) {
  const { productId, businessStripeAccountId, userId, returnUrl } =
    CheckOutRequestSchema.parse(await req.json());

  const product = await stripeClient.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price: Stripe.Price = product.default_price as Stripe.Price;
  const checkoutMetadata: StripeCheckoutMetadata = {
    stripe_product_id: product.id,
    user_id: userId,
    product_type: (product.metadata as StripeProductMetadata).type,
  };

  const session = await stripeClient.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: (price.unit_amount ?? 0) * 0.1,
      transfer_data: {
        destination: businessStripeAccountId,
      },
      metadata: checkoutMetadata,
    },
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  return Response.json(session);
}
