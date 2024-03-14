import { NextRequest } from "next/server";
import { stripeClient } from "..";
import { throwOrData } from "@/src/data/util";
import { supaServerClient } from "@/src/data/clients/server";
import { CheckOutRequestSchema } from "./dto/check-out.dto";
import Stripe from "stripe";
import { StripeCheckoutMetadata } from ".";
import { StripeProductMetadata } from "../products";

export async function POST(req: NextRequest) {
  const { productId, businessHandle, userId } = CheckOutRequestSchema.parse(
    await req.json(),
  );

  const { stripe_account_id } = await throwOrData(
    supaServerClient
      .from("businesses")
      .select("stripe_account_id")
      .eq("handle", businessHandle)
      .single(),
  );
  if (!stripe_account_id) {
    // TODO - We should disallow businesses from selling services if they haven't connected their stripe account.
    return new Response(
      `Stripe account doesn't exist for business ${businessHandle}.`,
      {
        status: 500,
      },
    );
  }
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
        destination: stripe_account_id,
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
    success_url: `${req.nextUrl.origin}/${businessHandle}`,
    cancel_url: `${req.nextUrl.origin}/${businessHandle}`,
  });

  return Response.json(session);
}
