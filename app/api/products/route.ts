// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import { Json } from "@/lib/database.types";

import { uploadImage } from "@/lib/uploadImage";

import { supabase } from "@/lib/supabaseClient";

import localProducts from "@/data/products.json";

import type { Product } from "@/lib/types";

/* ------------------------------------------------ */
/* ERROR LOGGER */
/* ------------------------------------------------ */

function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  if (error instanceof Error) {
    console.error(
      `[API ERROR] ${context}:`,
      error.message
    );

    console.error(error.stack);
  } else {
    console.error(
      `[API ERROR] ${context}:`,
      error
    );
  }

  if (extra) {
    console.error(
      "[API ERROR] Extra:",
      extra
    );
  }
}

/* ------------------------------------------------ */
/* IMAGE VALIDATION */
/* ------------------------------------------------ */

function isValidImage(
  image: unknown
): image is string {
  return (
    typeof image === "string" &&
    image.trim().length > 0
  );
}

/* ------------------------------------------------ */
/* PRODUCT VALIDATION */
/* ------------------------------------------------ */

function isValidProduct(
  product: Partial<Product>
): boolean {
  /*
    REQUIRED:
    - uuid
    - slug
    - main_image
  */

  return (
    typeof product.uuid === "string" &&
    product.uuid.trim() !== "" &&
    typeof product.slug === "string" &&
    product.slug.trim() !== "" &&
    isValidImage(product.main_image)
  );
}

/* ------------------------------------------------ */
/* NORMALIZE PRODUCT */
/* ------------------------------------------------ */

function normalizeProduct(
  product: Partial<Product>
): Product | null {
  if (!isValidProduct(product)) {
    return null;
  }

  return {
    id: product.id || ""  ,

    uuid: product.uuid || "",

    name:
      typeof product.name === "string"
        ? product.name
        : "",

    description:
      typeof product.description ===
      "string"
        ? product.description
        : "",

    main_image: product.main_image || "",

    secondary_images: Array.isArray(
      product.secondary_images
    )
      ? product.secondary_images.filter(
          isValidImage
        )
      : [],

    tags: Array.isArray(product.tags)
      ? product.tags
      : [],

    price:
      typeof product.price === "number"
        ? product.price
        : 0,

    size:
      typeof product.size === "string"
        ? product.size
        : "",

    quantity:
      typeof product.quantity ===
      "number"
        ? product.quantity
        : 0,

    reviews: Array.isArray(
      product.reviews
    )
      ? product.reviews
      : [],

    material:
      typeof product.material ===
      "string"
        ? product.material
        : "",

    additional_info: Array.isArray(
      product.additional_info
    )
      ? product.additional_info
      : [],

    category:
      typeof product.category ===
      "string"
        ? product.category
        : "",

    slug: product.slug || "",
  };
}

/* ------------------------------------------------ */
/* GET ALL PRODUCTS */
/* ------------------------------------------------ */

