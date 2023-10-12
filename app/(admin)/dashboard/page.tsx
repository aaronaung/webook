import { getAuthUser } from "@/lib/supabase/api/api";
import { supaServerComponentClient } from "@/lib/supabase/server-side";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getAuthUser({ client: supaServerComponentClient() });

  if (!user) {
    redirect("/login");
  }
  return <>Dashboard</>;
}
