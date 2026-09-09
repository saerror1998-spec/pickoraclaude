import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductForm } from "@/components/ProductForm";
import { DashboardError } from "@/components/DashboardError";
import { fetchAdminProduct, AdminDataError } from "@/lib/admin-data";
import { updateProduct } from "@/lib/actions/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product;
  try {
    product = await fetchAdminProduct(id);
  } catch (error) {
    if (error instanceof AdminDataError) {
      console.error(error.message, error.cause);
      return (
        <>
          <Header />
          <main className="grid flex-1 grid-cols-1 gap-3 p-6">
            <DashboardError />
          </main>
        </>
      );
    }
    throw error;
  }

  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-lg text-text">Edit {product.name}</h2>
        </div>
        <div className="max-w-2xl">
          <ProductForm action={updateProduct.bind(null, id)} initial={product} submitLabel="Save changes" />
        </div>
      </main>
    </>
  );
}
