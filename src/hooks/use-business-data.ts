import { useQuery } from "@tanstack/react-query";
import { getBusinessData } from "../data/business";
import { BusinessData } from "../../types";
import { supaClientComponentClient } from "../data/clients/browser";

export const useBusinessData = (businessHandle: string) => {
  const { data, error, ...props } = useQuery({
    queryKey: ["get_business_data", businessHandle],
    queryFn: () =>
      getBusinessData(businessHandle, {
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return {
    ...props,
    data: (data || {
      service_categories: [],
      services: [],
      staffs: [],
    }) as BusinessData,
  };
};
