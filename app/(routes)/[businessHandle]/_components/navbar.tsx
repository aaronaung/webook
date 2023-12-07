"use client";

import { Dialog } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Tables } from "@/types/db.extension";
import { Button } from "../../../../src/components/ui/button";
import { useRouter } from "next/navigation";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { customerNavigations } from "../navigation";
import Link from "next/link";
import { cn } from "@/src/utils";

export default function Navbar({
  business,
  user,
}: {
  business: Tables<"businesses">;
  user?: Tables<"users">;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCurrentViewingBusiness } = useCurrentViewingBusinessContext();
  const router = useRouter();

  useEffect(() => {
    setCurrentViewingBusiness(business);
  }, [setCurrentViewingBusiness, business]);

  const handleLogin = () => {
    const returnPath = encodeURIComponent(`/${business.handle}`);
    router.replace(`/login?return_path=${returnPath}`);
    router.refresh();
  };
  const handleLogout = async () => {
    await supaClientComponentClient().auth.signOut();
    router.refresh();
  };

  return (
    <header className="inset-x-0 top-0 z-50">
      <nav
        className="= flex items-center justify-between lg:px-8"
        aria-label="Global"
      >
        <div className="ml-auto flex">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog as="div" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-secondary px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">{business.title}</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-secondary-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-secondary-foreground/20">
              <div className="space-y-2 py-6">
                {customerNavigations(business.handle).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "hover:bg-secondary hover:text-primary",
                      "text-secondary-foreground hover:bg-secondary hover:text-primary",
                      "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-medium leading-6",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "hover:text-primary",
                        "text-secondary-foreground group-hover:text-primary",
                        "h-6 w-6 shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {!user && (
                  <Button onClick={handleLogin} className="rounded-lg">
                    Log in
                  </Button>
                )}
                {user && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleLogout}
                      className="rounded-lg hover:text-destructive"
                      variant={"secondary"}
                    >
                      <ArrowLeftOnRectangleIcon className="mr-2 h-6 w-6" /> Log
                      out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
