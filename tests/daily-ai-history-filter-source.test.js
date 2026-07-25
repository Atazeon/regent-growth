const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getVisibleDailyRunHistory()");
const end = app.indexOf("function renderDailyRunHistoryItem(snapshot)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["visible history helper exists", start !== -1],
  ["visible history returns all", body.includes('if (dailyRunHistoryStatusFilter === "all") return dailyRunHistory;')],
  ["visible history supports skipped filter", body.includes('if (dailyRunHistoryStatusFilter === "skipped") {')],
  ["visible history filters skipped count", body.includes("return dailyRunHistory.filter((snapshot) => snapshot.skipped > 0);")],
  ["visible history filters by status", body.includes("return dailyRunHistory.filter((snapshot) => snapshot.status === dailyRunHistoryStatusFilter);")],
  ["history item limit helper exists", app.includes("function getVisibleDailyRunHistoryItems(items) {")],
  ["history item limit defaults first five", app.includes("return showAllDailyRunHistory ? items : items.slice(0, 5);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history filter test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history filter test passed.");
