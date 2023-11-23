import Navbar from "./_components/navbar";
import { supaServerComponentClient } from "@/src/data/clients/server";
import Hero from "./_components/hero";
import { getAuthUser } from "@/src/data/user";
import { getBusinessByHandle } from "@/src/data/business";
import { redirect } from "next/navigation";

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

  return (
    <>
      <Navbar business={business} user={user ?? undefined} />
      <Hero business={business} />
    </>
  );
}
