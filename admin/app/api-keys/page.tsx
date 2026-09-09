import { Header } from "@/components/Header";
import { NotConnectedCard } from "@/components/NotConnectedCard";

export default function ApiKeysPage() {
  return (
    <>
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-6">
        <NotConnectedCard
          title="There's no API key system yet"
          description="Pickora doesn't expose a public or partner API, so there's nothing to issue keys for. The real credentials this project depends on — Supabase and Nomod — are set as environment variables per app deployment (see each app's README), not managed through this dashboard, for security. See Integrations for what's actually connected."
        />
      </main>
    </>
  );
}
