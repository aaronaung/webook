import { SupabaseOptions } from "./api";

export const getBusinessScheduleByTimeRange = async (
  businessHandle: string,
  start: Date,
  end: Date,
  { client }: SupabaseOptions,
) => {
  return await client.rpc("get_business_schedule_in_range", {
    business_handle: businessHandle,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });
};

export const getLoggedInUserBusinesses = async ({
  client,
}: SupabaseOptions) => {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return {
      user: null,
      businesses: [],
    };
  }

  const { data: businesses } = await client
    .from("business")
    .select("*")
    .eq("owner_id", user?.id);
  return { user, businesses };
};
