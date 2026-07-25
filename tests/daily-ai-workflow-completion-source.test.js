const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function runDailyAiWorkflow()");
const end = app.indexOf("function getDraftParts(rawDraft)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["workflow prioritizes existing prospects", body.includes("const existingProspects = getExistingDailyRunProspects(limit);")],
  ["workflow promotes only remaining capacity", body.includes("const addedProspects = remainingCapacity > 0 ? addDailyRunProspects(remainingCapacity) : [];")],
  ["workflow processes existing plus promoted prospects", body.includes("const prospectsToProcess = [...existingProspects, ...addedProspects];")],
  ["workflow stores processed companies", body.includes("runSnapshot.companies = prospectsToProcess.map((prospect) => prospect.company).filter(Boolean);")],
  ["workflow records research results", body.includes("runSnapshot.researched = results.researched;")],
  ["workflow records draft results", body.includes("runSnapshot.drafted = results.drafted;")],
  ["workflow records skipped results", body.includes("runSnapshot.skipped = results.skipped;")],
  ["workflow records failed results", body.includes("runSnapshot.failed = results.failed;")],
  ["workflow records history on success", body.includes("recordDailyRunHistory(runSnapshot);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI workflow completion test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI workflow completion test passed.");
