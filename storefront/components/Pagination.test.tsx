import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when everything fits on one page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} buildHref={(p) => `/shop?page=${p}`} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} buildHref={(p) => `/shop?page=${p}`} />);
    expect(screen.getByText("Previous")).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/shop?page=2");

    rerender(<Pagination page={3} totalPages={3} buildHref={(p) => `/shop?page=${p}`} />);
    expect(screen.getByText("Next")).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/shop?page=2");
  });

  it("shows the current page and total", () => {
    render(<Pagination page={2} totalPages={5} buildHref={(p) => `/shop?page=${p}`} />);
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });
});
