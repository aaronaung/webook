import { useQuery } from "@tanstack/react-query";
import { getLoggedInUserBusinesses } from "../data/business";
import { supaClientComponentClient } from "../data/clients/browser";

export const useLoggedInUserBusinesses = () => {
  const { data, error, ...props } = useQuery({
    queryKey: ["get_logged_in_user_businesses"],
    queryFn: () =>
      getLoggedInUserBusinesses({
        client: supaClientComponentClient(),
      }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data };
};
