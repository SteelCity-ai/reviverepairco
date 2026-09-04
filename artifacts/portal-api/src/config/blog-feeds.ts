/**
 * Blog research feed configuration (RAP-2.4).
 *
 * Curated RSS/Atom feeds for Central-PA renovation, roofing, and contracting
 * industry news. Real feed selection is a build-follow-up; feeds here are
 * representative examples that may need updating before production use.
 *
 * Pattern: per RAP-0.3 PokerThreads news pipeline model — bounded RSS parsing,
 * per-feed caps, concurrent fetching, skip-on-failure.
 */

export interface BlogFeedCategory {
  /** Category key used in insights and blog post categorization. */
  key: string;
  /** Human-readable category name. */
  label: string;
  /** Feed URLs in this category. */
  feeds: BlogFeedSource[];
}

export interface BlogFeedSource {
  /** RSS/Atom feed URL. */
  feedUrl: string;
  /** Canonical site URL for allowlist validation. */
  siteUrl: string;
}

/**
 * Central-PA renovation/roofing feed categories.
 *
 * Categories selected per ADR RAP-1.0 §c.2:
 * 1. PA contractor / builder-association news
 * 2. Storm damage & insurance
 * 3. PA building permits & codes
 * 4. Roofing materials & manufacturer newsrooms
 * 5. Seasonal home prep
 * 6. Regional/local news RSS
 * 7. Remodeling/renovation trade press
 * 8. Energy efficiency & financing/incentives
 */
export const BLOG_FEED_CATEGORIES: BlogFeedCategory[] = [
  {
    key: "contractor-news",
    label: "PA Contractor & Builder News",
    feeds: [
      {
        feedUrl: "https://www.pabuilders.org/feed/",
        siteUrl: "https://www.pabuilders.org",
      },
      {
        feedUrl: "https://www.nahb.org/rss/news",
        siteUrl: "https://www.nahb.org",
      },
    ],
  },
  {
    key: "storm-insurance",
    label: "Storm Damage & Insurance",
    feeds: [
      {
        feedUrl: "https://www.weather.gov/rss/",
        siteUrl: "https://www.weather.gov",
      },
      {
        feedUrl: "https://www.insurancejournal.com/rss/news/",
        siteUrl: "https://www.insurancejournal.com",
      },
    ],
  },
  {
    key: "permits-codes",
    label: "PA Building Permits & Codes",
    feeds: [
      {
        feedUrl: "https://www.dli.pa.gov/Individuals/Labor-Management-Relations/bois/Pages/default.aspx",
        siteUrl: "https://www.dli.pa.gov",
      },
    ],
  },
  {
    key: "materials",
    label: "Roofing Materials & Manufacturer News",
    feeds: [
      {
        feedUrl: "https://www.gaf.com/en-us/blog/rss",
        siteUrl: "https://www.gaf.com",
      },
      {
        feedUrl: "https://www.owenscorning.com/en-us/rss",
        siteUrl: "https://www.owenscorning.com",
      },
    ],
  },
  {
    key: "seasonal-prep",
    label: "Seasonal Home Preparation",
    feeds: [
      {
        feedUrl: "https://www.familyhandyman.com/feed/",
        siteUrl: "https://www.familyhandyman.com",
      },
    ],
  },
  {
    key: "local-news",
    label: "Central PA Regional News",
    feeds: [
      {
        feedUrl: "https://www.pennlive.com/arc/outboundfeeds/v2/rss/?outputType=xml",
        siteUrl: "https://www.pennlive.com",
      },
      {
        feedUrl: "https://www.wgal.com/rss",
        siteUrl: "https://www.wgal.com",
      },
    ],
  },
  {
    key: "trade-press",
    label: "Remodeling & Renovation Trade Press",
    feeds: [
      {
        feedUrl: "https://www.roofingcontractor.com/rss",
        siteUrl: "https://www.roofingcontractor.com",
      },
      {
        feedUrl: "https://www.remodeling.hw.net/rss",
        siteUrl: "https://www.remodeling.hw.net",
      },
    ],
  },
  {
    key: "energy-incentives",
    label: "Energy Efficiency & Financing",
    feeds: [
      {
        feedUrl: "https://www.energy.gov/rss",
        siteUrl: "https://www.energy.gov",
      },
    ],
  },
];

/**
 * Research cycle configuration.
 */
export const BLOG_RESEARCH_CONFIG = {
  /** Maximum items fetched per feed. */
  perFeedCap: 8,
  /** Maximum total items after deduplication. */
  maxTotalItems: 30,
  /** Number of feeds fetched concurrently. */
  concurrency: 3,
  /** Fetch timeout per feed in milliseconds. */
  fetchTimeoutMs: 15_000,
  /** Maximum summary length in characters from feed content. */
  maxSummaryChars: 700,
};
