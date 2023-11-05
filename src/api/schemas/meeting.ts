import z from "zod";

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
