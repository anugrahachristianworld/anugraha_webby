// lib/syncProducts.ts

import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import fs from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import { Database } from "@/lib/database.types";

import {
  Product,
  Review,
  AdditionalInfoItem,
} from "@/lib/types";

import localProducts from "@/data/products.json";

type ProductRow =
  Database["public"]["Tables"]["products"]["Row"];

/* ------------------------------------------------ */
/* PATHS */
/* ------------------------------------------------ */

const ROOT_DIR = path.resolve(
  __dirname,
  ".."
);

const PRODUCTS_JSON_PATH = path.join(
  ROOT_DIR,
  "data",
  "products.json"
);

const BACKUP_JSON_PATH = path.join(
  ROOT_DIR,
  "data",
  "products.backup.json"
);

const IMAGES_DIR = path.join(
  ROOT_DIR,
  "public",
  "images"
);

/* ------------------------------------------------ */
/* ENV */
/* ------------------------------------------------ */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[ENV] Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "[ENV] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

console.log(
  "[ENV] Environment variables loaded"
);

/* ------------------------------------------------ */
/* SUPABASE */
/* ------------------------------------------------ */

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

console.log(
  "[SUPABASE] Client initialized"
);

/* ------------------------------------------------ */
/* ERROR COLLECTION */
/* ------------------------------------------------ */

const syncErrors: string[] = [];

/* ------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------ */

