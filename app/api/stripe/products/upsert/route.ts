import { NextRequest } from "next/server";
import { UpsertStripeProductRequestSchema } from "../dto/upsert-product.dto";
import { stripeClient } from "../..";
import Stripe from "stripe";
import { StripeProductMetadata } from "..";

export async function POST(req: NextRequest) {
  const {
    stripeProductId,
    internalProductId,
    name,
    priceData,
    description,
    type,
  } = UpsertStripeProductRequestSchema.parse(await req.json());

  let resp: Stripe.Product;
  if (stripeProductId) {
    // You can not change a price’s amount in the API.
    // Instead, we create a new price for the new amount, switch to the new price’s ID,
    // then update the old price to be inactive.

    if (priceData?.id && priceData?.unitAmount !== undefined) {
      // When price id is passed with the unit amount, we assume the caller is updating the price.
      const priceCreateResp = await stripeClient.prices.create({
        product: stripeProductId,
        currency: "usd",
        unit_amount: priceData.unitAmount,
      });

      resp = await stripeClient.products.update(stripeProductId, {
        name,
        ...(description ? { description } : {}),
        default_price: priceCreateResp.id,
      });

      // Once the default price is changed, we can archive the old price.
      await stripeClient.prices.update(priceData.id, {
        active: false,
      });
    } else {
      resp = await stripeClient.products.update(stripeProductId, {
        name,
        ...(description ? { description } : {}),
      });
    }
  } else {
    const productMetadata: StripeProductMetadata = {
      type,
      internal_product_id: internalProductId,
    };

    resp = await stripeClient.products.create({
      name,
      ...(description ? { description } : {}),
      default_price_data: {
        currency: "usd",
        unit_amount: priceData?.unitAmount || 0,
      },
      metadata: productMetadata,
    });
  }

  return Response.json(resp);
}
