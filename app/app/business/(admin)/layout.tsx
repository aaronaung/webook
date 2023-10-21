"use client";

import { CurrentBusinessProvider } from "@/src/contexts/current-business";
import EmptyState from "@/src/components/pages/app/business/empty-state";
import Navbar from "@/src/components/pages/app/business/navbar";
import { useLoggedInUserBusinesses } from "@/src/hooks/use-logged-in-user-businesses";
import _ from "lodash";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useLoggedInUserBusinesses();

  if (isLoading) {
    return <>Loading...</>;
  }
  if (_.isEmpty(data?.businesses) && !isLoading) {
    return <EmptyState />;
  }

  return (
    <CurrentBusinessProvider initialBusinesses={data?.businesses || []}>
      <div className="mx-auto h-full max-w-7xl px-4 lg:flex lg:gap-x-2">
        <Navbar businesses={data?.businesses || []} />
        <main className="max-h-full px-4 py-4 pb-28 sm:px-6 lg:flex-auto lg:px-0 lg:pb-16 lg:pt-0">
          {children}
        </main>
      </div>
    </CurrentBusinessProvider>
  );
}
