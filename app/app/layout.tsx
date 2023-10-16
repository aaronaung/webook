import { navigation, userNavigation } from "./navigation";
import { Suspense } from "react";
import Navbar from "@/components/pages/app/navbar/navbar";
import { getAuthUser } from "@/lib/supabase/api/api";
import { supaServerComponentClient } from "@/lib/supabase/server-side";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser({
    client: supaServerComponentClient(),
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-full">
      <Navbar navigation={navigation} userNavigation={userNavigation} />

      <div className="h-full py-10">
        {/* <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header> */}
        <main className="h-full">
          <div className="mx-auto h-full max-w-7xl px-6 lg:px-8">
            <Suspense fallback={<>LOADING...</>}>{children}</Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
