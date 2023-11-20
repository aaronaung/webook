import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";
import { BUCKETS, STORAGE_DIR_PATHS } from "../consts/storage";
import { sleep } from "../utils";

export const getStaffs = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("staffs")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  );
};

export const saveStaff = async (
  {
    staff,
    headshotFile,
  }: { staff: Partial<Tables<"staffs">>; headshotFile?: File },
  { client }: SupabaseOptions,
) => {
  const saved = await throwOrData(
    client
      .from("staffs")
      .upsert({ ...(staff as Tables<"staffs">) })
      .select(),
  );
  if (headshotFile) {
    const imgVersion = new Date(saved[0].updated_at!).getTime();
    await client.storage
      .from(BUCKETS.publicBusinessAssets)
      .upload(
        `${STORAGE_DIR_PATHS.staffHeadshots}/${saved[0].id}?version=${imgVersion}`,
        headshotFile,
        {
          upsert: true,
        },
      );
    await sleep(1000); // introduce artificial delay to let the image upload settle.
  }
  return saved;
};

export const deleteStaff = async (
  staffId: string,
  { client }: SupabaseOptions,
) => {
  await throwOrData(client.from("staffs").delete().eq("id", staffId));
  return client.storage
    .from(BUCKETS.publicBusinessAssets)
    .remove([`${STORAGE_DIR_PATHS.staffHeadshots}/${staffId}`]);
};
