export enum ProductType {
  Class = "class",
  Service = "service",
}

export type StripeProductMetadata = {
  internal_product_id: string;
  type: ProductType;
};
