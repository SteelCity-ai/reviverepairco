// Focused tests for the static blog index source of truth. No network access:
// this module is plain data plus two filesystem checks so the listing can never
// point at a route or an image that does not exist.
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { BLOG_POSTS } from "./blog-posts.ts";

const webRoot = path.resolve(import.meta.dirname, "..");
const blogRoutesDir = path.join(webRoot, "app", "blog");
const publicDir = path.join(webRoot, "public");

test("lists the five published articles", () => {
  assert.equal(BLOG_POSTS.length, 5);
});

test("every entry has the fields the index renders", () => {
  for (const post of BLOG_POSTS) {
    assert.ok(post.slug.length > 0, "slug is required");
    assert.ok(post.title.trim().length > 0, `${post.slug}: title is required`);
    assert.ok(post.excerpt.trim().length > 0, `${post.slug}: excerpt is required`);
    assert.ok(post.heroImage.startsWith("/"), `${post.slug}: heroImage must be root-relative`);
    assert.ok(post.heroAlt.trim().length > 0, `${post.slug}: heroAlt is required`);
    assert.ok(
      Number.isInteger(post.readingMinutes) && post.readingMinutes > 0,
      `${post.slug}: readingMinutes must be a positive integer`,
    );
  }
});

test("slugs are unique", () => {
  const slugs = BLOG_POSTS.map((post) => post.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every slug has a static route directory under app/blog", () => {
  const routeDirs = readdirSync(blogRoutesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
    .map((entry) => entry.name);

  for (const post of BLOG_POSTS) {
    assert.ok(
      routeDirs.includes(post.slug),
      `${post.slug}: no app/blog/${post.slug}/page.tsx route`,
    );
    assert.ok(
      existsSync(path.join(blogRoutesDir, post.slug, "page.tsx")),
      `${post.slug}: route directory is missing page.tsx`,
    );
  }
});

test("every heroImage resolves to a file under public", () => {
  for (const post of BLOG_POSTS) {
    const imagePath = path.join(publicDir, post.heroImage);
    assert.ok(existsSync(imagePath), `${post.slug}: missing ${post.heroImage}`);
  }
});
