import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceGroup } from "../api/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../api/clients/browser";
import { toast } from "../components/ui/use-toast";

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
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save service group: ${error.message}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["serviceGroups", businessId],
      });
    },
    onSettled,
  });
};
