import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { getServiceCategoriesWithServices } from "../data/service";

export const useServiceCategoriesWithServices = (businessId: string) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: ["service_categories", businessId],
    queryFn: () =>
      getServiceCategoriesWithServices(businessId, {
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
