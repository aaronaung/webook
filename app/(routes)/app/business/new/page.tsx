import BusinessProfileForm from "@/src/components/forms/business-profile-form";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";

export default async function NewBusiness() {
  const user = await getAuthUser({
    client: supaServerComponentClient(),
  });
  if (!user) {
    redirect("/login?return_path=/app/business/new");
  }

  return (
    <div className="px-1 pb-4">
      <BusinessProfileForm loggedInUser={user} />
    </div>
  );
}
