import BusinessProfileForm from "@/components/pages/app/business/business-profile-form";
import { getAuthUser } from "@/lib/supabase/api/user";
import { supaServerComponentClient } from "@/lib/supabase/server-side";
import { redirect } from "next/navigation";

export default async function NewBusiness() {
  const user = await getAuthUser({ client: supaServerComponentClient() });
  if (!user) {
    redirect("/login");
  }
  return <BusinessProfileForm loggedInUser={user} />;
}
