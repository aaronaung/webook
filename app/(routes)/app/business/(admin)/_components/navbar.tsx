"use client";
import { sidebarNavigation } from "@/app/(routes)/app/business/navigation";
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
import { cn, getBusinessLogoUrl } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "@/src/components/ui/image";

export default function Navbar({
  businesses,
}: {
  businesses: Tables<"businesses">[];
}) {
  const { currentBusiness, setCurrentBusiness } = useCurrentBusinessContext();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="flex overflow-x-auto pb-4 lg:block lg:h-full lg:w-64 lg:flex-none">
      <nav className="flex-none sm:px-6 lg:h-full lg:px-0">
        <ul
          role="list"
          className="flex items-center gap-x-3 gap-y-1 whitespace-nowrap lg:h-full lg:flex-col"
        >
          {sidebarNavigation.map((item) => (
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
                  <DropdownMenuTrigger value={currentBusiness.handle} asChild>
                    <div className="flex cursor-pointer items-center gap-x-2 rounded-md py-2 pl-2 pr-3 font-medium hover:bg-secondary hover:text-primary ">
                      <Image
                        src={getBusinessLogoUrl(currentBusiness.handle)}
                        alt="Logo"
                        fallbackSrc={`https://ui-avatars.com/api/?name=${currentBusiness?.title}}`}
                        className="h-6 w-6 rounded-full object-cover sm:h-10 sm:w-10"
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
                        setCurrentBusiness(handle);
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
