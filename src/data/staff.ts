import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";

export const getStaffs = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const { data: staffs, error } = await client
    .from("staffs")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }
  return staffs;
};

export const saveStaff = async (
  staff: Partial<Tables<"staffs">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("staffs")
    .upsert({ ...(staff as Tables<"staffs">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteStaff = async (
  staffId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client.from("staffs").delete().eq("id", staffId);
  if (error) throw error;
};
