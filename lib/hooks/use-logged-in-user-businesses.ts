import { useQuery } from "@tanstack/react-query";
import { getLoggedInUserBusinesses } from "../supabase/api/api";
import { supaClientComponentClient } from "../supabase/client-side";

export const useLoggedInUserBusinesses = () => {
  const { data, error, ...props } = useQuery({
    queryKey: ["loggedInUserBusinesses"],
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
