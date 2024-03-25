"use client";

import Image from "@/src/components/ui/image";
import { getBusinessLogoUrl } from "@/src/utils";
import { Tables } from "@/types/db.extension";

export default function BusinessLogo({
  business,
}: {
  business: Tables<"businesses">;
}) {
  return (
    <Image
      alt="logo"
      className="mb-2 mt-[44px] h-24 w-24 rounded-full"
      src={getBusinessLogoUrl(business.handle)}
      fallbackSrc={`https://ui-avatars.com/api/?name=${business?.title}}`}
    />
  );
}
