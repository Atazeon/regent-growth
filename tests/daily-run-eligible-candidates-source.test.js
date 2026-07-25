const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const evidenceStart = app.indexOf("function isEvidenceReadyCandidate(candidate)");
const evidenceEnd = app.indexOf("function getDailyRunEligibleCandidates", evidenceStart);
const evidenceBody = evidenceStart === -1 || evidenceEnd === -1 ? "" : app.slice(evidenceStart, evidenceEnd);
const eligibleStart = app.indexOf("function getDailyRunEligibleCandidates");
const eligibleEnd = app.indexOf("function resetDailyRunLog()", eligibleStart);
const eligibleBody = eligibleStart === -1 || eligibleEnd === -1 ? "" : app.slice(eligibleStart, eligibleEnd);

const checks = [
  ["evidence readiness helper exists", evidenceStart !== -1],
  ["evidence readiness accepts found status", evidenceBody.includes('candidate.sourceStatus === "Evidence Found"')],
  ["evidence readiness accepts notes", evidenceBody.includes("Boolean(candidate.sourceNotes?.trim())")],
  ["eligible candidates helper exists", eligibleStart !== -1],
  ["eligible candidates default to evidence toggle", eligibleBody.includes("requireEvidence = shouldDailyRunRequireEvidence()")],
  ["eligible candidates reject rejected sources", eligibleBody.includes('candidate.sourceStatus !== "Rejected"')],
  ["eligible candidates enforce evidence when required", eligibleBody.includes("(!requireEvidence || isEvidenceReadyCandidate(candidate))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily run eligible candidates test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily run eligible candidates test passed.");
