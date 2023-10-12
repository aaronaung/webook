import Navbar from "@/components/pages/business/navbar/navbar";
import { redirect } from "next/navigation";
import { supaStaticRouteClient } from "@/lib/supabase/server-side";
import Hero from "@/components/pages/business/hero/hero";

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
