"use client";
import BusinessProfileForm from "@/src/components/forms/business-profile-form";

import { redirect } from "next/navigation";
import { useAuthUser } from "@/src/contexts/auth";

export default function NewBusiness() {
  const { user } = useAuthUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-1 pb-24">
      <BusinessProfileForm loggedInUser={user} />
    </div>
  );
}
