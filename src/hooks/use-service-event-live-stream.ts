import { useQuery } from "@tanstack/react-query";
import { supaClientComponentClient } from "../data/clients/browser";
import { getLiveStreamByServiceEventId } from "../data/live-stream";

export const useServiceEventLiveStream = (serviceEventId?: string) => {
  const {
    data: result,
    error,
    ...props
  } = useQuery({
    queryKey: ["serviceEventLiveStream", serviceEventId],
    queryFn: () => {
      if (!serviceEventId) {
        return null;
      }
      return getLiveStreamByServiceEventId(serviceEventId, {
        client: supaClientComponentClient(),
      });
    },
  });
  if (error) {
    console.error(error);
    // direct to error page. TODO: create error page.
  }
  return { ...props, data: result || [] };
};
