/**
 * Scheduled entrypoint for the 7:00 AM Eastern daily-summary email job.
 *
 * Configure as a Replit Scheduled Deployment running daily at 11:00 UTC
 * (= 7:00 AM EDT / 6:00 AM EST). Required env:
 *   PORTAL_API_URL          e.g. https://portal-api.reviverepairco.com/api/v1
 *   INTERNAL_CRON_SECRET    shared secret matching portal-api
 */
async function main() {
  const base = process.env.PORTAL_API_URL;
  const secret = process.env.INTERNAL_CRON_SECRET;
  if (!base) {
    console.error("[daily-summary] PORTAL_API_URL is not set");
    process.exit(1);
  }
  if (!secret) {
    console.error("[daily-summary] INTERNAL_CRON_SECRET is not set");
    process.exit(1);
  }
  const url = `${base.replace(/\/+$/, "")}/internal/daily-summary`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`[daily-summary] ${res.status} ${body}`);
    process.exit(1);
  }
  console.log(`[daily-summary] ok: ${body}`);
}

main().catch((err) => {
  console.error("[daily-summary] crashed", err);
  process.exit(1);
});
