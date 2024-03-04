import { z } from "zod";

export const UpsertStripeProductRequestSchema = z.object({
  id: z.string().optional().nullable(),
  serviceId: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  priceData: z
    .object({
      unitAmount: z.number(),
      id: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});
export type UpsertStripeProductRequest = z.infer<
  typeof UpsertStripeProductRequestSchema
>;
