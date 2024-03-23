import { Suspense } from "react";
import Navbar from "./_components/navbar";

import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";
import { getLoggedInUserBusinesses } from "@/src/data/business";

// Everything under /app is auth protected in middleware.ts.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseOptions = {
    client: supaServerComponentClient(),
  };
  const authUser = await getAuthUser(supabaseOptions);

  if (!authUser) {
    redirect("/login");
  }

  const { businesses } = await getLoggedInUserBusinesses(supabaseOptions);

  return (
    <div className="h-full overflow-hidden">
      <Navbar
        user={authUser}
        userHasABusiness={(businesses || []).length > 0}
      />
      <main className="h-full py-4 sm:py-10">
        <div className="mx-auto h-full max-w-7xl">
          <Suspense fallback={<>LOADING...</>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
