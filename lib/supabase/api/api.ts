import { Database } from "@/types/db";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseOptions = {
  client: SupabaseClient<Database>;
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

export const getBusinessesByOwnerId = async (
  userId: string,
  { client }: SupabaseOptions,
) => {
  const { data: businesses } = await client
    .from("business")
    .select("*")
    .eq("owner_id", userId);
  return businesses;
};

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

export const getAuthUser = async ({ client }: SupabaseOptions) => {
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
