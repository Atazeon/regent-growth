const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderDailyRunHistory()");
const end = app.indexOf("function renderDailyRunHistoryCountBadge", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history renderer exists", start !== -1],
  ["history renderer handles empty state", body.includes("Completed Daily AI runs will appear here.")],
  ["history renderer includes filter select", body.includes('data-action="filter-daily-history"')],
  ["history renderer includes clear filter", body.includes('data-action="clear-daily-history-filter"')],
  ["history renderer includes reset view", body.includes('data-action="reset-daily-history-view"')],
  ["history renderer includes copy summary", body.includes('data-action="copy-daily-history-summary"')],
  ["history renderer includes JSON export", body.includes('data-action="export-daily-history"')],
  ["history renderer includes CSV export", body.includes('data-action="export-daily-history-csv"')],
  ["history renderer includes compact toggle", body.includes('data-action="toggle-compact-daily-history"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history render actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history render actions test passed.");
