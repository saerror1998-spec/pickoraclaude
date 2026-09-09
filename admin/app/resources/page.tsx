import { Header } from "@/components/Header";
import { ResourceLinkCard, type ResourceLink } from "@/components/ResourceLinkCard";

const RESOURCES: ResourceLink[] = [
  {
    name: "GitHub repository",
    description: "Source for both the storefront and admin apps — this is what Hostinger deploys from.",
    href: "https://github.com/saerror1998-spec/pickoraclaude",
  },
  {
    name: "Storefront (live)",
    description: "The customer-facing site.",
    href: "https://store.pickoraonline.com",
  },
  {
    name: "Admin (live)",
    description: "This dashboard, as deployed.",
    href: "https://adminstack.pickoraonline.com",
  },
  {
    name: "Supabase project",
    description: "Database, auth, and storage — products, orders, customers, and Google sign-in all live here.",
    href: "https://supabase.com/dashboard/project/nuicmpoauposovlhzwxf",
  },
  {
    name: "Nomod",
    description: "Hosted checkout provider for real payments. Sign in from here to your merchant dashboard.",
    href: "https://nomod.com",
  },
  {
    name: "Hostinger hPanel",
    description: "Where both apps' Node.js hosting, domains, and deploy status are managed.",
    href: "https://hpanel.hostinger.com",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((resource) => (
          <ResourceLinkCard key={resource.href} resource={resource} />
        ))}
      </main>
    </>
  );
}
