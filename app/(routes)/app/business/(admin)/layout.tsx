"use client";

import { CurrentBusinessProvider } from "@/src/contexts/current-business";
import EmptyState from "@/src/components/shared/empty-state";
import Navbar from "./_components/navbar";
import _ from "lodash";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { getLoggedInUserBusinesses } from "@/src/data/business";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useSupaQuery(getLoggedInUserBusinesses);
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
