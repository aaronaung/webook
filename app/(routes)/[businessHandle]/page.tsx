import { supaServerComponentClient } from "@/src/data/clients/server";
import { getAuthUser } from "@/src/data/user";
import { getBusinessByHandle } from "@/src/data/business";
import { redirect } from "next/navigation";
import { FacebookIcon, InstagramIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Tabs from "./_components/tabs";
import { getServices } from "@/src/data/service";
import BusinessLogo from "./_components/business-logo";

export default async function ServiceProvider({
  params,
}: {
  params: { businessHandle: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const user = await getAuthUser(supabaseOptions);

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
      {/* <Navbar business={business} user={user ?? undefined} />
      <Hero business={business} /> */}

      <div className="m-auto flex max-w-3xl flex-col gap-y-4 p-4">
        <div className="flex h-full flex-col items-center justify-center rounded-lg bg-secondary p-4 sm:p-8">
          <BusinessLogo business={business}></BusinessLogo>
          <div className="w-[90%] text-center">
            <p className="mb-2 text-[38px] font-bold">{business.title}</p>
            {/** @ts-ignore */}
            <p style={{ textWrap: "balance" }}>{business.description}</p>
          </div>
          <div className="mt-[20px] flex justify-center gap-x-3 text-muted-foreground">
            <Button className="p-2" variant={"ghost"}>
              <InstagramIcon />
            </Button>
            <Button className="p-2" variant={"ghost"}>
              <FacebookIcon />
            </Button>
          </div>
          <Tabs business={business} services={services} />
        </div>
      </div>
    </div>
  );
}
