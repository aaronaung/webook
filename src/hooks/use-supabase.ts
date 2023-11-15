import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { SupabaseOptions } from "../data/types";
import { supaClientComponentClient } from "../data/clients/browser";

export function useSupaMutation<Args, Result>(
  fn: (args: Args, supaOptions: SupabaseOptions) => Promise<Result>,
  options: UseMutationOptions<Result, Error, Args, unknown> & {
    invalidate?: string[][];
    errorMessage?: string;
  } = {},
): UseMutationResult<Result, Error, Args, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mutationArgs: Args) =>
      fn(mutationArgs, { client: supaClientComponentClient() }),
    meta: { errorMessage: options.errorMessage || "Failed to run mutation." },
    onSuccess: () => {
      for (const queryKey of options.invalidate || []) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    ...options,
  });
}

export function useSupaQuery() {}