export async function GET(
  _req: NextRequest
) {
  try {
    console.log("");
    console.log(
      "=================================="
    );

    console.log(
      "[PRODUCTS API] FETCH STARTED"
    );

    console.log(
      "=================================="
    );

    /*
      LOCAL PRODUCTS
    */

    const baseline = (
      localProducts as Partial<Product>[]
    )
      .map(normalizeProduct)
      .filter(
        (
          product
        ): product is Product =>
          product !== null
      );

    console.log(
      `[LOCAL] ${baseline.length} valid local products`
    );

    /*
      REMOTE PRODUCTS
    */

    const {
      data: remoteProducts,
      error,
    } = await supabase
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    console.log(
      `[REMOTE] ${
        remoteProducts?.length ?? 0
      } remote products fetched`
    );

    /*
      LOCAL UUID LOOKUP
    */

    const localUuidSet = new Set(
      baseline.map(
        (product) => product.uuid
      )
    );

    /*
      REMOTE FALLBACK PRODUCTS
    */

    const remoteOnlyProducts = (
      remoteProducts ?? []
    )
      .filter((product) => {
        /*
          Skip already local
        */

        if (
          !product.uuid ||
          localUuidSet.has(
            product.uuid
          )
        ) {
          return false;
        }

        return true;
      })

      .map((product) =>
        normalizeProduct({
          ...product,

          main_image:
            product.main_image ?? "",

          secondary_images:
            product.secondary_images ??
            [],
        })
      )

      .filter(
        (
          product
        ): product is Product =>
          product !== null
      );

    console.log(
      `[REMOTE] ${remoteOnlyProducts.length} remote fallback products`
    );

    /*
      FINAL MERGE
    */

    const merged = [
      ...baseline,
      ...remoteOnlyProducts,
    ];

    console.log(
      `[FINAL] ${merged.length} total products returned`
    );

    /*
      DEBUG SKIPPED PRODUCTS
    */

    const skippedProducts = (
      remoteProducts ?? []
    ).filter((product) => {
      return !isValidProduct({
        uuid: product.uuid ?? "",

        slug: product.slug ?? "",

        main_image:
          product.main_image ?? "",
      });
    });

    if (skippedProducts.length > 0) {
      console.log("");

      console.log(
        `[SKIPPED] ${skippedProducts.length} invalid products`
      );

      skippedProducts.forEach(
        (product) => {
          console.log(
            ` - ${product.name} (${product.slug})`
          );
        }
      );
    }

    console.log("");
    console.log(
      "=================================="
    );

    console.log(
      "[PRODUCTS API] FETCH COMPLETE"
    );

    console.log(
      "=================================="
    );

    console.log("");

    return NextResponse.json({
      products: merged,
    });
  } catch (error) {
    logError(
      "GET products failed",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}

/* ------------------------------------------------ */
/* CREATE PRODUCT */
/* ------------------------------------------------ */

export async function POST(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const name = formData
      .get("name")
      ?.toString();

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    const description =
      formData
        .get("description")
        ?.toString() ?? null;

    const size =
      formData
        .get("size")
        ?.toString() ?? null;

    const material =
      formData
        .get("material")
        ?.toString() ?? null;

    const category =
      formData
        .get("category")
        ?.toString() ?? null;

    const price = formData.get(
      "price"
    )
      ? parseFloat(
          formData.get(
            "price"
          ) as string
        )
      : 0;

    const quantity =
      formData.get("quantity")
        ? parseInt(
            formData.get(
              "quantity"
            ) as string
          )
        : 1;

    const tags = formData.get(
      "tags"
    )
      ? (
          formData.get(
            "tags"
          ) as string
        ).split(",")
      : [];

    const additional_info =
      formData.get(
        "additional_info"
      )
        ? (JSON.parse(
            formData.get(
              "additional_info"
            ) as string
          ) as Json)
        : null;

    const slug =
      formData
        .get("slug")
        ?.toString() ??
      name
        .toLowerCase()
        .replace(/\s+/g, "-");

    /*
      MAIN IMAGE
    */

    let main_image:
      | string
      | null = null;

    const mainImage =
      formData.get(
        "main_image"
      ) as File | null;

    if (mainImage) {
      main_image =
        await uploadImage(
          mainImage,
          slug
        );
    }

    /*
      SECONDARY IMAGES
    */

    const secondaryFiles =
      formData.getAll(
        "secondary_images"
      ) as File[];

    const secondary_images:
      string[] = [];

    for (const file of secondaryFiles) {
      const uploaded =
        await uploadImage(
          file,
          slug
        );

      if (uploaded) {
        secondary_images.push(
          uploaded
        );
      }
    }

    /*
      REQUIRE MAIN IMAGE
    */

    if (!isValidImage(main_image)) {
      return NextResponse.json(
        {
          message:
            "Main image is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
      INSERT
    */

    const {
      data: inserted,
      error,
    } = await supabase
      .from("products")
      .insert([
        {
          name,

          description,

          size,

          material,

          category,

          price,

          quantity,

          tags,

          additional_info,

          slug,

          main_image,

          secondary_images,
        },
      ])
      .select()
      .single();

    if (error || !inserted) {
      throw error;
    }

    revalidatePath("/products");

    return NextResponse.json({
      message:
        "Product created successfully",

      product: inserted,
    });
  } catch (error) {
    logError(
      "POST product failed",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};