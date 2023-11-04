import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { getStaffs } from "../data/staff";

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
  console.log("useStaffs");
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
