import Navbar from "./_components/navbar";
import { redirect } from "next/navigation";
import {
  supaServerComponentClient,
  supaStaticRouteClient,
} from "@/src/data/clients/server";
import Hero from "./_components/hero";
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

  const user = await getAuthUser({ client: supaServerComponentClient() });

  return (
    <>
      <Navbar business={business} user={user ?? undefined} />
      <Hero business={business} />
    </>
  );
}
