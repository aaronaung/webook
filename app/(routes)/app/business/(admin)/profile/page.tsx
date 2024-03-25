"use client";
import BusinessProfileForm from "@/src/components/forms/business-profile-form";
import { useAuthUser } from "@/src/contexts/auth";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { getBusinessLogoUrl } from "@/src/utils";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { currentBusiness, setCurrentBusiness } = useCurrentBusinessContext();
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>();
  const { user } = useAuthUser();

  useEffect(() => {
    fetch(getBusinessLogoUrl(currentBusiness.handle), {
      method: "HEAD",
    }).then((response) => {
      if (response.ok) {
        setBusinessLogoUrl(
          getBusinessLogoUrl(currentBusiness.handle, new Date().toISOString()),
        );
      }
    });
  });
  if (!user) {
    return <></>;
  }

  return (
    <div className="px-1">
      <BusinessProfileForm
        loggedInUser={user}
        defaultValues={{ ...currentBusiness, logoUrl: businessLogoUrl }}
      />
    </div>
  );
}
