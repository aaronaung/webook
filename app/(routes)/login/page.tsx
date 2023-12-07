import { Metadata } from "next";
import { redirect } from "next/navigation";

import UserAuthForm from "@/src/components/forms/user-auth-form";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { sidebarNavigation } from "../app/business/navigation";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { return_path?: string };
}) {
  const user = await getAuthUser({ client: supaServerComponentClient() });
  if (user) {
    redirect(searchParams.return_path || sidebarNavigation[0].href);
  }

  return <UserAuthForm returnPath={searchParams.return_path} />;
}
