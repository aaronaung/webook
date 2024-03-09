import { z } from "zod";

export const CheckOutRequestSchema = z.object({
  serviceId: z.string(),
  businessHandle: z.string(),
});
export type CheckOutRequest = z.infer<typeof CheckOutRequestSchema>;
