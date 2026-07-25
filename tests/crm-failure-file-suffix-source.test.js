const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmFailureReasonFileSuffix()");
const end = app.indexOf("function exportReviewedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failure file suffix function exists", start !== -1],
  ["all filter has no suffix", body.includes('if (crmFailureReasonFilter === "all") return "";')],
  ["suffix lowercases reason", body.includes("crmFailureReasonFilter.toLowerCase()")],
  ["suffix replaces unsafe characters", body.includes('replace(/[^a-z0-9]+/g, "-")')],
  ["suffix trims edge dashes", body.includes('replace(/^-|-$/g, "")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failure file suffix test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failure file suffix test passed.");
