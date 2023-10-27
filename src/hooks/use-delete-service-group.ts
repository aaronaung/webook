import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { deleteServiceGroup } from "../data/service";

export const useDeleteServiceGroup = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceGroupId: string) => {
      return deleteServiceGroup(serviceGroupId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete service group" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceGroups", businessId],
      });
    },
  });
};
