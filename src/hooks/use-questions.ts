import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { getQuestions } from "../data/question";

export const useQuestions = (businessId: string) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: ["questions", businessId],
    queryFn: () =>
      getQuestions(businessId, {
        client: supaClientComponentClient(),
      }),
  });

  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
