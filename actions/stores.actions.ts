"use server";

import db from "@/lib/database/db";
import { Store, store } from "@/lib/database/schemas";
import { StoreInsert, storeInsertSchema } from "@/lib/database/zod/stores";
import { eq } from "drizzle-orm";

import { ApiResponse, AppResponse } from "@/lib/common/response";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  handleError,
} from "@/lib/common/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const createStore = async (data: StoreInsert):Promise<ApiResponse<Store>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new UnauthorizedError("You must be signed in.");
    }

    const result = storeInsertSchema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.flatten()
      );
    }

    const validated = result.data;

    const slug = validated.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const existingStore = await db
      .select()
      .from(store)
      .where(eq(store.slug, slug))
      .limit(1);

    if (existingStore.length > 0) {
      throw new ConflictError("Slug already exists");
    }

    const [createdStore] = await db
      .insert(store)
      .values({
        ...validated,
        slug,
        userId: session.user.id,
      })
      .returning();

    return AppResponse.created(
      createdStore,
      "Store created successfully"
    );
  } catch (error) {
    return handleError("Create store", error);
  }
};