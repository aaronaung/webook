import { CurrentViewingBusinessProvider } from "@/src/contexts/current-viewing-business";
import { getBusinessByHandle } from "@/src/data/business";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";

export default async function Layout({
  params,
  children,
}: {
  params: { businessHandle: string };
  children: React.ReactNode;
}) {
  const supabaseOptions = { client: supaServerComponentClient() };

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
      <div className="h-full bg-background">{children}</div>
    </CurrentViewingBusinessProvider>
  );
}
