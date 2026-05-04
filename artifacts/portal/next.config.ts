import type { NextConfig } from "next";

const basePath = process.env.PORTAL_BASE_PATH ?? "/portal";

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
  basePath,
  assetPrefix: basePath || undefined,
  allowedDevOrigins: devOrigins,
  serverExternalPackages: ["postgres"],
  turbopack: {
    root: "/home/runner/workspace",
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/portal/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/portal/sign-up",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
