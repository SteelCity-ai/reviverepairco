// Focused tests for the public blog client: response parsing and the
// graceful-degradation path. No network access — `fetch` is stubbed.
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  excerptFromBody,
  formatPostDate,
  getPublishedPostBySlug,
  getPublishedPosts,
} from "./blog-api.ts";

const realFetch = globalThis.fetch;
const realConsoleError = console.error;

type FetchStub = (url: string) => Response | Promise<Response>;

function stubFetch(stub: FetchStub) {
  const seen: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    seen.push(String(input));
    return stub(String(input));
  }) as typeof fetch;
  return seen;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  // The client logs expected failures; keep test output readable.
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realConsoleError;
});

const validPost = {
  id: "p1",
  slug: "storm-checklist",
  title: "Storm Checklist",
  excerpt: "What to do after a storm.",
  bodyMd: "# Storm\n\nCall us.",
  heroImageUrl: "https://example.com/hero.jpg",
  contentFocus: "storm-damage",
  localityTags: ["Harrisburg", "Carlisle", 7],
  tags: ["roofing"],
  publishedAt: "2026-08-01T12:00:00.000Z",
  createdAt: "2026-07-30T12:00:00.000Z",
};

test("getPublishedPosts parses valid posts and defaults optional fields", async () => {
  const seen = stubFetch(() =>
    jsonResponse({
      data: [
        validPost,
        { slug: "minimal", title: "Minimal", bodyMd: "Body" },
      ],
      pagination: { total: 2, limit: 24, offset: 0 },
    }),
  );

  const result = await getPublishedPosts();

  assert.equal(seen.length, 1);
  assert.match(seen[0], /\/blog\/public\?limit=24&offset=0$/);
  assert.equal(result.posts.length, 2);
  assert.equal(result.pagination.total, 2);

  const [full, minimal] = result.posts;
  assert.equal(full.slug, "storm-checklist");
  assert.deepEqual(full.localityTags, ["Harrisburg", "Carlisle"]);
  assert.equal(full.heroImageUrl, "https://example.com/hero.jpg");

  assert.equal(minimal.id, "");
  assert.equal(minimal.excerpt, null);
  assert.equal(minimal.heroImageUrl, null);
  assert.deepEqual(minimal.tags, []);
  assert.equal(minimal.createdAt, "");
});

test("getPublishedPosts drops malformed entries instead of throwing", async () => {
  stubFetch(() =>
    jsonResponse({
      data: [
        null,
        "not-a-post",
        { title: "Missing slug", bodyMd: "Body" },
        { slug: "missing-title", bodyMd: "Body" },
        { slug: "missing-body", title: "Missing body" },
        validPost,
      ],
    }),
  );

  const result = await getPublishedPosts();

  assert.deepEqual(
    result.posts.map((post) => post.slug),
    ["storm-checklist"],
  );
  // No pagination block: total reflects the parsed posts.
  assert.deepEqual(result.pagination, { total: 1, limit: 24, offset: 0 });
});

test("getPublishedPosts degrades to an empty list on a non-200 response", async () => {
  stubFetch(() => jsonResponse({ error: "Unauthorized" }, 401));

  const result = await getPublishedPosts();

  assert.deepEqual(result.posts, []);
  assert.deepEqual(result.pagination, { total: 0, limit: 24, offset: 0 });
});

test("getPublishedPosts degrades to an empty list when fetch throws", async () => {
  stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

  const result = await getPublishedPosts();

  assert.deepEqual(result.posts, []);
  assert.equal(result.pagination.total, 0);
});

test("getPublishedPostBySlug returns null for 404 and 401", async () => {
  stubFetch(() => jsonResponse({ error: "Not found" }, 404));
  assert.equal(await getPublishedPostBySlug("missing"), null);

  stubFetch(() => jsonResponse({ error: "Unauthorized" }, 401));
  assert.equal(await getPublishedPostBySlug("storm-checklist"), null);
});

test("getPublishedPostBySlug returns null when fetch throws", async () => {
  stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));
  assert.equal(await getPublishedPostBySlug("storm-checklist"), null);
});

test("getPublishedPostBySlug parses a published post", async () => {
  const seen = stubFetch(() => jsonResponse(validPost));

  const post = await getPublishedPostBySlug("storm checklist");

  assert.equal(seen.length, 1);
  assert.match(seen[0], /\/blog\/public\/storm%20checklist$/);
  assert.equal(post?.title, "Storm Checklist");
  assert.equal(post?.contentFocus, "storm-damage");
});

test("formatPostDate and excerptFromBody render stable public text", () => {
  assert.equal(formatPostDate("2026-08-01T12:00:00.000Z"), "August 1, 2026");
  assert.equal(formatPostDate(null), "");
  assert.equal(formatPostDate("not-a-date"), "");

  const excerpt = excerptFromBody("# Heading\n\nSome **bold** [link](https://x.test) text.");
  assert.equal(excerpt, "Heading Some bold link text.");
});
