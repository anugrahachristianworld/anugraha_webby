// app/api/products/[slug]/reviews/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";

type Review = {
  customer_name: string;
  rating: number;
  comment: string;
};

export async function POST(
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
    const body =
      (await req.json()) as Partial<Review>;

    if (
      !body.customer_name ||
      !body.rating ||
      !body.comment
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required review fields",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: product,
      error: fetchError,
    } = await supabase
      .from("products")
      .select("reviews")
      .eq("slug", slug)
      .single();

    if (
      fetchError ||
      !product
    ) {
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

    const existingReviews =
      Array.isArray(
        product.reviews
      )
        ? product.reviews
        : [];

    const updatedReviews = [
      ...existingReviews,
      body,
    ];

    const {
      error: updateError,
    } = await supabase
      .from("products")
      .update({
        reviews:
          updatedReviews,
      })
      .eq("slug", slug);

    if (updateError) {
      throw updateError;
    }

    revalidatePath(
      `/products/${slug}`
    );

    return NextResponse.json({
      message:
        "Review added successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to add review",
      },
      {
        status: 500,
      }
    );
  }
}