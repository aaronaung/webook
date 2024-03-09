import { NextRequest } from "next/server";
import { stripeClient } from "..";
import { throwOrData } from "@/src/data/util";
import { supaServerClient } from "@/src/data/clients/server";
import { CheckOutRequestSchema } from "./dto/check-out.dto";

export async function POST(req: NextRequest) {
  const { serviceId, businessHandle } = CheckOutRequestSchema.parse(
    await req.json(),
  );

  const { stripe_product_id, price } = await throwOrData(
    supaServerClient
      .from("services")
      .select("stripe_product_id, price")
      .eq("id", serviceId)
      .single(),
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
        statusText: "Internal Server Error",
      },
    );
  }

  if (!stripe_product_id) {
    // TODO - this shouldn't happen, every service should have a stripe product.
    // Make this field required in db.
    return new Response(
      `Stripe product doesn't exist for service ${serviceId}.`,
      {
        status: 500,
        statusText: "Internal Server Error",
      },
    );
  }
  const product = await stripeClient.products.retrieve(stripe_product_id);

  const session = await stripeClient.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: price * 0.1,
      transfer_data: {
        destination: stripe_account_id,
      },
    },
    line_items: [
      {
        price: product.default_price?.toString(),
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.nextUrl.origin}/${businessHandle}`,
    cancel_url: `${req.nextUrl.origin}/${businessHandle}`,
  });

  return Response.json(session);
}
