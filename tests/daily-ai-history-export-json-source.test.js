const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportDailyRunHistoryJson()");
const end = app.indexOf("function getDailyRunHistorySourceSummary(historyItems)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history JSON export exists", start !== -1],
  ["JSON export uses visible history", body.includes("const visibleHistory = getVisibleDailyRunHistory();")],
  ["JSON export blocks empty history", body.includes("No Daily AI run history to export.")],
  ["JSON export timestamps payload", body.includes("const exportedAt = new Date().toISOString();")],
  ["JSON export includes status filter", body.includes("statusFilter: dailyRunHistoryStatusFilter")],
  ["JSON export includes source summary", body.includes("sources: getDailyRunHistorySourceSummary(visibleHistory)")],
  ["JSON export includes runs", body.includes("runs: visibleHistory")],
  ["JSON export downloads JSON", body.includes("application/json;charset=utf-8")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history JSON export test passed.");
