import { NextRequest } from "next/server";
import { stripeClient } from "..";
import { OnboardRequestSchema } from "./dto/onboard";
import { supaServerClient } from "@/src/data/clients/server";
import { throwOrData } from "@/src/data/util";

export async function GET(req: NextRequest) {
  const { businessId, onSuccessReturnUrl } = OnboardRequestSchema.parse({
    businessId: req.nextUrl.searchParams.get("businessId"),
    onSuccessReturnUrl: req.nextUrl.searchParams.get("onSuccessReturnUrl"),
  });

  const [business] = await throwOrData(
    supaServerClient.from("businesses").select("*").eq("id", businessId),
  );

  let stripeAccountId = business.stripe_account_id;
  if (!stripeAccountId) {
    const accountCreateResp = await stripeClient.accounts.create({
      type: "express",
      business_profile: {
        name: business.title,
      },
      email: business.email,
      ...(business.country_code ? { country: business.country_code } : {}),
    });

    await throwOrData(
      supaServerClient
        .from("businesses")
        .update({
          stripe_account_id: accountCreateResp.id,
        })
        .eq("id", businessId),
    );
    stripeAccountId = accountCreateResp.id;
  }

  const linkCreateResp = await stripeClient.accountLinks.create({
    account: stripeAccountId,
    type: "account_onboarding",
    return_url: onSuccessReturnUrl,
    refresh_url: `${req.nextUrl.origin}`,
  });

  return Response.json(linkCreateResp);
}
