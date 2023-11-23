import { navigation, userNavigation } from "./navigation";
import { Suspense } from "react";
import Navbar from "./_components/navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <Navbar navigation={navigation} userNavigation={userNavigation} />
      <main className="h-full py-10">
        <div className="mx-auto h-full max-w-7xl">
          <Suspense fallback={<>LOADING...</>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
