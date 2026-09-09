import { Header } from "@/components/Header";
import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-lg text-text">New product</h2>
        </div>
        <div className="max-w-2xl">
          <ProductForm action={createProduct} submitLabel="Create product" />
        </div>
      </main>
    </>
  );
}
