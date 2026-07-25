const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function runDailyAiWorkflow()");
const end = app.indexOf("function getDraftParts(rawDraft)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["workflow preflights model before generation", body.includes("await preflightDailyAiModel();")],
  ["workflow generates only when criteria exist", body.includes("if (hasDiscoveryCriteria && getDailyRunEligibleCandidates().length < limit) {")],
  ["workflow sets generation status", body.includes('setDataStatus("Daily AI generating discovery candidates...", "working");')],
  ["workflow requests enough candidates", body.includes("count: Math.max(criteria.count, limit)")],
  ["workflow records generated count", body.includes("runSnapshot.generatedCount = generatedCount;")],
  ["workflow auto-fetches evidence", body.includes("const fetchedCount = await autoFetchDailyRunEvidence(limit);")],
  ["workflow records fetched count", body.includes("runSnapshot.fetchedCount = fetchedCount;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI workflow generation test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI workflow generation test passed.");
