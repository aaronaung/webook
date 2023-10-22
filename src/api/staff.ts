import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./api";

export const getStaffs = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const { data: staffs, error } = await client
    .from("staff")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }
  return staffs;
};

export const saveStaff = async (
  staff: Partial<Tables<"staff">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("staff")
    .upsert({ ...(staff as Tables<"staff">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteStaff = async (
  staffId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client.from("staff").delete().eq("id", staffId);
  if (error) throw error;
};
