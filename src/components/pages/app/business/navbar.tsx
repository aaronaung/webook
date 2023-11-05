"use client";
import { navigation } from "@/app/app/business/navigation";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { BUCKETS } from "@/src/consts/storage";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { cn } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({
  businesses,
}: {
  businesses: Tables<"business">[];
}) {
  const [selectedTab, setSelectedTab] = useState(navigation[0].name);
  const { currentBusiness, setCurrentBusiness } = useCurrentBusinessContext();
  const router = useRouter();
  const pathName = usePathname();

  const {
    data: { publicUrl: logoUrl },
  } = supaClientComponentClient()
    .storage.from(BUCKETS.publicBusinessAssets)
    .getPublicUrl(`logos/${currentBusiness?.handle}`, {
      transform: {
        width: 48,
        height: 48,
      },
    });

  return (
    <aside className="flex overflow-x-auto pb-4 lg:block lg:h-full lg:w-64 lg:flex-none">
      <nav className="flex-none px-4 sm:px-6 lg:h-full lg:px-0">
        <ul
          role="list"
          className="flex items-center gap-x-3 gap-y-1 whitespace-nowrap lg:h-full lg:flex-col"
        >
          {navigation.map((item) => (
            <li key={item.name} className="lg:w-48">
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  item.href === pathName
                    ? "bg-secondary text-primary"
                    : "text-secondary-foreground hover:bg-secondary hover:text-primary",
                  "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-medium leading-6",
                )}
              >
                <item.icon
                  className={cn(
                    item.href === pathName
                      ? "text-primary"
                      : "text-secondary-foreground group-hover:text-primary",
                    "h-6 w-6 shrink-0",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          ))}
          <li className="lg:mb-10 lg:mt-auto lg:w-48">
            {currentBusiness && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex cursor-pointer items-center gap-x-2 rounded-md py-2 pl-2 pr-3 font-medium hover:bg-secondary hover:text-primary ">
                      <Image
                        src={logoUrl}
                        alt="Logo"
                        className="h-8 w-8 rounded-full"
                        width={8}
                        height={8}
                      />
                      <p className="ml-1 overflow-hidden text-ellipsis text-sm">
                        {currentBusiness?.title}
                      </p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuRadioGroup
                      value={currentBusiness?.handle}
                      onValueChange={(handle) => {
                        const business = businesses.find(
                          (b) => b.handle === handle,
                        );
                        if (business) {
                          setCurrentBusiness(business);
                        }
                      }}
                    >
                      {businesses.map((business) => (
                        <DropdownMenuRadioItem
                          key={business.handle}
                          value={business.handle}
                          className="cursor-pointer"
                        >
                          {business.title}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <Button
                      onClick={() => router.push("/app/business/new")}
                      className="primary m-3"
                    >
                      <BuildingOfficeIcon className="h-6 w-6 shrink-0 hover:text-primary" />
                      New Business
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
