// app/api/products/[slug]/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { revalidatePath } from "next/cache";

import localProducts from "@/data/products.json";

import { supabase } from "@/lib/supabaseClient";

import { uploadImage } from "@/lib/uploadImage";

import type {
  Product,
} from "@/lib/types";

import type { Database } from "@/lib/database.types";

type ProductRow =
  Database["public"]["Tables"]["products"]["Row"];

/* ------------------------------------------------ */
/* GET PRODUCT */
/* ------------------------------------------------ */

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  const { slug } = await params;

  /*
    LOCAL FIRST
  */

  const localProduct = (
    localProducts as Product[]
  ).find(
    (product) =>
      product.slug === slug
  );

  /*
    If exists locally,
    return local version immediately.
  */

  if (localProduct) {
    return NextResponse.json({
      product: localProduct,
      suggested: [],
    });
  }

  /*
    Otherwise fallback to Supabase
  */

  const {
    data: product,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return NextResponse.json(
      {
        error:
          "Product not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    product,
    suggested: [],
  });
}

/* ------------------------------------------------ */
/* DELETE */
/* ------------------------------------------------ */

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  const { slug } = await params;

  const {
    data: product,
    error: fetchError,
  } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (fetchError || !product) {
    return NextResponse.json(
      {
        error:
          "Product not found",
      },
      {
        status: 404,
      }
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("products")
    .delete()
    .eq("slug", slug);

  if (deleteError) {
    return NextResponse.json(
      {
        error:
          deleteError.message,
      },
      {
        status: 500,
      }
    );
  }

  revalidatePath("/products");

  return NextResponse.json({
    message:
      "Deleted successfully",
  });
}

/* ------------------------------------------------ */
/* UPDATE */
/* ------------------------------------------------ */

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  const { slug } = await params;

  try {
    const formData =
      await req.formData();

    const updates:
      Partial<ProductRow> = {
      name: formData
        .get("name")
        ?.toString(),

      description:
        formData
          .get(
            "description"
          )
          ?.toString(),

      size: formData
        .get("size")
        ?.toString(),

      material:
        formData
          .get(
            "material"
          )
          ?.toString(),

      category:
        formData
          .get(
            "category"
          )
          ?.toString(),

      price: formData.get(
        "price"
      )
        ? parseFloat(
            formData.get(
              "price"
            ) as string
          )
        : undefined,

      quantity:
        formData.get(
          "quantity"
        )
          ? parseInt(
              formData.get(
                "quantity"
              ) as string
            )
          : undefined,

      tags: formData.get(
        "tags"
      )
        ? (
            formData.get(
              "tags"
            ) as string
          ).split(",")
        : undefined,
    };

    /*
      MAIN IMAGE
    */

    const mainImage =
      formData.get(
        "main_image"
      ) as File | null;

    if (mainImage) {
      const uploaded =
        await uploadImage(
          mainImage,
          slug
        );

      if (uploaded) {
        updates.main_image =
          uploaded;
      }
    }

    /*
      SECONDARY IMAGES
    */

    const secondaryFiles =
      formData.getAll(
        "secondary_images"
      ) as File[];

    const uploadedSecondary:
      string[] = [];

    for (const file of secondaryFiles) {
      const uploaded =
        await uploadImage(
          file,
          slug
        );

      if (uploaded) {
        uploadedSecondary.push(
          uploaded
        );
      }
    }

    if (
      uploadedSecondary.length > 0
    ) {
      updates.secondary_images =
        uploadedSecondary;
    }

    const {
      data: updated,
      error,
    } = await supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error || !updated) {
      throw error;
    }

    revalidatePath("/products");

    return NextResponse.json({
      message:
        "Updated successfully",

      product: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to update product",
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