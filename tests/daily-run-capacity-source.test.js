const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const existingStart = app.indexOf("function getExistingDailyRunProspects(limit)");
const existingEnd = app.indexOf("function getDailyRunCapacity", existingStart);
const existingBody = existingStart === -1 || existingEnd === -1 ? "" : app.slice(existingStart, existingEnd);
const capacityStart = app.indexOf("function getDailyRunCapacity");
const capacityEnd = app.indexOf("function getDailyRunReadiness()", capacityStart);
const capacityBody = capacityStart === -1 || capacityEnd === -1 ? "" : app.slice(capacityStart, capacityEnd);

const checks = [
  ["existing daily prospects helper exists", existingStart !== -1],
  ["existing helper targets research and drafted stages", existingBody.includes('["Research", "Email Drafted"].includes(prospect.stage)')],
  ["existing helper skips completed AI work", existingBody.includes("!prospect.aiBrief || !prospect.aiEmail")],
  ["existing helper respects limit", existingBody.includes(".slice(0, limit)")],
  ["capacity helper exists", capacityStart !== -1],
  ["capacity calculates remaining capacity", capacityBody.includes("const remainingCapacity = Math.max(0, limit - existingCount);")],
  ["capacity counts eligible candidates", capacityBody.includes("const eligibleCandidateCount = getDailyRunEligibleCandidates().length;")],
  ["capacity plans promotions within remaining slots", capacityBody.includes("plannedCandidateCount: Math.min(remainingCapacity, eligibleCandidateCount)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily run capacity test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily run capacity test passed.");
