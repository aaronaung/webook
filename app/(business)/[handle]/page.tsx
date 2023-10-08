import ServiceGroup from "./components/service-group";
import Navbar from "./components/landing/navbar";
import { redirect } from "next/navigation";
import { supaStaticRouteClient } from "@/lib/supabase";
import Hero from "./components/landing/hero";
import { BusinessServiceGroup } from "@/types";

export default async function ServiceProvider({
  params,
}: {
  params: { handle: string };
}) {
  const { data: business, ...props } = await supaStaticRouteClient
    .from("business")
    .select("*")
    .eq("handle", params.handle)
    .single();

  if (!business) {
    // todo - redirect to 404.
    redirect("/");
  }

  const { data: serviceGroupsJSON } = await supaStaticRouteClient.rpc(
    "get_today_business_schedule",
    {
      business_handle: business.handle,
    },
  );
  const serviceGroups = JSON.parse(JSON.stringify(serviceGroupsJSON));

  return (
    <>
      <Navbar business={business} />
      <Hero business={business} />
      <div className="bg-white p-8 text-gray-800 ">
        {serviceGroups.map(
          (serviceGroup: BusinessServiceGroup, index: number) => (
            <ServiceGroup
              key={serviceGroup.title + index}
              serviceGroup={serviceGroup}
              className="mb-8"
            />
          ),
        )}
      </div>
    </>
  );
}
