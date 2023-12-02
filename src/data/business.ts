import { SupabaseOptions } from "./types";
import { throwOrData, throwOrJsonData } from "./util";
import { Tables } from "@/types/db.extension";

export type GetScheduledEventsInTimeRangeResponseSingle =
  Tables<"service_events"> & {
    color: string;
    staffs: Tables<"staffs">[];
    service: Tables<"services"> & { questions: Tables<"questions"> };
    live_stream?: Tables<"service_event_live_streams">;
  };
export type GetScheduledEventsInTimeRangeResponse =
  GetScheduledEventsInTimeRangeResponseSingle[];
export const getScheduledEventsInTimeRange = async (
  {
    businessHandle,
    start,
    end,
  }: { businessHandle: string; start: Date; end: Date },
  { client }: SupabaseOptions,
) => {
  return throwOrJsonData<GetScheduledEventsInTimeRangeResponse>(
    client.rpc("get_scheduled_events_in_time_range", {
      business_handle: businessHandle,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    }),
  );
};

export type GetBusinessDataResponse = {
  services: (Tables<"services"> & { questions: Tables<"questions"> })[];
  staffs: Tables<"staffs">[];
  availability_schedules: Tables<"availability_schedules">[];
};
export const getBusinessData = async (
  businessHandle: string,
  { client }: SupabaseOptions,
) => {
  return throwOrJsonData<GetBusinessDataResponse>(
    client.rpc("get_business_data", {
      business_handle: businessHandle,
    }),
  );
};

export const getBusinessByHandle = async (
  businessHandle: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("businesses")
      .select("*")
      .eq("handle", businessHandle)
      .maybeSingle(),
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
