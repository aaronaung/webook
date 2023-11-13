import Navbar from "@/src/components/pages/business/navbar";
import { redirect } from "next/navigation";
import { supaStaticRouteClient } from "@/src/data/clients/server";
import Hero from "@/src/components/pages/business/hero";
import { getAuthUser } from "@/src/data/user";

export default async function ServiceProvider({
  params,
}: {
  params: { businessHandle: string };
}) {
  const { data: business, ...props } = await supaStaticRouteClient
    .from("businesses")
    .select("*")
    .eq("handle", params.businessHandle)
    .single();

  if (!business) {
    // todo - redirect to 404.
    redirect("/");
  }

  const user = await getAuthUser({ client: supaStaticRouteClient });

  return (
    <>
      <Navbar business={business} />
      <Hero business={business} user={user ?? undefined} />
    </>
  );
}
