// NOTE: only server components should import anything from this file.
import { Database } from "@/types/db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export const supaServerComponentClient = () =>
  // cookies() can't be accessed in global scope, so the client cannot be a singleton.
  createServerComponentClient<Database>({
    cookies: () => cookies(),
  });

export const supaServerClient = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  env.SUPABASE_SERVICE_ROLE_KEY,
);
