import { Header } from "@/components/Header";
import { IntegrationCard } from "@/components/IntegrationCard";
import { fetchIntegrationsStatus } from "@/lib/admin-data";

export default async function IntegrationsPage() {
  const integrations = await fetchIntegrationsStatus();

  return (
    <>
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-6 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </main>
    </>
  );
}
