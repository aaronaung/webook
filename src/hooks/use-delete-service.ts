import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService } from "../data/service";
import { supaClientComponentClient } from "../data/clients/browser";

export const useDeleteService = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => {
      return deleteService(serviceId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete service" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceGroups", businessId],
      });
    },
  });
};
