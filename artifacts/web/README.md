This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

All variables are optional at build time; each feature degrades gracefully when
its variable is missing.

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_PORTAL_URL` | portal links in the header | Browser-facing portal URL (default `https://portal.reviverepairco.com`) |
| `PORTAL_API_URL` | `/blog` listing, `/blog/[slug]`, `/sitemap.xml` | Base URL of the portal public API, including version path (default `https://portal-dev.reviverepairco.com/api/v1`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | `lib/email.ts` | Contact-form notification mail |
| `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` | `lib/email.ts` | Gmail OAuth alternative to SMTP |
| `REPLIT_DOMAINS` | `next.config.ts` | Extra allowed dev origins when running on Replit |

`PORTAL_API_URL` must point at the API root that serves `/blog/public`; for
example `https://portal.reviverepairco.com/api/v1`. If the endpoint is
unreachable or rejects anonymous calls, the blog pages render an empty state
instead of failing the build or the request.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
