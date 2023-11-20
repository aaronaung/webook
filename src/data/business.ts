import { BusinessData, BusinessSchedule } from "@/types";
import { SupabaseOptions } from "./types";
import { throwOrJsonData } from "./util";

export const getBusinessScheduleByTimeRange = async (
  {
    businessHandle,
    start,
    end,
  }: { businessHandle: string; start: Date; end: Date },
  { client }: SupabaseOptions,
) => {
  return throwOrJsonData<BusinessSchedule>(
    client.rpc("get_business_schedule_in_range", {
      business_handle: businessHandle,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    }),
  );
};

export const getBusinessData = async (
  businessHandle: string,
  { client }: SupabaseOptions,
) => {
  return throwOrJsonData<BusinessData>(
    client.rpc("get_business_data", {
      business_handle: businessHandle,
    }),
  );
};

export const getLoggedInUserBusinesses = async ({
  client,
}: SupabaseOptions) => {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    return {
      user: null,
      businesses: [],
    };
  }

  const { data: businesses, error: businessesError } = await client
    .from("businesses")
    .select("*")
    .eq("owner_id", user?.id);
  if (businessesError) throw businessesError;

  return { user, businesses };
};
