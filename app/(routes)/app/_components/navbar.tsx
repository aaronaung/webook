"use client";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { cn } from "@/src/utils";
import { Fragment } from "react";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useRouter } from "next/navigation";
import {
  AppType,
  CurrentAppProvider,
  useCurrentAppContext,
} from "@/src/contexts/current-app";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Tables } from "@/types/db";

export default function Navbar({
  user,
  userHasABusiness,
}: {
  user: Tables<"users">;
  userHasABusiness: boolean;
}) {
  return (
    <CurrentAppProvider initialApp={AppType.Student}>
      <NavbarContent user={user} userHasABusiness={userHasABusiness} />
    </CurrentAppProvider>
  );
}

const NavbarContent = ({
  user,
  userHasABusiness,
}: {
  user: Tables<"users">;
  userHasABusiness: boolean;
}) => {
  const { currentApp, switchApp } = useCurrentAppContext();
  const router = useRouter();

  return (
    <Disclosure as="nav" className="border-b border-gray-200 bg-background">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex w-full items-center">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
                    alt="Your Company"
                  />
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* <ModeToggle /> */}
                  <div>
                    {!userHasABusiness && (
                      <Link href={`/app/business/new`}>
                        <Button className="rounded-full">
                          Become an instructor
                        </Button>
                      </Link>
                    )}
                  </div>
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={
                            user?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${user?.first_name} ${user?.last_name}`
                          }
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userHasABusiness && (
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={async () => {
                                  const appToSwitchTo =
                                    currentApp === AppType.Student
                                      ? AppType.Instructor
                                      : AppType.Student;

                                  switchApp(appToSwitchTo);
                                }}
                                className={cn(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700",
                                  "cursor-pointer",
                                )}
                              >
                                {currentApp === AppType.Student
                                  ? "Switch to instructor app"
                                  : "Switch to student app"}
                              </a>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              onClick={async () => {
                                await supaClientComponentClient().auth.signOut();
                                router.push("/login");
                              }}
                              className={cn(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700",
                                "cursor-pointer",
                              )}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
};
