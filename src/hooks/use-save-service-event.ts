import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceEvent, saveServiceEventStaff } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";
import _ from "lodash";

export const useSaveServiceEvent = (
  businessHandle: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  // todo: optimistic update to prevent event jumping on calendar.
  return useMutation({
    mutationFn: async (
      newServiceEvent: Partial<Tables<"service_event">> & {
        staff_ids?: string[];
      },
    ) => {
      const data = await saveServiceEvent(
        _.omit(newServiceEvent, ["staff_ids"]),
        {
          client: supaClientComponentClient(),
        },
      );
      if (newServiceEvent.staff_ids) {
        await saveServiceEventStaff(data[0].id, newServiceEvent.staff_ids, {
          client: supaClientComponentClient(),
        });
      }
      return data;
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
