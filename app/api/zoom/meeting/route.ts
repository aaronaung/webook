import getZoomAccessToken from "@/src/libs/zoom/get-access-token";
import { NextRequest } from "next/server";
import { env } from "@/env.mjs";

const exampleReq = {
  agenda: "My Meeting",
  default_password: false,
  duration: 60,
  password: "123456",
  pre_schedule: false,
  settings: {
    allow_multiple_devices: true,
    // alternative_hosts: "aaronaung.95@gmail.com", this user needs to be licensed
    alternative_hosts_email_notification: true,
    audio_conference_info: "test",
    auto_recording: "cloud",
    calendar_type: 1,
    close_registration: false,
    contact_email: "aaronaung.95@gmail.com",
    contact_name: "Aaron Aung",
    email_notification: true,
    encryption_type: "enhanced_encryption",
    focus_mode: true,
    host_video: true,
    jbh_time: 0,
    join_before_host: false,
    language_interpretation: {
      enable: true,
      interpreters: [
        {
          email: "interpreter@example.com",
          languages: "US,FR",
        },
      ],
    },
    sign_language_interpretation: {
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
    show_share_button: true,
    use_pmi: false,
    waiting_room: true,
    watermark: false,
    host_save_video_order: true,
    alternative_host_update_polls: true,
    internal_meeting: false,
    continuous_meeting_chat: {
      enable: true,
      auto_add_invited_external_users: true,
    },
    participant_focused_meeting: false,
    push_change_to_calendar: false,
    resources: [
      {
        resource_type: "whiteboard",
        resource_id: "X4Hy02w3QUOdskKofgb9Jg",
        permission_level: "editor",
      },
    ],
  },
  start_time: "2023-10-26T07:32:55Z",
  template_id: "Dv4YdINdTk+Z5RToadh5ug==",
  timezone: "America/Los_Angeles",
  topic: "My Meeting",
  tracking_fields: [
    {
      field: "field1",
      value: "value1",
    },
  ],
};

export async function POST(req: NextRequest) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

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
