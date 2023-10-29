import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceSlot } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSaveServiceSlot = (
  businessHandle: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newServiceSlot: Partial<Tables<"service_slot">>) => {
      return saveServiceSlot(newServiceSlot, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save service slot" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [businessHandle], // todo (important): for now, we refetch the entire business schedule.
      });
    },
    onSettled,
  });
};
