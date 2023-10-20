import { SupabaseOptions } from "./api";

export const getStaffs = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const { data: staffs, error } = await client
    .from("staff")
    .select("*")
    .eq("business_id", businessId);

  if (error) {
    throw error;
  }
  return staffs;
};
