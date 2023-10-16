"use client";

import { CurrentBusinessProvider } from "@/components/contexts/current-business";
import EmptyState from "@/components/pages/app/business/empty-state";
import Navbar from "@/components/pages/app/business/navbar/navbar";
import { useLoggedInUserBusinesses } from "@/lib/hooks/use-logged-in-user-businesses";
import _ from "lodash";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useLoggedInUserBusinesses();

  if (_.isEmpty(data?.businesses) && !isLoading) {
    return <EmptyState />;
  }

  return (
    <CurrentBusinessProvider initialBusinesses={data?.businesses || []}>
      <div className="mx-auto h-full max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
        <Navbar businesses={data?.businesses || []} />
        <main className="px-4 py-4 sm:px-6 lg:flex-auto lg:px-0 lg:pt-0">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>{children}</div>
          </div>
        </main>
      </div>
    </CurrentBusinessProvider>
  );
}
