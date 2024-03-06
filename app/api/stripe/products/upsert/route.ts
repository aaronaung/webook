import { NextRequest } from "next/server";
import { UpsertStripeProductRequestSchema } from "../dto/upsert-product.dto";
import { stripeClient } from "../..";

export async function POST(req: NextRequest) {
  console.log(req.nextUrl);
  const { id, name, priceData, description } =
    UpsertStripeProductRequestSchema.parse(await req.json());

  if (id) {
    // You can not change a price’s amount in the API.
    // Instead, we create a new price for the new amount, switch to the new price’s ID,
    // then update the old price to be inactive.
    let resp;
    if (priceData?.id && priceData?.unitAmount !== undefined) {
      // When price id is passed with the unit amount, we assume the caller is updating the price.
      const priceCreateResp = await stripeClient.prices.create({
        product: id,
        currency: "usd",
        unit_amount: priceData.unitAmount,
      });

      resp = await stripeClient.products.update(id, {
        name,
        ...(description ? { description } : {}),
        default_price: priceCreateResp.id,
      });

      // Once the default price is changed, we can archive the old price.
      await stripeClient.prices.update(priceData.id, {
        active: false,
      });
    } else {
      resp = await stripeClient.products.update(id, {
        name,
        ...(description ? { description } : {}),
      });
    }

    return Response.json(resp);
  } else {
    const resp = await stripeClient.products.create({
      name,
      ...(description ? { description } : {}),
      default_price_data: {
        currency: "usd",
        unit_amount: priceData?.unitAmount || 0,
      },
    });

    return Response.json(resp);
  }
}
