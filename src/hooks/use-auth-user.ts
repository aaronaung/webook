import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { getAuthUser } from "../data/user";

export const useAuthUser = () => {
  const { data, error, ...props } = useQuery({
    queryKey: ["auth_user"],
    queryFn: () => getAuthUser({ client: supaClientComponentClient() }),
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return {
    ...props,
    data,
  };
};
