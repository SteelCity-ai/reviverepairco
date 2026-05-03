import type { NextConfig } from "next";

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
  turbopack: {
    root: "/home/runner/workspace",
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
