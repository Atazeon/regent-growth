const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function autoFetchDailyRunEvidence(limit)");
const end = app.indexOf("function addDailyRunProspects(limit)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["auto-fetch helper exists", start !== -1],
  ["auto-fetch respects toggle", body.includes("if (!shouldDailyRunAutoFetchEvidence()) return 0;")],
  ["auto-fetch skips rejected candidates", body.includes('candidate.sourceStatus !== "Rejected"')],
  ["auto-fetch skips evidence-ready candidates", body.includes("!isEvidenceReadyCandidate(candidate)")],
  ["auto-fetch respects run limit", body.includes(".slice(0, limit)")],
  ["auto-fetch calls candidate fetcher", body.includes("await fetchEvidenceForCandidate(candidate);")],
  ["auto-fetch records failures in notes", body.includes("Source auto-fetch failed: ${error.message}")],
  ["auto-fetch saves queue after attempts", body.includes("saveDiscoveryQueue();")],
  ["auto-fetch returns fetched count", body.includes("return fetchedCount;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI auto-fetch evidence test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI auto-fetch evidence test passed.");
