import { Database } from "@/types/db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const supaServerComponentClient = () =>
  // cookies() can't be accessed in global scope, so the client cannot be a singleton.
  createServerComponentClient<Database>({
    cookies: () => cookies(),
  });

export const supaStaticRouteClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);
