import { useQuery } from "@tanstack/react-query";
import { getBusinessScheduleByTimeRange } from "../data/business";
import { BusinessSchedule } from "../../types";
import { supaClientComponentClient } from "../data/clients/browser";

export const useBusinessScheduleByTimeRange = (
  businessHandle: string,
  start: Date,
  end: Date,
) => {
  const { data, error, ...props } = useQuery({
    queryKey: [businessHandle, start, end],
    queryFn: () =>
      getBusinessScheduleByTimeRange(businessHandle, start, end, {
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: data as BusinessSchedule };
};
