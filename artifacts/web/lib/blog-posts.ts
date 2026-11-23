// Single source of truth for the published blog articles on the marketing site.
//
// The articles are authored as static routes under app/blog/<slug>/page.tsx.
// This module only describes them for the index page so the listing cannot
// drift from the routes that actually exist. Adding an article means adding a
// route directory and one entry here.
//
// Every field below is copied from the matching route's metadata and hero
// image; lib/blog-posts.test.ts enforces that the slugs, images and reading
// times still line up with the files in this repository.

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  readingMinutes: number;
};

export const BLOG_POSTS: BlogPostSummary[] = [
  {
    slug: "what-to-do-after-storm-pennsylvania",
    title: "What to Do After a Storm — PA Homeowner's Checklist",
    excerpt:
      "Step-by-step checklist for Pennsylvania homeowners after a storm hits. Document damage, tarp your roof, file insurance claims, and get repairs started.",
    heroImage: "/images/blog/storm-damage-checklist.jpg",
    heroAlt: "Homeowner documenting storm damage on a Pennsylvania roof",
    readingMinutes: 6,
  },
  {
    slug: "how-to-spot-hail-damage-roof-pennsylvania",
    title: "How to Spot Hail Damage on Your Roof",
    excerpt:
      "Learn to identify hail damage on your Pennsylvania roof before it causes leaks. Visual guide with photos, plus a free inspection.",
    heroImage: "/images/blog/hail-damage-inspection.jpg",
    heroAlt: "Close-up of hail bruises on asphalt shingles",
    readingMinutes: 7,
  },
  {
    slug: "does-insurance-cover-roof-replacement-pennsylvania",
    title: "Does Homeowners Insurance Cover Roof Replacement in PA?",
    excerpt:
      "Does PA homeowners insurance cover roof replacement? Learn what's covered, what's excluded, and how to file a successful claim with your Pennsylvania insurer.",
    heroImage: "/images/blog/insurance-review.jpg",
    heroAlt: "Insurance adjuster reviewing roof damage documentation",
    readingMinutes: 9,
  },
  {
    slug: "asphalt-shingle-vs-metal-roof-cost-pennsylvania",
    title: "Asphalt Shingle vs Metal Roof Cost in Central PA",
    excerpt:
      "Asphalt shingles vs metal roofing: cost comparison for Central Pennsylvania homes. Lifespan, durability, energy efficiency, and what contractors recommend.",
    heroImage: "/images/blog/shingle-comparison.jpg",
    heroAlt: "Asphalt shingle and metal roof panels side by side",
    readingMinutes: 8,
  },
  {
    slug: "best-roof-shingles-pennsylvania",
    title: "Best Roof Shingles for Pennsylvania Weather",
    excerpt:
      "Which shingle brands perform best in Pennsylvania weather? Honest comparison of GAF, CertainTeed, and Owens Corning from a Central PA roofing contractor.",
    heroImage: "/images/blog/shingle-brands-pa.jpg",
    heroAlt: "Shingle sample boards from three manufacturers",
    readingMinutes: 7,
  },
];
