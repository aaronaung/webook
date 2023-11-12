import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceCategory } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSaveServiceCategory = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newServiceCategory: Partial<Tables<"service_categories">>) => {
      return saveServiceCategory(newServiceCategory, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save service category" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceCategories", businessId],
      });
    },
    onSettled,
  });
};
