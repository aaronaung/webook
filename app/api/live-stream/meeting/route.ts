import getZoomAccessToken from "@/src/libs/zoom/get-access-token";
import { env } from "@/env.mjs";

import z from "zod";
import { NextRequest } from "next/server";
import { meetingTemplate } from "./template";
import { generatePassword } from "@/src/utils";

export const CreateLiveStreamMeetingRequestSchema = z.object({
  title: z.string(),
  start_time: z.string(),
  contact_email: z.string().email(),
  contact_name: z.string(),
  duration_in_milli: z.number().positive(),
});

export type CreateLiveStreamMeetingRequest = z.infer<
  typeof CreateLiveStreamMeetingRequestSchema
>;

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
