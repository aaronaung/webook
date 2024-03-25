import { CurrentViewingBusinessProvider } from "@/src/contexts/current-viewing-business";
import { getBusinessByHandle } from "@/src/data/business";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";
import Navbar from "./_components/navbar";
import { getAuthUser } from "@/src/data/user";
import AuthProvider from "@/src/providers/auth-provider";

export default async function Layout({
  params,
  children,
}: {
  params: { businessHandle: string };
  children: React.ReactNode;
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const user = await getAuthUser(supabaseOptions);
  if (!user) {
    redirect(
      `/login?return_path=${encodeURIComponent(`/${params.businessHandle}`)}`,
    );
  }
  const business = await getBusinessByHandle(
    params.businessHandle,
    supabaseOptions,
  );
  if (!business) {
    console.error(`Business not found for handle: ${params.businessHandle}`);
    redirect("/");
  }

  return (
    <CurrentViewingBusinessProvider initialBusiness={business}>
      <AuthProvider>
        <div className="m-auto flex max-w-4xl flex-col gap-y-4 p-2">
          <div className="flex h-full flex-col rounded-lg p-2 sm:p-8 ">
            <Navbar business={business} user={user ?? undefined} />
            <div className="h-full bg-background">{children}</div>
          </div>
        </div>
      </AuthProvider>
    </CurrentViewingBusinessProvider>
  );
}
