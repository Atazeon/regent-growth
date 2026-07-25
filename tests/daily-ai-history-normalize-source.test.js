const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function normalizeDailyRunSnapshot(snapshot)");
const end = app.indexOf("function clampScore(value)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["snapshot normalizer exists", start !== -1],
  ["normalizer defaults id", body.includes("id: snapshot.id || createId()")],
  ["normalizer defaults completed status", body.includes('status: snapshot.status || "Completed"')],
  ["normalizer coerces generated count", body.includes("generatedCount: Number(snapshot.generatedCount) || 0")],
  ["normalizer coerces fetched count", body.includes("fetchedCount: Number(snapshot.fetchedCount) || 0")],
  ["normalizer stores source", body.includes("source: snapshot.source || \"\"")],
  ["normalizer filters companies", body.includes("snapshot.companies.filter(Boolean)")],
  ["normalizer limits companies", body.includes(".slice(0, 12)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history normalize test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history normalize test passed.");
