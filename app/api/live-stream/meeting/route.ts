import getZoomAccessToken from "@/src/libs/zoom/get-access-token";
import { env } from "@/env.mjs";

import { NextRequest } from "next/server";
import { meetingTemplate } from "./template";
import { generatePassword } from "@/src/utils";
import { CreateLiveStreamMeetingRequestSchema } from "@/src/api/schemas/meeting";

export async function POST(req: NextRequest) {
  const accessToken = await getZoomAccessToken({
    accountId: env.ZOOM_ACCOUNT_ID,
    clientId: env.ZOOM_CLIENT_ID,
    clientSecret: env.ZOOM_CLIENT_SECRET,
  });

  const reqBody = await req.json();
  const body = CreateLiveStreamMeetingRequestSchema.parse(reqBody);
  const meetingReq = {
    ...meetingTemplate,
    topic: body.title,
    agenda: body.title,
    start_time: body.start_time,
    contact_email: body.contact_email,
    contact_name: body.contact_name,
    duration: body.duration_in_milli / 1000 / 60,
    timezone: "America/Los_Angeles", // we might need to pass this from the client in the future.
    password: generatePassword(10),
  };

  const createResult = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    body: JSON.stringify(meetingReq),
    headers: {
      Authorization: `Bearer ${accessToken.access_token}`,
      "Content-Type": "application/json",
    },
  });

  const createResultJson = await createResult.json();

  return Response.json(createResultJson);
}
