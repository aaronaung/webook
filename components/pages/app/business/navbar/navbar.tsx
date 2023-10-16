"use client";
import { navigation } from "@/app/app/business/navigation";
import { useCurrentBusinessContext } from "@/components/contexts/current-business";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BUCKETS } from "@/lib/consts/storage";
import { supaClientComponentClient } from "@/lib/supabase/client-side";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/db.extension";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({
  businesses,
}: {
  businesses: Tables<"business">[];
}) {
  const [selectedTab, setSelectedTab] = useState(navigation[0].name);
  const { currentBusiness, setCurrentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

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
    <aside className="flex h-full overflow-x-auto border-b border-gray-900/5 pb-4 lg:block lg:w-64 lg:flex-none lg:border-0">
      <nav className="h-full flex-none px-4 sm:px-6 lg:px-0">
        <ul
          role="list"
          className="flex h-full gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
        >
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSelectedTab(item.name)}
                className={cn(
                  item.name === selectedTab
                    ? "bg-secondary text-primary"
                    : "text-secondary-foreground hover:bg-secondary hover:text-primary",
                  "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-medium leading-6",
                )}
              >
                <item.icon
                  className={cn(
                    item.name === selectedTab
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
          <li className="mb-10 mt-auto">
            {currentBusiness && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <li>
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
                    </li>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuRadioGroup
                      value={currentBusiness?.handle}
                      onValueChange={(handle) => {
                        setCurrentBusiness(
                          businesses.find((b) => b.handle === handle),
                        );
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