function sanitizeFileName(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveSupabaseImageUrl(
  pathOrUrl?: string | null
) {
  if (!pathOrUrl) {
    return null;
  }

  const cleaned =
    pathOrUrl.trim();

  if (!cleaned) {
    return null;
  }

  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(cleaned);

  return data.publicUrl;
}

async function ensureImagesDirectory() {
  await fs.mkdir(IMAGES_DIR, {
    recursive: true,
  });
}

async function fileExists(
  filePath: string
) {
  try {
    await fs.access(filePath);

    return true;
  } catch {
    return false;
  }
}

async function downloadImage(
  imageUrl: string,
  outputPath: string
) {
  try {
    const exists =
      await fileExists(outputPath);

    if (exists) {
      console.log(
        `[IMAGE] Skipping existing: ${path.basename(outputPath)}`
      );

      return;
    }

    console.log(
      `[IMAGE] Downloading: ${path.basename(outputPath)}`
    );

    const response =
      await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    await fs.writeFile(
      outputPath,
      buffer
    );

    console.log(
      `[IMAGE] Saved: ${path.basename(outputPath)}`
    );
  } catch (error) {
    const message =
      `[DOWNLOAD FAILED] ${imageUrl}\n${String(error)}`;

    console.error(message);

    syncErrors.push(message);
  }
}

/* ------------------------------------------------ */
/* TRANSFORM */
/* ------------------------------------------------ */

function transformRow(
  row: ProductRow
): Product {
  return {
    id: row.id,

    uuid: row.uuid,

    name: row.name,

    description:
      row.description ?? "",

    main_image:
      row.main_image ?? "",

    secondary_images:
      row.secondary_images ?? [],

    tags: row.tags ?? [],

    price:
      Number(row.price) || 0,

    size: row.size ?? "",

    quantity:
      row.quantity ?? 0,

    reviews:
      (row.reviews as unknown as Review[]) ??
      [],

    material:
      row.material ?? "",

    additional_info:
      (row.additional_info as unknown as AdditionalInfoItem[]) ??
      [],

    category:
      row.category ?? "",

    slug: row.slug ?? "",
  };
}

/* ------------------------------------------------ */
/* FETCH */
/* ------------------------------------------------ */

async function fetchRemoteProducts(): Promise<
  Product[]
> {
  console.log(
    "[SYNC] Fetching products from Supabase..."
  );

  const { data, error } =
    await supabase
      .from("products")
      .select("*");

  if (error || !data) {
    console.error(error);

    throw new Error(
      "Failed to fetch products"
    );
  }

  console.log(
    `[SYNC] Fetched ${data.length} products`
  );

  return data.map((row) =>
    transformRow(
      row as ProductRow
    )
  );
}

/* ------------------------------------------------ */
/* EXPORT IMAGES */
/* ------------------------------------------------ */

async function exportImagesFromRemote(
  remoteProduct: Product
): Promise<Product> {
  const cleanSlug =
    sanitizeFileName(
      remoteProduct.slug
    );

  let localMainImage = "";

  /* ------------------------------- */
  /* MAIN IMAGE */
  /* ------------------------------- */

  if (remoteProduct.main_image) {
    const mainUrl =
      resolveSupabaseImageUrl(
        remoteProduct.main_image
      );

    if (!mainUrl) {
      const error =
        `[INVALID MAIN IMAGE] ${remoteProduct.name}`;

      console.warn(error);

      syncErrors.push(error);
    } else {
      const mainFileName =
        `${cleanSlug}-${remoteProduct.uuid}.webp`;

      const mainOutputPath =
        path.join(
          IMAGES_DIR,
          mainFileName
        );

      await downloadImage(
        mainUrl,
        mainOutputPath
      );

      localMainImage =
        `/images/${mainFileName}`;
    }
  }

  /* ------------------------------- */
  /* SECONDARY IMAGES */
  /* ------------------------------- */

  const localSecondaryImages: string[] =
    [];

  for (
    let index = 0;
    index <
    remoteProduct.secondary_images
      .length;
    index++
  ) {
    const secondaryPath =
      remoteProduct
        .secondary_images[
        index
      ];

    const secondaryUrl =
      resolveSupabaseImageUrl(
        secondaryPath
      );

    if (!secondaryUrl) {
      const error =
        `[INVALID SECONDARY IMAGE] ${remoteProduct.name} (${index})`;

      console.warn(error);

      syncErrors.push(error);

      continue;
    }

    const secondaryFileName =
      `${cleanSlug}-${remoteProduct.uuid}-secondary-${index}.webp`;

    const secondaryOutputPath =
      path.join(
        IMAGES_DIR,
        secondaryFileName
      );

    await downloadImage(
      secondaryUrl,
      secondaryOutputPath
    );

    localSecondaryImages.push(
      `/images/${secondaryFileName}`
    );
  }

  return {
    ...remoteProduct,

    main_image:
      localMainImage,

    secondary_images:
      localSecondaryImages,
  };
}

/* ------------------------------------------------ */
/* VERIFY LOCAL IMAGES */
/* ------------------------------------------------ */

async function verifyLocalProductImages(
  localProduct: Product,
  remoteProduct: Product
) {
  const cleanSlug =
    sanitizeFileName(
      localProduct.slug
    );

  /* ------------------------------- */
  /* MAIN IMAGE */
  /* ------------------------------- */

  const expectedMainFileName =
    `${cleanSlug}-${localProduct.uuid}.webp`;

  const expectedMainPath =
    path.join(
      IMAGES_DIR,
      expectedMainFileName
    );

  const mainExists =
    await fileExists(
      expectedMainPath
    );

  if (!mainExists) {
    console.log(
      `[REPAIR] Missing main image for ${localProduct.name}`
    );

    const mainUrl =
      resolveSupabaseImageUrl(
        remoteProduct.main_image
      );

    if (!mainUrl) {
      const error =
        `[MISSING MAIN IMAGE URL] ${localProduct.name}`;

      console.warn(error);

      syncErrors.push(error);
    } else {
      await downloadImage(
        mainUrl,
        expectedMainPath
      );
    }
  }

  /* ------------------------------- */
  /* SECONDARY IMAGES */
  /* ------------------------------- */

  for (
    let index = 0;
    index <
    remoteProduct.secondary_images
      .length;
    index++
  ) {
    const expectedSecondaryFileName =
      `${cleanSlug}-${localProduct.uuid}-secondary-${index}.webp`;

    const expectedSecondaryPath =
      path.join(
        IMAGES_DIR,
        expectedSecondaryFileName
      );

    const exists =
      await fileExists(
        expectedSecondaryPath
      );

    if (!exists) {
      console.log(
        `[REPAIR] Missing secondary image ${index + 1} for ${localProduct.name}`
      );

      const secondaryUrl =
        resolveSupabaseImageUrl(
          remoteProduct
            .secondary_images[
            index
          ]
        );

      if (!secondaryUrl) {
        const error =
          `[MISSING SECONDARY IMAGE URL] ${localProduct.name} (${index})`;

        console.warn(error);

        syncErrors.push(error);

        continue;
      }

      await downloadImage(
        secondaryUrl,
        expectedSecondaryPath
      );
    }
  }
}

/* ------------------------------------------------ */
/* BACKUP */
/* ------------------------------------------------ */

async function backupProductsJson() {
  const content =
    await fs.readFile(
      PRODUCTS_JSON_PATH,
      "utf-8"
    );

  await fs.writeFile(
    BACKUP_JSON_PATH,
    content
  );

  console.log(
    "[BACKUP] products.backup.json created"
  );
}

/* ------------------------------------------------ */
/* WRITE */
/* ------------------------------------------------ */

async function writeProductsJson(
  products: Product[]
) {
  await fs.writeFile(
    PRODUCTS_JSON_PATH,
    JSON.stringify(
      products,
      null,
      2
    )
  );

  console.log(
    `[WRITE] Saved ${products.length} products`
  );
}

/* ------------------------------------------------ */
/* MAIN */
/* ------------------------------------------------ */

async function main() {
  console.log("");
  console.log(
    "=================================="
  );
  console.log(
    "SYNC PRODUCTS STARTED"
  );
  console.log(
    "=================================="
  );
  console.log("");

  console.log(
    `[PATH] Root Directory: ${ROOT_DIR}`
  );

  console.log(
    `[PATH] Images Directory: ${IMAGES_DIR}`
  );

  console.log("");

  try {
    await ensureImagesDirectory();

    const remoteProducts =
      await fetchRemoteProducts();

    const remoteProductMap =
      new Map(
        remoteProducts.map(
          (product) => [
            product.uuid,
            product,
          ]
        )
      );

    const localProductList =
      localProducts as Product[];

    /* ------------------------------- */
    /* VERIFY LOCAL IMAGES */
    /* ------------------------------- */

    console.log(
      "[VERIFY] Checking local product images..."
    );

    console.log("");

    for (const localProduct of localProductList) {
      try {
        const remoteProduct =
          remoteProductMap.get(
            localProduct.uuid
          );

        if (!remoteProduct) {
          const error =
            `[REMOTE PRODUCT MISSING] ${localProduct.name}`;

          console.warn(error);

          syncErrors.push(error);

          continue;
        }

        await verifyLocalProductImages(
          localProduct,
          remoteProduct
        );
      } catch (error) {
        const message =
          `[VERIFY FAILED] ${localProduct.name}\n${String(error)}`;

        console.error(message);

        syncErrors.push(message);
      }
    }

    console.log("");

    console.log(
      "[VERIFY] Image verification complete"
    );

    console.log("");

    /* ------------------------------- */
    /* FIND NEW PRODUCTS */
    /* ------------------------------- */

    const localUuidSet =
      new Set(
        localProductList.map(
          (product) =>
            product.uuid
        )
      );

    const missingProducts =
      remoteProducts.filter(
        (product) =>
          !localUuidSet.has(
            product.uuid
          )
      );

    console.log(
      `[SYNC] Found ${missingProducts.length} new products`
    );

    console.log("");

    /* ------------------------------- */
    /* EXPORT NEW PRODUCTS */
    /* ------------------------------- */

    const exportedProducts: Product[] =
      [];

    for (const product of missingProducts) {
      try {
        console.log(
          `[EXPORT] ${product.name}`
        );

        const exportedProduct =
          await exportImagesFromRemote(
            product
          );

        exportedProducts.push(
          exportedProduct
        );

        console.log(
          `[DONE] ${product.name}`
        );

        console.log("");
      } catch (error) {
        const message =
          `[EXPORT FAILED] ${product.name}\n${String(error)}`;

        console.error(message);

        syncErrors.push(message);
      }
    }

    /* ------------------------------- */
    /* SAVE UPDATED JSON */
    /* ------------------------------- */

    if (
      exportedProducts.length >
      0
    ) {
      await backupProductsJson();

      const updatedProducts = [
        ...localProductList,
        ...exportedProducts,
      ];

      await writeProductsJson(
        updatedProducts
      );
    }

    /* ------------------------------- */
    /* FINAL SUMMARY */
    /* ------------------------------- */

    console.log("");
    console.log(
      "=================================="
    );
    console.log(
      "SYNC COMPLETE"
    );
    console.log(
      "=================================="
    );

    console.log("");

    console.log(
      `[SUMMARY] Errors: ${syncErrors.length}`
    );

    if (
      syncErrors.length > 0
    ) {
      console.log("");

      console.log(
        "=================================="
      );

      console.log(
        "ERROR LOGS"
      );

      console.log(
        "=================================="
      );

      console.log("");

      syncErrors.forEach(
        (error, index) => {
          console.log(
            `${index + 1}. ${error}`
          );

          console.log("");
        }
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error(
      "=================================="
    );
    console.error(
      "FATAL SYNC FAILURE"
    );
    console.error(
      "=================================="
    );

    console.error(error);

    process.exit(1);
  }
}

main();