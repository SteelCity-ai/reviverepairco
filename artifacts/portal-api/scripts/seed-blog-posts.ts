/**
 * RAP-4.1: Seed the 5 static marketing blog posts into blog_posts as published.
 *
 * Idempotent: checks slug existence before insert (upsert by slug).
 * Usage:   DATABASE_URL=... tsx scripts/seed-blog-posts.ts
 * Verify:  tsx scripts/seed-blog-posts.ts --dry-run
 *
 * Constraints (per RAP-1.0 ADR c.8):
 *  - All posts seeded as status = "published"
 *  - Slugs must be IDENTICAL to the static post directory names
 *  - published_at backdated to approximate original post dates
 *  - Content copied verbatim from the static JSX pages
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { blogPosts } from "../lib/db/schema/portal.js";

interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  publishedAt: string;
}

const STATIC_POSTS: SeedPost[] = [
  {
    slug: "what-to-do-after-storm-pennsylvania",
    title: "What to Do After a Storm - PA Homeowner's Checklist",
    excerpt: "Every year in Pennsylvania - particularly during spring and summer thunderstorm season - severe weather tears through Central PA and leaves damaged roofs in its wake. If a storm just hit your home, here's exactly what to do, in the right order.",
    content: `<h2>Step 1: Ensure Your Safety First</h2>
<p>Before you do anything - storm damage creates dangerous conditions.</p>
<ul>
<li>Do NOT go up on the roof while there is active lightning, high winds, or wet conditions</li>
<li>If you hear cracking or creaking, stay out of the house</li>
<li>Turn off electricity at the breaker if you suspect water has entered electrical systems</li>
<li>If water is pooling inside your home, call 911 if it is an emergency</li>
</ul>
<h2>Step 2: Document Everything - Before You Fix Anything</h2>
<p>This is the most important step for your insurance claim. Take extensive photos and video of all damage - <strong>before</strong> you cover anything or make repairs.</p>
<ul>
<li>Wide shots of all four sides of your home</li>
<li>Close-up photos of individual damage points</li>
<li>Photos of any fallen tree limbs, dented gutters, or damaged siding</li>
<li>Interior ceiling stains, bulging drywall, or active drips</li>
</ul>
<p><strong>Pro tip:</strong> Turn on your phone's timestamp feature. Insurance adjusters and attorneys both care about being able to verify when photos were taken.</p>
<h2>Step 3: Prevent Further Damage</h2>
<p>If your roof has active leaks, preventing further interior damage is critical - and insurance companies expect homeowners to take reasonable steps to mitigate additional losses. Keep all receipts for any materials you purchase for temporary repairs.</p>
<ul>
<li><strong>Tarp coverage:</strong> A heavy-duty tarp secured over damaged areas stops rain from entering until permanent repairs are made</li>
<li><strong>Interior buckets:</strong> Place buckets under active drips to protect floors and furnishings</li>
<li><strong>Move valuables:</strong> Get furniture, electronics, and keepsakes away from water intrusion zones</li>
</ul>
<h2>Step 4: Call Your Insurance Company</h2>
<p>Report the damage as soon as reasonably possible. In Pennsylvania, the statute of limitations for filing a claim is typically <strong>2 years from the date of loss</strong>, but do not wait that long.</p>
<h2>Step 5: Get a Professional Inspection</h2>
<p>After you have called your insurance company, but before the adjuster comes - get your own roofer's assessment. Insurance adjusters work for the insurance company. Your roofer works for you.</p>
<h2>Step 6: Meet the Adjuster On-Site</h2>
<p>When your insurance company schedules an adjuster inspection, <strong>be present</strong>. Better yet - have your roofing contractor there too. We frequently attend adjuster inspections with homeowners, and we have seen it make a significant difference in the final settlement.</p>
<h2>Step 7: Review Your Settlement Before Signing</h2>
<p>Do not sign anything or authorize repairs until you have reviewed the insurance company's estimate. We review insurance estimates for free.</p>`,
    category: "Storm Guide",
    tags: ["storm damage", "roof emergency", "Pennsylvania", "insurance claim", "checklist"],
    metaTitle: "What to Do After a Storm - PA Homeowner's Checklist | Revive",
    metaDescription: "Step-by-step checklist for Pennsylvania homeowners after a storm hits. Document damage, tarp your roof, file insurance claims, and get repairs started.",
    featuredImage: "/images/blog/storm-damage-checklist.jpg",
    publishedAt: "2025-10-15T12:00:00Z",
  },
  {
    slug: "how-to-spot-hail-damage-roof-pennsylvania",
    title: "How to Spot Hail Damage on Your Roof",
    excerpt: "Pennsylvania gets hammered by severe hailstorms - especially in the summer. After the storm passes and your neighbor says \"my roof looks fine,\" it's worth getting up there yourself or calling a professional. Here's exactly what to look for.",
    content: `<h2>1. Start With the Ground Level</h2>
<p>Before climbing anything, walk around your house and look at the roof from all angles. Hail damage on a roof often shows up first on the <strong>street-facing slope</strong>, since that's what took the brunt of the wind-driven hail. Look for:</p>
<ul>
<li>Dents or dings in gutters, downspouts, and gutter guards</li>
<li>Scrapes and dents on window frames, siding, and doors</li>
<li>Impact marks on the edge of the roof (rake edge)</li>
<li>Granules that have collected in valleys or against the foundation</li>
</ul>
<h2>2. Look at the Shingles Directly</h2>
<p>Asphalt shingles are the most common roofing material in Central PA, and they show hail damage clearly. You're looking for three main things:</p>
<h3>Bruising</h3>
<p>Run your hand gently over a shingle. If you feel a soft spot or a slight depression - like a small dent - that's bruising. It means the mat beneath the granules has been compromised. These are the most common and least obvious signs of hail damage.</p>
<h3>Missing Granules</h3>
<p>Shingles lose granules on impact. You'll see dark spots or exposed fiberglass mat where the granules have been knocked loose. On the ground, look for piles of grit in gutters or along foundation walls.</p>
<h3>Cracks and Splits</h3>
<p>Larger hail can crack or split shingles entirely. Look for lines across the shingle that radiate from a central impact point. Cracked shingles will almost always leak eventually.</p>
<h2>3. Check the Underside of Eaves and Overhangs</h2>
<p>The underside of rake edges and eaves are often the most honest indicators of hail damage. Grab a flashlight and look up under the overhangs. If there's damage on the bottom of the plywood or sheathing, you've got confirmed hail impact.</p>
<h2>4. Document Everything</h2>
<p>If you're filing an insurance claim, documentation is everything. Take extensive photos and video of all damage - <strong>before</strong> you cover anything or make repairs.</p>
<h2>5. Know the Timeline</h2>
<p>In Pennsylvania, you typically have <strong>2 years</strong> from the date of loss to file a homeowners insurance claim for storm damage. But don't wait - unaddressed hail damage worsens over time.</p>
<h2>6. When in Doubt, Call a Professional</h2>
<p>A trained roofer can spot damage that an untrained eye misses. At Revive Roof Repair, we do free storm damage inspections throughout Harrisburg, Hershey, Mechanicsburg, York, and surrounding areas.</p>
<h2>Frequently Asked Questions</h2>
<h3>How can I tell if my roof has hail damage?</h3>
<p>Look for bruising or dents in shingles, missing granules, cracked or split shingles, and damage to gutters, vents, or flashing. The underside of eaves often shows the first signs.</p>
<h3>Does hail damage always cause leaks?</h3>
<p>Not immediately. Small dents and bruises can take months or years to start leaking. But every day you wait, water intrusion slowly weakens the structure.</p>
<h3>Will my Pennsylvania homeowner's insurance cover hail damage?</h3>
<p>In most cases, yes. Pennsylvania homeowners policies generally cover hail damage as an act of nature.</p>`,
    category: "Roofing Guide",
    tags: ["hail damage", "roof inspection", "Pennsylvania", "storm damage", "shingles"],
    metaTitle: "How to Spot Hail Damage on Your Roof | PA Homeowner's Guide",
    metaDescription: "Learn to identify hail damage on your Pennsylvania roof before it causes leaks. Visual guide with photos. Free inspection available.",
    featuredImage: "/images/blog/hail-damage-inspection.jpg",
    publishedAt: "2025-10-20T12:00:00Z",
  },
  {
    slug: "best-roof-shingles-pennsylvania",
    title: "GAF vs CertainTeed vs Owens Corning: Best Shingles for PA Weather",
    excerpt: "If you're replacing your roof in Central Pennsylvania, you've probably noticed that GAF, CertainTeed, and Owens Corning dominate the market. All three make excellent products - but they each have different strengths.",
    content: `<h2>GAF Timberline HDZ - Best for Storm-Prone PA</h2>
<p><strong>What it is:</strong> GAF's flagship architectural shingle line. The Timberline HDZ offers excellent wind resistance (up to 130 mph when installed by a GAF Certified Contractor), strong algae resistance, and a wide range of colors.</p>
<p><strong>PA climate fit:</strong> Central PA gets high winds, hail, ice, and snow. Timberline HDZ handles all of it. GAF's StainGuard PLUS algae protection is especially valuable here - those dark streaks on roofs in Harrisburg are algae, and StainGuard holds up better than most competitors.</p>
<p><strong>Why certification matters:</strong> GAF's industry-best warranty requires installation by a GAF Certified Contractor. We are one.</p>
<h2>CertainTeed Landmark PRO - Best Overall Durability</h2>
<p><strong>What it is:</strong> Landmark PRO is CertainTeed's premium architectural shingle, offering 30-year StreakFighter algae resistance (best in the industry) and excellent dimensional stability.</p>
<p><strong>PA climate fit:</strong> CertainTeed's algae protection is the best in class - important in humid Central PA summers. The heavier weight handles thermal expansion and contraction better over Pennsylvania's freeze-thaw cycles.</p>
<h2>Owens Corning Duration Designer - Best Color Options</h2>
<p><strong>What it is:</strong> Owens Corning's Duration line is known for excellent color options and proprietary SureNail technology - a woven fabric strip in the nailing zone that makes installation more consistent and holds nails better in high winds.</p>
<p><strong>PA climate fit:</strong> Duration shingles perform well in Pennsylvania weather and SureNail technology is genuinely useful for preventing blow-offs during our windstorms.</p>
<h2>What Revive Installs and Why</h2>
<ul>
<li><strong>Storm-prone areas (York, Lancaster, Gettysburg):</strong> GAF Timberline HDZ - best wind and algae warranty for the price</li>
<li><strong>Historic or high-end homes (Hershey, Carlisle):</strong> CertainTeed Landmark PRO - best aesthetics and color options</li>
<li><strong>Budget-conscious homeowners:</strong> Owens Corning Duration - best value with SureNail technology</li>
</ul>`,
    category: "Product Guide",
    tags: ["roof shingles", "GAF", "CertainTeed", "Owens Corning", "Pennsylvania"],
    metaTitle: "Best Roof Shingles for Pennsylvania Weather | GAF vs CertainTeed vs Owens Corning",
    metaDescription: "Which shingle brands perform best in Pennsylvania weather? Honest comparison of GAF, CertainTeed, and Owens Corning - from a Central PA roofing contractor.",
    featuredImage: "/images/blog/shingle-brands-pa.jpg",
    publishedAt: "2025-10-25T12:00:00Z",
  },
  {
    slug: "asphalt-shingle-vs-metal-roof-cost-pennsylvania",
    title: "Asphalt Shingle vs Metal Roof: Central PA Cost Comparison",
    excerpt: "It's the question every Pennsylvania homeowner asks when it's time to replace their roof: asphalt shingles or metal? Both are excellent choices for Central PA - here's the honest comparison.",
    content: `<h2>Asphalt Shingles: The Pennsylvania Standard</h2>
<p><strong>Cost installed:</strong> $4-$7 per square foot for architectural (dimensional) shingles. A typical 2,000 sq ft Central PA home runs <strong>$10,000-$18,000</strong> fully installed.</p>
<p><strong>Why PA homeowners choose asphalt:</strong> It's affordable upfront, installs fast, and handles Pennsylvania weather well. Architectural shingles are significantly better than old 3-tab strips and are what most reputable contractors recommend.</p>
<p><strong>PA climate fit:</strong> Architectural shingles hold up well against wind, rain, and occasional hail. In snow and ice - which Central PA gets plenty of - traditional shingles perform adequately when paired with proper ventilation and ice dam prevention.</p>
<h2>Metal Roofing: The Long-Term Play</h2>
<p><strong>Cost installed:</strong> $8-$16 per square foot depending on panel type. A typical 2,000 sq ft home runs <strong>$20,000-$40,000</strong> fully installed.</p>
<p><strong>Why PA homeowners choose metal:</strong> Longevity and low maintenance. A properly installed metal roof in Central PA will likely outlast your mortgage. Standing seam metal panels expand and contract with temperature swings without cracking.</p>
<p><strong>PA climate fit:</strong> Metal handles snow and ice better than shingles. Smooth surfaces let snow and ice slide off rather than accumulating. In summer, reflective metal coatings reduce heat transfer and lower cooling costs.</p>
<h2>Energy Efficiency in Pennsylvania</h2>
<p>Metal roofs with reflective coatings can reduce cooling costs by 10-25% in summer. For Harrisburg-area homes with older AC systems, this adds up over time.</p>
<h2>What Revive Recommends for Central PA</h2>
<ul>
<li><strong>Budget-conscious, planning to move in 10-15 years:</strong> Architectural asphalt shingles. Best bang-for-buck and great resale value.</li>
<li><strong>Long-term ownership, want to do it once:</strong> Standing seam metal. Higher upfront cost, but no maintenance and likely the last roof you will ever buy.</li>
<li><strong>Storm/hail-prone area:</strong> Both materials perform well, but metal has a slight edge in hail and ice.</li>
</ul>`,
    category: "Buying Guide",
    tags: ["asphalt shingles", "metal roof", "cost comparison", "Pennsylvania", "roof replacement"],
    metaTitle: "Asphalt Shingle vs Metal Roof Cost in PA | Revive Roof Repair",
    metaDescription: "Asphalt shingles vs metal roofing - cost comparison for Central Pennsylvania homes. Lifespan, durability, energy efficiency, and what contractors recommend.",
    featuredImage: "/images/blog/shingle-comparison.jpg",
    publishedAt: "2025-10-30T12:00:00Z",
  },
  {
    slug: "does-insurance-cover-roof-replacement-pennsylvania",
    title: "Does Homeowners Insurance Cover Roof Replacement in Pennsylvania?",
    excerpt: "This is one of the most common questions we hear from Pennsylvania homeowners after a storm. The short answer: it depends on what caused the damage and the specific terms of your policy.",
    content: `<h2>What Pennsylvania Policies Typically Cover</h2>
<p>Most Pennsylvania homeowners insurance policies cover replacement cost for roof damage caused by:</p>
<ul>
<li>Hailstorms - Pennsylvania is one of the top hail states in the Mid-Atlantic</li>
<li>Wind damage - including hurricane and tornado remnants</li>
<li>Falling trees and limbs</li>
<li>Fire and lightning</li>
<li>Vandalism and theft</li>
</ul>
<h2>What's Usually NOT Covered</h2>
<p>Standard policies generally do NOT cover:</p>
<ul>
<li><strong>Wear and tear</strong> - If your 25-year-old roof is simply aging out, that is maintenance, not an insurable event</li>
<li><strong>Neglect</strong> - Failure to maintain your roof can void coverage</li>
<li><strong>Flood damage</strong> - Separate flood insurance required</li>
<li><strong>Earthquake damage</strong> - Requires a separate rider in most cases</li>
</ul>
<h2>Actual Cash Value vs. Replacement Cost</h2>
<p><strong>Replacement Cost (RCV)</strong> pays to rebuild your roof to current code standards, minus your deductible. This is what you want.</p>
<p><strong>Actual Cash Value (ACV)</strong> pays current value (replacement cost minus depreciation). If your 15-year-old roof has depreciated 50%, you only get 50% of replacement cost minus deductible.</p>
<h2>The Deductible Rule in Pennsylvania</h2>
<p>Pennsylvania law requires insurers to offer a <strong>minimum $500 deductible</strong> for roof claims. Know your deductible before you file - it comes off the top of every claim.</p>
<h2>How to File a Roof Claim in PA</h2>
<ol>
<li><strong>Call your insurance company</strong> - Report the damage as soon as possible</li>
<li><strong>Get a professional inspection</strong> - Before the adjuster comes, get your own roofer's assessment. We do free inspections and can meet the adjuster on-site.</li>
<li><strong>Document everything</strong> - Photos from multiple angles, weather records showing the storm date, and receipts for temporary repairs</li>
<li><strong>Review the estimate carefully</strong> - We review estimates for free</li>
<li><strong>Get the claim settled</strong> - If the estimate is too low, dispute it</li>
</ol>`,
    category: "Insurance Guide",
    tags: ["homeowners insurance", "roof replacement", "Pennsylvania", "insurance claim", "storm damage"],
    metaTitle: "Does Homeowners Insurance Cover Roof Replacement in PA? | Revive",
    metaDescription: "Does PA homeowners insurance cover roof replacement? Learn what's covered, what's excluded, and how to file a successful claim with your Pennsylvania insurer.",
    featuredImage: "/images/blog/insurance-review.jpg",
    publishedAt: "2025-11-05T12:00:00Z",
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("=== DRY RUN: no database writes ===\n");
    console.log(`Would seed ${STATIC_POSTS.length} posts:\n`);
    for (const post of STATIC_POSTS) {
      console.log(`  ✓ ${post.slug}`);
    }
    console.log("\nParity check:");
    console.log(`  Static slugs: ${STATIC_POSTS.map((p) => p.slug).join(", ")}`);
    console.log(`  Count: ${STATIC_POSTS.length}`);
    process.exit(0);
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log(`Seeding ${STATIC_POSTS.length} blog posts...\n`);
  let inserted = 0;
  let skipped = 0;

  for (const post of STATIC_POSTS) {
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⊘ ${post.slug} — already exists, skipped`);
      skipped++;
      continue;
    }

    await db.insert(blogPosts).values({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags as unknown as string[],
      status: "published" as const,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      featuredImage: post.featuredImage,
      publishedAt: new Date(post.publishedAt),
      author: "Revive Roof Repair",
      updatedAt: new Date(),
    });

    console.log(`  ✓ ${post.slug} — inserted`);
    inserted++;
  }

  await client.end();

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped (${STATIC_POSTS.length} total).`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
