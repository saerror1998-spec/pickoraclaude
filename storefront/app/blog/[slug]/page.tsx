import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-posts";

const SITE_URL = "https://store.pickoraonline.com";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found | Pickora" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: { title: post.metaTitle, description: post.metaDescription, type: "article" },
  };
}

function articleJsonLd(post: NonNullable<ReturnType<typeof getBlogPost>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Pickora" },
    publisher: { "@type": "Organization", name: "Pickora" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-desktop)]">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-taupe">
            <Link href="/blog" className="transition-colors hover:text-ink">
              Blog
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink">{post.title}</span>
          </nav>

          <h1 className="type-headline-md text-ink">{post.title}</h1>

          <div className="mt-10 flex flex-col gap-8">
            {post.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="type-label-md text-ink">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, i) => (
                    <p key={i} className="text-taupe">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-card-secondary)] bg-cream-warm p-6">
            <p className="text-sm text-taupe">
              Ready to shop? Every laptop on Pickora ships with a real 90-day warranty and free UAE
              shipping.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-[var(--radius-pill)] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 ease-[var(--ease-expo-out)] hover:scale-[1.02]"
            >
              Browse laptops
            </Link>
          </div>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
