import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { deleteServiceCategory } from "../data/service";

export const useDeleteServiceCategory = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceCategoryId: string) => {
      return deleteServiceCategory(serviceCategoryId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete service category" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceCategories", businessId],
      });
    },
  });
};
