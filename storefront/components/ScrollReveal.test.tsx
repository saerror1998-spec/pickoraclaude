import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ScrollReveal } from "./ScrollReveal";

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, "isIntersecting">[]) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: ObserverCallback;
  observed: Element[] = [];

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {}
  unobserve() {}
}

describe("ScrollReveal", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders both mask lines with the provided text", () => {
    render(<ScrollReveal lines={["Ask more of", "your laptop."]} as="h1" />);
    expect(screen.getByText("Ask more of")).toBeInTheDocument();
    expect(screen.getByText("your laptop.")).toBeInTheDocument();
  });

  it("animates to the visible state immediately when immediate=true (no observer)", async () => {
    render(<ScrollReveal lines={["Hello"]} immediate />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    const span = screen.getByText("Hello");

    await waitFor(() => {
      expect(span.getAttribute("style")).not.toContain("110%");
    });
  });

  it("stays hidden until the IntersectionObserver reports an intersection", async () => {
    render(<ScrollReveal lines={["Why buy refurbished"]} />);
    expect(MockIntersectionObserver.instances).toHaveLength(1);

    const span = screen.getByText("Why buy refurbished");
    expect(span.getAttribute("style")).toContain("110%");

    const observer = MockIntersectionObserver.instances[0];
    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(span.getAttribute("style")).not.toContain("110%");
    });
  });
});
