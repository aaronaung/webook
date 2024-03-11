import { z } from "zod";

export const CheckOutRequestSchema = z.object({
  productId: z.string(),
  businessHandle: z.string(),
  userId: z.string(),
});
export type CheckOutRequest = z.infer<typeof CheckOutRequestSchema>;
