import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteServiceEvent } from "../data/service";
import { supaClientComponentClient } from "../data/clients/browser";

export const useDeleteServiceEvent = (businessHandle?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceEventId: string) => {
      return deleteServiceEvent(serviceEventId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete service event" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [businessHandle],
      });
    },
  });
};
