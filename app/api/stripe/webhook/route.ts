import { env } from "@/env.mjs";
import { NextRequest } from "next/server";
import { stripeClient } from "..";
import Stripe from "stripe";

import { supaServerClient } from "@/src/data/clients/server";
import { throwOrData } from "@/src/data/util";
import { StripeCheckoutMetadata } from "../check-out";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;

  if (!sig) {
    return new Response("No stripe signature", { status: 400 });
  }

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const sessionCompleteEvent = event.data.object;
      console.log("checkout.session.completed", sessionCompleteEvent);
      break;
    case "payment_intent.succeeded":
      const paymentSuccessEvent = event.data.object;
      const metadata = paymentSuccessEvent.metadata as StripeCheckoutMetadata;

      await throwOrData(
        supaServerClient.from("user_stripe_products").upsert({
          stripe_product_id: metadata.stripe_product_id,
          user_id: metadata.user_id,
        }),
      );
      console.log("payment_intent.succeeded", paymentSuccessEvent, metadata);
      break;
    case "payment_intent.payment_failed":
      const paymentFailureEvent = event.data.object;
      console.log("checkout.session.async_payment_failed", paymentFailureEvent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response();
}
