import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveServiceEvent, saveServiceEventStaff } from "../data/service";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";
import _ from "lodash";
import {
  createLiveStreamForServiceEvent,
  deleteLiveStreamForServiceEvent,
} from "../data/live-stream";

export const useSaveServiceEvent = (
  business: Tables<"businesses">,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  // todo: optimistic update to prevent event jumping on calendar.
  return useMutation({
    mutationFn: async (
      newServiceEvent: Partial<Tables<"service_events">> & {
        staff_ids?: string[];
        live_stream_enabled?: boolean;
        service?: Tables<"services">;
      },
    ) => {
      const data = await saveServiceEvent(
        _.omit(newServiceEvent, [
          "staff_ids",
          "live_stream_enabled",
          "service",
        ]),
        {
          client: supaClientComponentClient(),
        },
      );
      if (newServiceEvent.staff_ids) {
        await saveServiceEventStaff(data[0].id, newServiceEvent.staff_ids, {
          client: supaClientComponentClient(),
        });
      }
      if (
        newServiceEvent.live_stream_enabled !== undefined &&
        newServiceEvent.service
      ) {
        if (newServiceEvent.live_stream_enabled) {
          await createLiveStreamForServiceEvent(
            data[0].id,
            {
              title: newServiceEvent.service.title,
              contact_email: business.email,
              contact_name: business.title,
              duration_in_milli: newServiceEvent.service.duration,
              start_time: newServiceEvent.start!,
            },
            {
              client: supaClientComponentClient(),
            },
          );
        } else {
          await deleteLiveStreamForServiceEvent(data[0].id, {
            client: supaClientComponentClient(),
          });
        }
      }

      return data;
    },
    meta: { errorMessage: "Failed to save service event" },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["get_business_schedule_in_range", business.handle], // todo (important): for now, we refetch the entire business schedule.
      });
      queryClient.invalidateQueries({
        queryKey: ["service_event_live_streams", data[0].id], // todo (important): for now, we refetch the entire business schedule.
      });
    },
    onSettled,
  });
};
