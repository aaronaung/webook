import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceGroup } from "../api/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../api/clients/browser";

export const useSaveServiceGroup = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newServiceGroup: Partial<Tables<"service_group">>) => {
      return saveServiceGroup(newServiceGroup, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save service group" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceGroups", businessId],
      });
    },
    onSettled,
  });
};
