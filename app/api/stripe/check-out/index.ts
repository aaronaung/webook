import { ProductType } from "../products";

export type StripeCheckoutMetadata = {
  stripe_product_id: string;
  user_id: string;
  product_type: ProductType;
};
