import { Card } from "./Card";

export type ResourceLink = {
  name: string;
  description: string;
  href: string;
};

export function ResourceLinkCard({ resource }: { resource: ResourceLink }) {
  return (
    <Card as="section" className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-text">{resource.name}</span>
        <span aria-hidden className="shrink-0 text-text-faint">
          ↗
        </span>
      </div>
      <p className="text-sm text-text-muted">{resource.description}</p>
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 truncate text-xs text-accent hover:underline"
      >
        {resource.href.replace(/^https?:\/\//, "")}
      </a>
    </Card>
  );
}
