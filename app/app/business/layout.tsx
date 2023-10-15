import EmptyState from "@/components/pages/app/business/empty-state";
import Navbar from "@/components/pages/app/business/navbar/navbar";
import { getLoggedInUserBusinesses } from "@/lib/supabase/api/api";
import { supaServerComponentClient } from "@/lib/supabase/server-side";
import _ from "lodash";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { businesses } = await getLoggedInUserBusinesses({
    client: supaServerComponentClient(),
  });
  if (_.isEmpty(businesses)) {
    return <EmptyState />;
  }
  return (
    <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
      <Navbar />
      <main className="px-4 py-4 sm:px-6 lg:flex-auto lg:px-0 lg:pt-0">
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
