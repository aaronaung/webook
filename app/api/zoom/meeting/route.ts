import getZoomAccessToken from "@/src/libs/zoom/get-access-token";
import { NextRequest } from "next/server";
import { env } from "@/env.mjs";

const exampleReq = {
  agenda: "My Meeting",
  default_password: false,
  duration: 60,
  password: "123456",
  settings: {
    allow_multiple_devices: true,
    // alternative_hosts: "aaronaung.95@gmail.com", this user needs to be licensed
    // alternative_hosts_email_notification: true,
    approval_type: 2, // no registration required.
    auto_recording: "cloud",
    contact_email: "aaronaung.95@gmail.com",
    contact_name: "Aaron Aung",
    encryption_type: "enhanced_encryption",
    focus_mode: true,
    host_video: true,
    join_before_host: false,
    language_interpretation: {
      // ignored: only available for Business plan
      enable: true,
      interpreters: [
        {
          email: "interpreter@example.com",
          languages: "US,FR",
        },
      ],
    },
    sign_language_interpretation: {
      // ignored: only available for Business plan
      enable: true,
      interpreters: [
        {
          email: "interpreter@example.com",
          sign_language: "American",
        },
      ],
    },
    meeting_authentication: false,
    mute_upon_entry: true,
    participant_video: true,
    private_meeting: false,
    waiting_room: true,
    host_save_video_order: true,
    alternative_host_update_polls: true,
    continuous_meeting_chat: {
      enable: true,
      auto_add_invited_external_users: true,
    },
  },
  start_time: "2023-10-31T21:32:55Z",
  timezone: "America/Los_Angeles",
  topic: "One on one dance private session",
  type: 2,
};

export type CreateZoomMeetingRequest = {
  title: string;
  startTime: string;
  contactEmail: string;
  contactName: string;
};

export async function POST(req: NextRequest) {
  const accessToken = await getZoomAccessToken({
    accountId: env.ZOOM_ACCOUNT_ID,
    clientId: env.ZOOM_CLIENT_ID,
    clientSecret: env.ZOOM_CLIENT_SECRET,
  });

  // get access token
  // accountId: Vbn7wlmlSRixvW0DtSD6-Q
  // https://developers.zoom.us/docs/internal-apps/s2s-oauth/

  // create meeting using the access token
  // https://developers.zoom.us/docs/meeting-sdk/apis/#operation/meetingCreate

  const createResult = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    body: JSON.stringify(exampleReq),
    headers: {
      Authorization: `Bearer ${accessToken.access_token}`,
      "Content-Type": "application/json",
    },
  });

  const createResultJson = await createResult.json();

  return Response.json(createResultJson);
}
