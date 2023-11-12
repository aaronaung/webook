import BusinessProfileForm from "@/src/components/forms/business-profile-form";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";

export default async function NewBusiness() {
  const user = await getAuthUser({ client: supaServerComponentClient() });
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="h-full overflow-scroll px-6 pb-24">
      <BusinessProfileForm loggedInUser={user} />
    </div>
  );
}
