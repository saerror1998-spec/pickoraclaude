import Link from "next/link";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { BLOG_POSTS } from "@/lib/blog-posts";

const TITLE = "Blog | Pickora";
const DESCRIPTION = "Buying guides and straight answers about refurbished laptops in the UAE, from the Pickora team.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <p className="text-sm uppercase tracking-[0.2em] text-taupe-light">Blog</p>
          <h1 className="mt-3 type-headline-md text-ink">Guides &amp; answers.</h1>
          <p className="mt-4 max-w-lg text-taupe">
            Straight answers about buying a refurbished laptop in the UAE, from the Pickora team.
          </p>

          <div className="mt-12 flex flex-col gap-4">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-[var(--radius-card-secondary)] bg-white p-6 shadow-[var(--shadow-soft)] transition-transform duration-200 ease-[var(--ease-expo-out)] hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-taupe-light">{formatDate(post.publishedAt)}</p>
                <h2 className="mt-2 text-lg text-ink">{post.title}</h2>
                <p className="mt-2 text-sm text-taupe">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
