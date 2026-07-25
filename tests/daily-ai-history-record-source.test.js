const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function recordDailyRunHistory(snapshot)");
const end = app.indexOf("function renderDailyRunHistory()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history recorder exists", start !== -1],
  ["recorder normalizes snapshot", body.includes("const normalizedSnapshot = normalizeDailyRunSnapshot({")],
  ["recorder backfills finish time", body.includes("finishedAt: snapshot.finishedAt || new Date().toISOString()")],
  ["recorder prepends latest snapshot", body.includes("dailyRunHistory = [normalizedSnapshot, ...dailyRunHistory].slice(0, 10);")],
  ["recorder saves history", body.includes("saveDailyRunHistory();")],
  ["recorder re-renders history", body.includes("renderDailyRunHistory();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history record test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history record test passed.");
