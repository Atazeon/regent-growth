const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderDailyRunHistoryItem(snapshot)");
const end = app.indexOf("function getDailyHistoryFailedProspects(snapshot)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history item renderer exists", start !== -1],
  ["history item summarizes generated count", body.includes("`${snapshot.generatedCount} generated`")],
  ["history item summarizes fetched count", body.includes("`${snapshot.fetchedCount} fetched`")],
  ["history item shows no-company fallback", body.includes('No companies processed')],
  ["history item can retry failed records", body.includes('data-action="retry-daily-history-failures"')],
  ["history item labels retry action", body.includes("Retry failures")],
  ["history item calculates retry availability", body.includes('const canRetry = snapshot.companies.length > 0 && (snapshot.status !== "Completed" || snapshot.failed > 0);')],
  ["history item can requeue stopped records", body.includes('data-action="requeue-stopped-daily-history"')],
  ["history item shows error text", body.includes('class="history-error"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history item actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history item actions test passed.");
