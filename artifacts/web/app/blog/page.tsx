import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandConfig, getBrand } from "../../lib/brand";
import { formatPostDate, getPublishedPosts } from "../../lib/blog-api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: {
      absolute: `${config.name} Blog — Central PA Roofing & Renovation Guides`,
    },
    description: `Expert roofing, renovation, and Central Pennsylvania homeowner advice from ${config.name}. Storm damage checklists, shingle comparisons, insurance guidance, and more.`,
    alternates: { canonical: `https://${config.domain}/blog` },
    openGraph: {
      url: `https://${config.domain}/blog`,
      title: `${config.name} Blog — Central PA Roofing & Renovation Guides`,
      description: `Roofing, renovation, and Central PA homeowner advice from ${config.name}.`,
      type: "website",
    },
  };
}

export default async function BlogIndex() {
  const brand = await getBrand();
  const config = brandConfig(brand);
  const { posts } = await getPublishedPosts(24, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a202c] mb-3">
          Central PA Home &amp; Roofing Blog
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          Practical guides from the {config.name} crew — roof repair and
          replacement, storm damage recovery, insurance questions, and home
          renovation advice for Harrisburg and Central Pennsylvania homeowners.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-500">
          New articles are on the way. Check back soon, or{" "}
          <Link href="/#contact-form" className="text-amber-600 font-semibold hover:text-amber-700">
            request a free inspection
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id || post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
                  {post.heroImageUrl ? (
                    <Image
                      src={post.heroImageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a202c] to-[#2d3748]">
                      <span className="text-amber-400 text-sm font-semibold tracking-wide">
                        {post.contentFocus ?? "Revive"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.contentFocus ? (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {post.contentFocus}
                    </span>
                  ) : null}
                  {post.localityTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-bold text-[#1a202c] group-hover:text-amber-600 transition-colors leading-snug">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {post.excerpt}
                  </p>
                ) : null}
                <p className="text-gray-400 text-xs mt-3">
                  {formatPostDate(post.publishedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
