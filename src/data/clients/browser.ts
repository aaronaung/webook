// NOTE: only client components should import anything from this file.
import { Database } from "@/types/db";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supaClientComponentClient =
  createClientComponentClient<Database>();
