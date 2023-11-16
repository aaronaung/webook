import { Database, Json } from "@/types/db";
import { PostgrestTransformBuilder } from "@supabase/postgrest-js";

export async function throwIfError<Result>(
  fn: PostgrestTransformBuilder<Database["public"], any, Result>,
) {
  const { data, error } = await fn;
  if (error) {
    throw error;
  }
  return data;
}

// Note: this is a hacky way to get around the fact that the type of the result of a pg function is not known.
export async function throwIfPgFuncErr<Result>(
  fn: PostgrestTransformBuilder<Database["public"], any, Result | Json>,
) {
  const { data, error } = await fn;
  if (error) {
    throw error;
  }
  return data as Result;
}
