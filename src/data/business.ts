import { SupabaseOptions } from "./types";

export const getBusinessScheduleByTimeRange = async (
  businessHandle: string,
  start: Date,
  end: Date,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client.rpc("get_business_schedule_in_range", {
    business_handle: businessHandle,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });
  if (error) throw error;
  return data;
};

export const getBusinessData = async (
  businessHandle: string,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client.rpc("get_business_data", {
    business_handle: businessHandle,
  });
  if (error) throw error;
  return data;
};

export const getLoggedInUserBusinesses = async ({
  client,
}: SupabaseOptions) => {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (!user) {
    return {
      user: null,
      businesses: [],
    };
  }
  if (userError) throw userError;

  const { data: businesses, error: businessesError } = await client
    .from("businesses")
    .select("*")
    .eq("owner_id", user?.id);
  if (businessesError) throw businessesError;

  return { user, businesses };
};
