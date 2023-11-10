import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveQuestion } from "../data/question";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";

export const useSaveQuestion = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newQuestion: Partial<Tables<"question">>) => {
      return saveQuestion(newQuestion, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to save question" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", businessId],
      });
    },
    onSettled,
  });
};
