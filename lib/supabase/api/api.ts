import { Database } from "@/types/db";
import { SupabaseClient } from "@supabase/supabase-js";

export const getBusinessScheduleByTimeRange = async (
  businessHandle: string,
  start: Date,
  end: Date,
  { client }: { client: SupabaseClient<Database> },
) => {
  return await client.rpc("get_business_schedule_in_range", {
    business_handle: businessHandle,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });
};
