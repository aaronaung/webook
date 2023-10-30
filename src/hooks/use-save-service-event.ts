import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceEvent } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSaveServiceEvent = (
  businessHandle: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newServiceEvent: Partial<Tables<"service_event">>) => {
      return saveServiceEvent(newServiceEvent, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save service event" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [businessHandle], // todo (important): for now, we refetch the entire business schedule.
      });
    },
    onSettled,
  });
};
