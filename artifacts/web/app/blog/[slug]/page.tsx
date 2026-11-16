import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { brandConfig, getBrand } from "../../../lib/brand";
import {
  excerptFromBody,
  formatPostDate,
  getPublishedPostBySlug,
} from "../../../lib/blog-api";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function loadPost(slug: string) {
  return getPublishedPostBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand();
  const config = brandConfig(brand);
  const post = await loadPost(slug);

  // Drafts / unknown slugs: neutral metadata; the page itself renders 404.
  if (!post) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  // The public API omits internal seoTitle/seoDescription fields, so derive
  // metadata from the public shape with a Central PA topical fallback.
  const seoTitle = post.title.includes("Pennsylvania") || post.title.includes("PA")
    ? post.title
    : `${post.title} | Central PA Roofing & Renovation`;
  const seoDescription =
    post.excerpt ?? excerptFromBody(post.bodyMd) ?? config.metaDescription;
  const canonical = `https://${config.domain}/blog/${post.slug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      ...post.tags,
      ...post.localityTags,
      post.contentFocus,
      "Central PA roofing",
      "Central PA renovation",
    ].filter((k): k is string => Boolean(k)),
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: seoDescription,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.heroImageUrl ? [{ url: post.heroImageUrl }] : undefined,
    },
    twitter: {
      card: post.heroImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: seoDescription,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);

  // Drafts, archived, and unknown slugs never render.
  if (!post) {
    notFound();
  }

  const brand = await getBrand();
  const config = brandConfig(brand);
  const publishedLabel = formatPostDate(post.publishedAt);

  return (
    <article className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        {post.heroImageUrl ? (
          <Image
            src={post.heroImageUrl}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a202c] to-[#2d3748]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          {post.contentFocus ? (
            <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
              {post.contentFocus}
            </span>
          ) : null}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-gray-200 text-sm">
            {config.name}
            {publishedLabel ? ` — ${publishedLabel}` : ""}
            {post.localityTags.length > 0
              ? ` — ${post.localityTags.join(", ")}`
              : " — Central Pennsylvania"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.bodyMd}</ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-gray-600 mb-4">
            Need help with your roof or renovation project in Central PA?
          </p>
          <Link
            href="/#contact-form"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-[#1a202c] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Get a Free Quote →
          </Link>
        </div>
      </div>
    </article>
  );
}
