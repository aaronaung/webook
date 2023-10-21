import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveService } from "../api/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../api/clients/browser";

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
