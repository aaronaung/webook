import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveService, saveServiceQuestion } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";
import _ from "lodash";

export const useSaveService = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      newService: Partial<Tables<"service">> & { question_ids?: string[] },
    ) => {
      const updatedSvc = await saveService(_.omit(newService, "question_ids"), {
        client: supaClientComponentClient(),
      });
      if (newService.question_ids !== undefined) {
        await saveServiceQuestion(updatedSvc[0].id, newService.question_ids, {
          client: supaClientComponentClient(),
        });
      }
      return updatedSvc;
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
