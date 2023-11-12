import { CreateLiveStreamMeetingRequest } from "../api/schemas/meeting";
import { SupabaseOptions } from "./types";

export const getLiveStreamByServiceEventId = async (
  id: string,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_event_live_streams")
    .select()
    .eq("service_event_id", id);
  if (error) throw error;
  return data;
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

  const { error } = await client.from("service_event_live_streams").insert({
    service_event_id: id,
    join_url: parsedJoinUrl.toString(),
    start_url,
    password,
    start: req.start_time,
  });
  if (error) throw error;
};

export const deleteLiveStreamForServiceEvent = async (
  id: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("service_event_live_streams")
    .delete()
    .eq("service_event_id", id);
  if (error) throw error;
};
