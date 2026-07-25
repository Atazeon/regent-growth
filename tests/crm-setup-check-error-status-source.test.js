const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function checkCrmSetup()");
const end = app.indexOf("async function syncCrmRecords(", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["check CRM setup function exists", start !== -1],
  ["http failures throw setup error", body.includes("throw new Error(`CRM setup check returned ${response.status}.`);")],
  ["not configured status has fallback message", body.includes('status.message || "CRM connector is not configured. Set REGENT_CRM_API_URL before starting the local server."')],
  ["not configured status uses error state", body.includes('ready ? "" : "error"')],
  ["catch uses local file guidance", body.includes('getLocalResearchServerGuidance("CRM setup check")')],
  ["catch uses error state", body.includes('"error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup check error status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup check error status test passed.");
