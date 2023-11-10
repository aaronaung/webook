import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuestion } from "../data/question";
import { supaClientComponentClient } from "../data/clients/browser";

export const useDeleteQuestion = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => {
      return deleteQuestion(questionId, {
        client: supaClientComponentClient(),
      });
    },
    meta: { errorMessage: "Failed to delete Question" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", businessId],
      });
    },
  });
};
