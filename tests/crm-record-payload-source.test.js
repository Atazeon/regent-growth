const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmRecord(prospect)");
const end = app.indexOf("function getCrmFailureReasonGroup", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM record helper exists", start !== -1],
  ["record includes company", body.includes("company: prospect.company")],
  ["record includes contact fields", body.includes("email: prospect.contactEmail") && body.includes("phone: prospect.contactPhone")],
  ["record includes lead score", body.includes("leadScore: leadSummary.score")],
  ["record includes tier", body.includes("leadTier: leadSummary.tier")],
  ["record includes score reasons", body.includes('leadScoreReasons: leadSummary.reasons.join("; ")')],
  ["record includes handoff owner", body.includes("handoffOwner: prospect.handoffOwner")],
  ["record includes CRM status", body.includes("crmSyncStatus: prospect.crmSyncStatus")],
  ["record includes sync timestamp", body.includes("crmSyncedAt: prospect.crmSyncedAt")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM record payload test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM record payload test passed.");
