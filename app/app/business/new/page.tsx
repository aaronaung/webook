import BusinessProfileForm from "@/src/components/forms/business-profile-form";
import { getAuthUser } from "@/src/api/user";
import { supaServerComponentClient } from "@/src/api/clients/server";
import { redirect } from "next/navigation";

export default async function NewBusiness() {
  const user = await getAuthUser({ client: supaServerComponentClient() });
  if (!user) {
    redirect("/login");
  }
  return <BusinessProfileForm loggedInUser={user} />;
}
