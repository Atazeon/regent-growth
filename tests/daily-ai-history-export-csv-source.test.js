const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportDailyRunHistoryCsv()");
const end = app.indexOf("function clearDailyRunHistory()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history CSV export exists", start !== -1],
  ["CSV export uses visible history", body.includes("const visibleHistory = getVisibleDailyRunHistory();")],
  ["CSV export blocks empty history", body.includes("No Daily AI run history to export.")],
  ["CSV export includes source header", body.includes('"source"')],
  ["CSV export includes generated header", body.includes('"generatedCount"')],
  ["CSV export joins companies", body.includes('snapshot.companies.join("; ")')],
  ["CSV export uses csvCell", body.includes("csvCell(header === \"companies\" ? snapshot.companies.join(\"; \") : snapshot[header])")],
  ["CSV export downloads csv", body.includes("text/csv;charset=utf-8")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history CSV export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history CSV export test passed.");
