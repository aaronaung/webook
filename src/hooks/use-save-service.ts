import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveService } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSaveService = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newService: Partial<Tables<"service">>) => {
      return saveService(newService, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save service" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceGroups", businessId],
      });
    },
    onSettled,
  });
};
