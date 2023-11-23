import { CurrentViewingBusinessProvider } from "@/src/contexts/current-viewing-business";
import { supaStaticRouteClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";

export default async function Layout({
  params,
  children,
}: {
  params: { businessHandle: string };
  children: React.ReactNode;
}) {
  const { data: business, ...props } = await supaStaticRouteClient
    .from("businesses")
    .select("*")
    .eq("handle", params.businessHandle)
    .single();

  if (!business) {
    // todo - redirect to 404.
    redirect("/");
  }

  return (
    <CurrentViewingBusinessProvider initialBusiness={business}>
      <div className="h-full bg-background">{children}</div>
    </CurrentViewingBusinessProvider>
  );
}
