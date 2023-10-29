import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteServiceSlot } from "../data/service";
import { supaClientComponentClient } from "../data/clients/browser";

export const useDeleteServiceSlot = (businessHandle?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceSlotId: string) => {
      return deleteServiceSlot(serviceSlotId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete service slot" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [businessHandle],
      });
    },
  });
};
