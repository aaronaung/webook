"use client";

import { CurrentBusinessProvider } from "@/src/contexts/current-business";
import EmptyState from "@/src/components/pages/shared/empty-state";
import Navbar from "@/src/components/pages/app/business/navbar";
import { useLoggedInUserBusinesses } from "@/src/hooks/use-logged-in-user-businesses";
import _ from "lodash";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useLoggedInUserBusinesses();
  const router = useRouter();
  if (isLoading) {
    return <>Loading...</>;
  }
  if (_.isEmpty(data?.businesses) && !isLoading) {
    return (
      <EmptyState
        Icon={BuildingOffice2Icon}
        title="No businesses"
        description="Create one to get started."
        actionButtonText="New business"
        onAction={() => {
          router.push("/app/business/new");
        }}
      />
    );
  }

  return (
    <CurrentBusinessProvider initialBusinesses={data?.businesses || []}>
      <div className="mx-auto h-full max-w-7xl px-4 lg:flex lg:gap-x-2">
        <Navbar businesses={data?.businesses || []} />
        <main className="h-full w-full overflow-x-auto px-4 py-4 pb-28 sm:px-6 lg:flex-auto lg:px-0 lg:pb-16 lg:pt-0">
          {children}
        </main>
      </div>
    </CurrentBusinessProvider>
  );
}