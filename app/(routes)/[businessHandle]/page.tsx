import { supaServerComponentClient } from "@/src/data/clients/server";
import { getBusinessByHandle } from "@/src/data/business";
import { redirect } from "next/navigation";
import { FacebookIcon, InstagramIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Tabs from "./_components/tabs";
import { getServices } from "@/src/data/service";
import BusinessLogo from "./_components/business-logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  params,
}: {
  params: { businessHandle: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };

  const business = await getBusinessByHandle(
    params.businessHandle,
    supabaseOptions,
  );

  if (!business) {
    console.error(`Business not found for handle: ${params.businessHandle}`);
    redirect("/");
  }

  const services = await getServices(business.id, supabaseOptions);

  return (
    <div>
      {/** <Hero business={business} /> */}

      <div className="mx-auto flex w-[90%] flex-col items-center justify-center text-center">
        <BusinessLogo business={business}></BusinessLogo>
        <p className="mb-2 text-[30px] font-bold">{business.title}</p>
        {/** @ts-ignore */}
        <p style={{ textWrap: "balance" }}>{business.description}</p>
        <div className="mt-[20px] flex justify-center gap-x-3 text-muted-foreground">
          {business.instagram_handle && (
            <Link href={`https://instagram.com/${business.instagram_handle}`}>
              <Button className="p-2" variant={"ghost"}>
                <InstagramIcon />
              </Button>
            </Link>
          )}
          {business.facebook_link && (
            <Link href={business.facebook_link}>
              <Button className="p-2" variant={"ghost"}>
                <FacebookIcon />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Tabs business={business} services={services} />
    </div>
  );
}
