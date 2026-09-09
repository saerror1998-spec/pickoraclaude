import { Card } from "./Card";

export function CatalogBreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const maxCount = Math.max(1, ...items.map((item) => item.count));

  return (
    <Card>
      <p className="mb-5 text-sm text-text-muted">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-text-faint">No products yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-text">{item.label}</span>
                <span className="tabular-nums text-text-muted">{item.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[var(--ease-expo-out)]"
                  style={{ width: `${Math.max(4, (item.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
