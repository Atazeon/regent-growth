const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getDailyRunHistoryStatusCounts()");
const end = app.indexOf("function getDailyRunHistoryStatusCount(status)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["status counts helper exists", start !== -1],
  ["status counts reduce history", body.includes("dailyRunHistory.reduce((counts, snapshot) => {")],
  ["status counts track skipped", body.includes("if (snapshot.skipped > 0) counts.skipped = (counts.skipped || 0) + 1;")],
  ["status counts include all", body.includes('{ all: dailyRunHistory.length }')],
  ["status counts include completed", body.includes('["Completed", "Completed"]')],
  ["status counts include failures", body.includes('["Completed with failures", "With failures"]')],
  ["status counts include stopped", body.includes('["Stopped", "Stopped"]')],
  ["status counts include failed", body.includes('["Failed", "Failed"]')],
  ["status counts maps labels and counts", body.includes("return countItems.map(([value, label]) => ({")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history status counts test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history status counts test passed.");
