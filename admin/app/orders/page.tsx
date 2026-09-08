import { Header } from "@/components/Header";
import { OrdersTable } from "@/components/OrdersTable";
import { DashboardError } from "@/components/DashboardError";
import { fetchAdminOrders, AdminDataError } from "@/lib/admin-data";

export default async function OrdersPage() {
  let orders;
  try {
    orders = await fetchAdminOrders();
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

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-text">Orders</h2>
          <span className="text-sm text-text-muted">{orders.length} total</span>
        </div>
        <OrdersTable orders={orders} />
      </main>
    </>
  );
}
