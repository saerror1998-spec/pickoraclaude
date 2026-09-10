import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import BlogPostPage, { generateMetadata } from "./page";
import { BLOG_POSTS } from "@/lib/blog-posts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog/renewed-vs-refurbished-laptops",
}));

const post = BLOG_POSTS[0];

describe("BlogPostPage", () => {
  it("renders the real post title, every section heading, and includes Article JSON-LD", async () => {
    const element = await BlogPostPage({
      params: Promise.resolve({ slug: post.slug }),
      searchParams: Promise.resolve({}),
    });
    const { container } = render(
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{element}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByRole("heading", { level: 1, name: post.title })).toBeInTheDocument();
    for (const section of post.sections) {
      expect(screen.getByRole("heading", { level: 2, name: section.heading })).toBeInTheDocument();
    }

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toBeInTheDocument();
    const data = JSON.parse(jsonLd!.innerHTML);
    expect(data["@type"]).toBe("Article");
    expect(data.headline).toBe(post.title);
  });

  it("404s for a slug that doesn't exist", async () => {
    await expect(
      BlogPostPage({ params: Promise.resolve({ slug: "nope" }), searchParams: Promise.resolve({}) })
    ).rejects.toThrow();
  });
});

describe("BlogPostPage generateMetadata", () => {
  it("uses the post's real meta title and description", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: post.slug }),
      searchParams: Promise.resolve({}),
    });

    expect(meta.title).toBe(post.metaTitle);
    expect(meta.description).toBe(post.metaDescription);
  });

  it("falls back to a generic title for an unknown slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "nope" }),
      searchParams: Promise.resolve({}),
    });

    expect(meta.title).toBe("Post not found | Pickora");
  });
});
