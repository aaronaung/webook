import { z } from "zod";
import { ProductType } from "..";

export const UpsertStripeProductRequestSchema = z.object({
  stripeProductId: z.string().optional().nullable(),
  internalProductId: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  priceData: z
    .object({
      unitAmount: z.number(),
      id: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  type: z.nativeEnum(ProductType),
});
export type UpsertStripeProductRequest = z.infer<
  typeof UpsertStripeProductRequestSchema
>;
