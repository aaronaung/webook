import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwIfError } from "./util";

export const getStaffs = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("staffs")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  );
};

export const saveStaff = async (
  staff: Partial<Tables<"staffs">>,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("staffs")
      .upsert({ ...(staff as Tables<"staffs">) })
      .select(),
  );
};

export const deleteStaff = async (
  staffId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(client.from("staffs").delete().eq("id", staffId));
};
