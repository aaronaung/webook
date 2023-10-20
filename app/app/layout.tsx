import { navigation, userNavigation } from "./navigation";
import { Suspense } from "react";
import Navbar from "@/src/components/pages/app/navbar";
import { getAuthUser } from "@/src/api/user";
import { supaServerComponentClient } from "@/src/api/clients/server";
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
    <>
      <Navbar navigation={navigation} userNavigation={userNavigation} />
      <main className="h-full py-10">
        <div className="mx-auto h-full max-w-7xl">
          <Suspense fallback={<>LOADING...</>}>{children}</Suspense>
        </div>
      </main>
    </>
  );
}
