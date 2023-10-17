import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../supabase/client-side";
import { getServiceGroupsWithServices } from "../supabase/api/service";

export const useServiceGroupsWithServices = (businessId: string) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: [businessId],
    queryFn: () =>
      getServiceGroupsWithServices(businessId, {
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
