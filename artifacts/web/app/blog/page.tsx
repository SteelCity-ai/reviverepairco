import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandConfig, getBrand } from "../../lib/brand";
import { formatPostDate, getPublishedPosts } from "../../lib/blog-api";
import { BLOG_POSTS } from "../../lib/blog-posts";

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

type BlogPostCardProps = {
  slug: string;
  title: string;
  excerpt?: string | null;
  heroImage?: string | null;
  heroAlt?: string;
  readingMinutes?: number;
  contentFocus?: string | null;
  tags?: string[];
  dateLabel?: string;
};

function BlogPostCard({
  slug,
  title,
  excerpt,
  heroImage,
  heroAlt,
  readingMinutes,
  contentFocus,
  tags = [],
  dateLabel,
}: BlogPostCardProps) {
  return (
    <li className="group">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={heroAlt || title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a202c] to-[#2d3748]">
              <span className="text-amber-400 text-sm font-semibold tracking-wide">
                {contentFocus ?? "Revive"}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {contentFocus ? (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {contentFocus}
            </span>
          ) : null}
          {readingMinutes ? (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {readingMinutes} min read
            </span>
          ) : null}
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-bold text-[#1a202c] group-hover:text-amber-600 transition-colors leading-snug">
          {title}
        </h2>
        {excerpt ? (
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">{excerpt}</p>
        ) : null}
        {dateLabel ? (
          <p className="text-gray-400 text-xs mt-3">{dateLabel}</p>
        ) : null}
      </Link>
    </li>
  );
}

export default async function BlogIndex() {
  const brand = await getBrand();
  const config = brandConfig(brand);

  // The five published articles are static routes, so they are the source of
  // truth for this listing and render without any network access. The portal
  // API is an optional enrichment: only posts the static list does not
  // already cover are appended, so an API outage can never empty the page.
  const staticSlugs = new Set(BLOG_POSTS.map((post) => post.slug));
  const { posts: apiPosts } = await getPublishedPosts(24, 0);
  const extraPosts = apiPosts.filter((post) => !staticSlugs.has(post.slug));
  const hasAnyPosts = BLOG_POSTS.length > 0 || extraPosts.length > 0;

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

      {hasAnyPosts ? (
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <BlogPostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              heroImage={post.heroImage}
              heroAlt={post.heroAlt}
              readingMinutes={post.readingMinutes}
            />
          ))}
          {extraPosts.map((post) => (
            <BlogPostCard
              key={post.id || post.slug}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              heroImage={post.heroImageUrl}
              contentFocus={post.contentFocus}
              tags={post.localityTags}
              dateLabel={formatPostDate(post.publishedAt)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">
          New articles are on the way. Check back soon, or{" "}
          <Link href="/#contact-form" className="text-amber-600 font-semibold hover:text-amber-700">
            request a free inspection
          </Link>
          .
        </p>
      )}
    </div>
  );
}
