import type { NextConfig } from "next";
import path from "node:path";

const replitDomains = (process.env.REPLIT_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const devOrigins = Array.from(
  new Set([
    ...replitDomains,
    ...replitDomains.map((d) => `*.${d}`),
    "*.replit.dev",
    "*.repl.co",
    "*.replit.app",
  ]),
);

const nextConfig: NextConfig = {
  // Monorepo root (contains pnpm-lock.yaml). Turbopack auto-detects the root
  // via the lockfile, but keep an explicit path-safe fallback for environments
  // where the Replit-specific hardcode used to break builds.
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  allowedDevOrigins: devOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img1.wsimg.com",
      },
    ],
  },
};

export default nextConfig;
