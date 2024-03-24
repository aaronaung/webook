import { supaServerComponentClient } from "@/src/data/clients/server";
import { getAuthUser } from "@/src/data/user";
import { getBusinessByHandle } from "@/src/data/business";
import { redirect } from "next/navigation";
import { FacebookIcon, InstagramIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Tabs from "./_components/tabs";
import { getServices } from "@/src/data/service";
import BusinessLogo from "./_components/business-logo";
import Navbar from "./_components/navbar";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  params,
}: {
  params: { businessHandle: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const user = await getAuthUser(supabaseOptions);
  if (!user) {
    redirect(
      `/login?return_path=${encodeURIComponent(`/${params.businessHandle}`)}`,
    );
  }

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
      <div className="m-auto flex max-w-4xl flex-col gap-y-4 p-2">
        <div className="flex h-full flex-col rounded-lg p-2 sm:p-8 ">
          <Navbar business={business} user={user ?? undefined} />

          <div className="mx-auto flex w-[90%] flex-col items-center justify-center text-center">
            <BusinessLogo business={business}></BusinessLogo>
            <p className="mb-2 text-[38px] font-bold">{business.title}</p>
            {/** @ts-ignore */}
            <p style={{ textWrap: "balance" }}>{business.description}</p>
            <div className="mt-[20px] flex justify-center gap-x-3 text-muted-foreground">
              <Button className="p-2" variant={"ghost"}>
                <InstagramIcon />
              </Button>
              <Button className="p-2" variant={"ghost"}>
                <FacebookIcon />
              </Button>
            </div>
          </div>
          <Tabs
            user={user ?? undefined}
            business={business}
            services={services}
          />
        </div>
      </div>
    </div>
  );
}
