import { CreateLiveStreamMeetingRequest } from "../../app/api/live-stream/meeting/dto/create-live-stream-meeting.dto";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

export const getLiveStreamByServiceEventId = async (
  id: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("service_event_live_streams")
      .select()
      .eq("service_event_id", id),
  );
};

export const createLiveStreamForServiceEvent = async (
  id: string,
  req: CreateLiveStreamMeetingRequest,
  { client }: SupabaseOptions,
) => {
  const resp = await fetch("/api/live-stream/meeting", {
    method: "POST",
    body: JSON.stringify(req),
  });
  const { join_url, start_url, password } = await resp.json();

  const parsedJoinUrl = new URL(join_url);
  parsedJoinUrl.search = "";

  return throwOrData(
    client.from("service_event_live_streams").insert({
      service_event_id: id,
      join_url: parsedJoinUrl.toString(),
      start_url,
      password,
      start: req.start_time,
    }),
  );
};

export const deleteLiveStreamForServiceEvent = async (
  id: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("service_event_live_streams")
      .delete()
      .eq("service_event_id", id),
  );
};
