import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationCard } from "./IntegrationCard";
import type { IntegrationStatus } from "@/lib/types";

describe("IntegrationCard", () => {
  it("renders a connected integration", () => {
    const integration: IntegrationStatus = {
      id: "supabase-database",
      name: "Supabase database",
      description: "Products, orders, and customers all live here.",
      status: "connected",
      detail: "Live query to the products table succeeded.",
    };
    render(<IntegrationCard integration={integration} />);

    expect(screen.getByText("Supabase database")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText(/Live query/)).toBeInTheDocument();
  });

  it("renders a not_configured integration", () => {
    render(
      <IntegrationCard
        integration={{
          id: "x",
          name: "X",
          description: "d",
          status: "not_configured",
          detail: "not set up",
        }}
      />
    );
    expect(screen.getByText("Not configured")).toBeInTheDocument();
  });

  it("renders an external integration", () => {
    render(
      <IntegrationCard
        integration={{ id: "x", name: "X", description: "d", status: "external", detail: "elsewhere" }}
      />
    );
    expect(screen.getByText("Configured elsewhere")).toBeInTheDocument();
  });
});
