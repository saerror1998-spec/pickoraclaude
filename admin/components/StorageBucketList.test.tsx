import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StorageBucketList } from "./StorageBucketList";
import type { StorageBucketSummary } from "@/lib/types";

describe("StorageBucketList", () => {
  it("shows an empty state with no buckets", () => {
    render(<StorageBucketList buckets={[]} />);
    expect(screen.getByText(/No storage buckets found/)).toBeInTheDocument();
  });

  it("renders bucket name, visibility, file count, and formatted size", () => {
    const buckets: StorageBucketSummary[] = [
      { name: "product-images", public: true, fileCount: 1910, totalSizeBytes: 314572800 },
    ];
    render(<StorageBucketList buckets={buckets} />);

    expect(screen.getByText("product-images")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("1,910")).toBeInTheDocument();
    expect(screen.getByText(/300\.0 MB/)).toBeInTheDocument();
  });

  it("labels a non-public bucket as Private", () => {
    render(<StorageBucketList buckets={[{ name: "private-bucket", public: false, fileCount: 0, totalSizeBytes: 0 }]} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});
