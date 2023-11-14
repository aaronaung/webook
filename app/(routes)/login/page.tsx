import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cn } from "@/src/utils";
import { buttonVariants } from "@/src/components/ui/button";
import UserAuthForm from "@/src/components/forms/user-auth-form";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { returnPath?: string; backPath?: string };
}) {
  const user = await getAuthUser({ client: supaServerComponentClient() });

  if (user) {
    redirect(searchParams.returnPath || "/app/business/schedule");
  }

  return (
    <>
      <Link
        href={searchParams.backPath || "/"}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-4 md:top-8",
        )}
      >
        <>
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <UserAuthForm returnPath={searchParams.returnPath} />
    </>
  );
}
