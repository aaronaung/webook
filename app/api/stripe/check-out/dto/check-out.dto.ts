import { z } from "zod";

export const CheckOutRequestSchema = z.object({
  productId: z.string(),
  businessStripeAccountId: z.string(),
  userId: z.string(),
  returnUrl: z.string(),
});
export type CheckOutRequest = z.infer<typeof CheckOutRequestSchema>;
