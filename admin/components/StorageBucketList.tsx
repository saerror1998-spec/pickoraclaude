import { Card } from "./Card";
import { formatBytes } from "@/lib/format";
import type { StorageBucketSummary } from "@/lib/types";

export function StorageBucketList({ buckets }: { buckets: StorageBucketSummary[] }) {
  if (buckets.length === 0) {
    return (
      <Card className="col-span-full text-center text-text-muted">
        No storage buckets found. Run the storefront&apos;s bulk product import script to create the
        product-images bucket.
      </Card>
    );
  }

  return (
    <>
      {buckets.map((bucket) => (
        <Card key={bucket.name} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-text">{bucket.name}</span>
            <span
              className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs ${
                bucket.public ? "bg-positive/10 text-positive" : "bg-text-faint/10 text-text-faint"
              }`}
            >
              {bucket.public ? "Public" : "Private"}
            </span>
          </div>
          <span className="text-2xl tabular-nums text-text">{bucket.fileCount.toLocaleString("en-US")}</span>
          <span className="text-sm text-text-muted">
            files · {formatBytes(bucket.totalSizeBytes)}
          </span>
        </Card>
      ))}
    </>
  );
}
