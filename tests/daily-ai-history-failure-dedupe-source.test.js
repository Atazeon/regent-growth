const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getVisibleDailyHistoryFailedItems(historyItems = getVisibleDailyRunHistory())");
const end = app.indexOf("function getDailyHistoryUnfinishedProspects(snapshot)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["visible failed items helper exists", start !== -1],
  ["visible failed items creates accumulator", body.includes("const failedProspects = [];")],
  ["visible failed items creates seen set", body.includes("const seenProspects = new Set();")],
  ["visible failed items walks history", body.includes("historyItems.forEach((snapshot) => {")],
  ["visible failed items gets per-snapshot failures", body.includes("getDailyHistoryFailedProspects(snapshot).forEach((prospect) => {")],
  ["visible failed items keys by id or company", body.includes("const key = prospect.id || getCompanyMatchKey(prospect.company);")],
  ["visible failed items dedupes", body.includes("if (!key || seenProspects.has(key)) return;")],
  ["visible failed items preserves prospect index", body.includes("failedProspects.push({ prospect, index: prospects.indexOf(prospect) });")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history failure dedupe test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history failure dedupe test passed.");
