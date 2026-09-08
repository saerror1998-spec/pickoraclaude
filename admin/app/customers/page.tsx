import { Header } from "@/components/Header";
import { CustomersTable } from "@/components/CustomersTable";
import { DashboardError } from "@/components/DashboardError";
import { fetchAdminCustomers, AdminDataError } from "@/lib/admin-data";

export default async function CustomersPage() {
  let customers;
  try {
    customers = await fetchAdminCustomers();
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
          <h2 className="text-lg text-text">Customers</h2>
          <span className="text-sm text-text-muted">{customers.length} total</span>
        </div>
        <CustomersTable customers={customers} />
      </main>
    </>
  );
}
