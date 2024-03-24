import { Suspense } from "react";
import Navbar from "./_components/navbar";

import { navigation, userNavigation } from "./navigation";
import AuthProvider from "@/src/providers/auth-provider";
import { Spinner } from "@/src/components/common/loading-spinner";

// Everything under /app is auth protected in middleware.ts.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <AuthProvider>
        <Navbar navigation={navigation} userNavigation={userNavigation} />
        <div className="mx-auto h-full max-w-7xl p-4 sm:py-8 lg:flex lg:gap-x-2">
          <main className="h-full w-full overflow-x-auto py-2 pb-28 lg:flex-auto lg:px-0 lg:pb-16 lg:pt-0">
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </main>
        </div>
      </AuthProvider>
    </div>
  );
}
