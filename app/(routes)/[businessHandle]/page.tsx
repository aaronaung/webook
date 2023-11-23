import Navbar from "./_components/navbar";
import { supaServerComponentClient } from "@/src/data/clients/server";
import Hero from "./_components/hero";
import { getAuthUser } from "@/src/data/user";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";

export default async function ServiceProvider({
  params,
}: {
  params: { businessHandle: string };
}) {
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();
  const user = await getAuthUser({ client: supaServerComponentClient() });

  return (
    <>
      <Navbar business={currentViewingBusiness} user={user ?? undefined} />
      <Hero business={currentViewingBusiness} />
    </>
  );
}
