import { useQuery } from "@tanstack/react-query";
import { getBusinessScheduleByTimeRange } from "../api/business";
import { BusinessSchedule } from "../../types";
import { supaClientComponentClient } from "../api/clients/browser";

export const useBusinessScheduleByTimeRange = (
  businessHandle: string,
  start: Date,
  end: Date,
) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: [businessHandle, start, end],
    queryFn: () =>
      getBusinessScheduleByTimeRange(businessHandle, start, end, {
        client: supaClientComponentClient(),
      }),
  });
  if (error || result?.error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result?.data as BusinessSchedule };
};
