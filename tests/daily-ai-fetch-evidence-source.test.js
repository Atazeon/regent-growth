const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function fetchEvidenceForCandidate(candidate)");
const end = app.indexOf("async function autoFetchDailyRunEvidence(limit)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["fetch evidence helper exists", start !== -1],
  ["fetch evidence validates website", body.includes("if (!url)")],
  ["fetch evidence posts to local source endpoint", body.includes("await fetch(sourceFetchEndpoint")],
  ["fetch evidence sends JSON", body.includes('"Content-Type": "application/json"')],
  ["fetch evidence sends normalized url", body.includes("body: JSON.stringify({ url })")],
  ["fetch evidence handles failed response", body.includes("if (!response.ok)")],
  ["fetch evidence formats result", body.includes("const fetchedEvidence = formatFetchedEvidence(result);")],
  ["fetch evidence marks candidate found", body.includes('candidate.sourceStatus = "Evidence Found";')],
  ["fetch evidence appends source notes", body.includes("candidate.sourceNotes = candidate.sourceNotes")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI fetch evidence test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI fetch evidence test passed.");
