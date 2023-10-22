import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../api/clients/browser";
import { getStaffs } from "../api/staff";

export const useStaffs = (businessId: string) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: ["staffs", businessId],
    queryFn: () =>
      getStaffs(businessId, {
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
