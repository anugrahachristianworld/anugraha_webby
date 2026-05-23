// lib/imageOverrides.ts

import products from "@/data/products.json";
import { Product } from "@/lib/types";

const localProductMap = new Map(
  (products as Product[]).map((p) => [p.uuid, p])
);

export function applyLocalImageOverrides(
  product: Product
): Product {
  const local = localProductMap.get(product.uuid);

  if (!local) {
    return product;
  }

  return {
    ...product,

    main_image: local.main_image,

    secondary_images:
      local.secondary_images,
  };
}   