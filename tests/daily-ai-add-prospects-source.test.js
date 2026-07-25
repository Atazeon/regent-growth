const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function addDailyRunProspects(limit)");
const end = app.indexOf("function getExistingDailyRunProspects(limit)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["add prospects helper exists", start !== -1],
  ["add prospects uses evidence requirement", body.includes("const requireEvidence = shouldDailyRunRequireEvidence();")],
  ["add prospects gets eligible candidates", body.includes("const candidates = getDailyRunEligibleCandidates(requireEvidence);")],
  ["add prospects stops at limit", body.includes("if (addedProspects.length >= limit) return;")],
  ["add prospects converts candidate", body.includes("const prospect = discoveryCandidateToProspect(candidate);")],
  ["add prospects adds to front of pipeline", body.includes("prospects.unshift(prospect);")],
  ["add prospects removes promoted candidates", body.includes("discoveryQueue = discoveryQueue.filter((candidate) => !promotedCandidates.includes(candidate));")],
  ["add prospects saves both queues", body.includes("saveDiscoveryQueue();") && body.includes("saveProspects();")],
  ["add prospects returns added prospects", body.includes("return addedProspects;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI add prospects test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI add prospects test passed.");
