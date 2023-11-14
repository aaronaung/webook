import { getAuthUser } from "@/src/data/user";
import Hero from "./_components/hero";
import Navbar from "./_components/navbar";
import { supaServerComponentClient } from "@/src/data/clients/server";

export default async function Home() {
  const user = await getAuthUser({ client: supaServerComponentClient() });

  return (
    <>
      <Navbar user={user ?? undefined} />
      <Hero />
    </>
  );
}
