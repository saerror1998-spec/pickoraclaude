import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import BlogIndexPage from "./page";
import { BLOG_POSTS } from "@/lib/blog-posts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog",
}));

function renderBlogIndex() {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BlogIndexPage />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

describe("BlogIndexPage", () => {
  it("lists every real blog post with a link to its page", () => {
    renderBlogIndex();

    for (const post of BLOG_POSTS) {
      const link = screen.getByRole("link", { name: new RegExp(post.title) });
      expect(link).toHaveAttribute("href", `/blog/${post.slug}`);
    }
  });
});
