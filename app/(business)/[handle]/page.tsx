import Navbar from "@/src/components/pages/business/navbar";
import { redirect } from "next/navigation";
import { supaStaticRouteClient } from "@/src/data/clients/server";
import Hero from "@/src/components/pages/business/hero";

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

  return (
    <>
      <Navbar business={business} />
      <Hero business={business} />
    </>
  );
}
