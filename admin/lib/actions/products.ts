"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProductFormState = { error: string | null };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key));
}

/** Admin types a plain currency amount (e.g. "775.50"), not raw cents. */
function currencyToCents(formData: FormData, key: string): number {
  return Math.round(Number(formData.get(key)) * 100);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

/** Every write here requires a signed-in admin session — proxy.ts already gates the page, this is defense in depth. */
async function requireAdminUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!data.user) {
    return { error: "You must be signed in to do this." };
  }
  return null;
}

function buildProductRow(formData: FormData) {
  const compatibility = formData.getAll("compatibility").map(String);
  const originalPriceRaw = str(formData, "originalPrice");

  return {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    image: str(formData, "image"),
    processor: str(formData, "processor"),
    ram_gb: num(formData, "ramGb"),
    storage_gb: num(formData, "storageGb"),
    price_cents: currencyToCents(formData, "price"),
    original_price_cents: originalPriceRaw === "" ? null : currencyToCents(formData, "originalPrice"),
    compatibility,
    condition: str(formData, "condition"),
    in_stock: formData.get("inStock") === "on",
    sku: optionalStr(formData, "sku"),
    spec_text: optionalStr(formData, "specText"),
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const authError = await requireAdminUser();
  if (authError) return authError;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase isn't configured for this environment." };

  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const row = buildProductRow(formData);
  const slug = slugify(name);

  const { error } = await supabase.from("products").insert({ ...row, slug });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? `A product with the slug "${slug}" already exists — try a different name.`
          : `Failed to create product: ${error.message}`,
    };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const authError = await requireAdminUser();
  if (authError) return authError;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return { error: "Supabase isn't configured for this environment." };

  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const row = buildProductRow(formData);

  const { error } = await supabase.from("products").update(row).eq("id", id);

  if (error) {
    return { error: `Failed to update product: ${error.message}` };
  }

  revalidatePath("/products");
  redirect("/products");
}
