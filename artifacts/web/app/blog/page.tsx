import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { brandConfig, getBrand } from "../../lib/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `${config.name} Blog — Central PA Home & Roofing Guides` },
    description: `Expert roofing, renovation, and Central Pennsylvania homeowner advice from ${config.name}.`,
    alternates: { canonical: `https://${config.domain}/blog` },
    openGraph: { url: `https://${config.domain}/blog` },
  };
}

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string | null;
  author: string | null;
  publishedAt: string | null;
  tags: string[] | null;
}

function resolveApiBase(): string {
  return process.env.PORTAL_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3002";
}

async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  try {
    const res = await fetch(`${resolveApiBase()}/api/v1/public/blog`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const brand = await getBrand();
  const config = brandConfig(brand);
  const posts = await getPublishedPosts();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#1a202c] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {config.name} Blog
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Expert roofing, renovation, and Central Pennsylvania homeowner advice — from the
            contractors who work here every day.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No posts yet — check back soon for roofing tips and guides.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Featured Image */}
                {post.featuredImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📝</span>
                  </div>
                )}
                {/* Card Body */}
                <div className="p-5">
                  {post.category && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                      {post.category}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-[#1a202c] group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <span>{post.author ?? config.name}</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
