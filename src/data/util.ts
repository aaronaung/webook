import { Database } from "@/types/db";
import { PostgrestTransformBuilder } from "@supabase/postgrest-js";

export async function throwIfError<Result, Relationship>(
  fn: PostgrestTransformBuilder<Database["public"], any, Result, Relationship>,
) {
  const { data, error } = await fn;
  if (error) {
    throw error;
  }
  return data;
}
