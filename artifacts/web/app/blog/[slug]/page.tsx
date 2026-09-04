import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { brandConfig, getBrand } from "../../../lib/brand";

export const dynamic = "force-dynamic";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  category: string | null;
  author: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
}

function resolveApiBase(): string {
  return process.env.PORTAL_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3002";
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${resolveApiBase()}/api/v1/public/blog/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand();
  const config = brandConfig(brand);
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const image = post.featuredImage
    ? post.featuredImage.startsWith("http")
      ? post.featuredImage
      : `https://${config.domain}${post.featuredImage}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [image] } : {}),
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
    alternates: {
      canonical: `https://${config.domain}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#1a202c]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          {post.category && (
            <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-gray-200 text-sm">
            {post.author ? `Written by ${post.author}` : "Revive Roof Repair"}
            {post.publishedAt
              ? ` — ${new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`
              : ""}{" "}
            — Central Pennsylvania
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        {post.content && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Topics
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-amber-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#1a202c] flex items-center justify-center shrink-0">
            <span className="text-amber-400 font-bold text-lg">R</span>
          </div>
          <div>
            <p className="font-bold text-[#1a202c]">Revive Roof Repair Team</p>
            <p className="text-sm text-gray-600 mt-1">
              Licensed, insured roofing contractors serving Central Pennsylvania. We
              specialize in storm damage, insurance claims, and roof replacements.
            </p>
          </div>
          <Link
            href="tel:+17175001434"
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-[#1a202c] font-bold py-2 px-5 rounded-lg transition-all whitespace-nowrap text-sm"
          >
            (717) 500-1434
          </Link>
        </div>
      </article>
    </>
  );
}
