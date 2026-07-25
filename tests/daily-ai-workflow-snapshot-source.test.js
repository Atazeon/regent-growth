const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function runDailyAiWorkflow()");
const end = app.indexOf("function getDraftParts(rawDraft)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["workflow exists", start !== -1],
  ["workflow reads discovery criteria", body.includes("const criteria = getDiscoveryCriteria();")],
  ["workflow reads daily limit", body.includes("const limit = getDailyRunLimit();")],
  ["workflow reads readiness", body.includes("const readiness = getDailyRunReadiness();")],
  ["workflow initializes snapshot id", body.includes("id: createId()")],
  ["workflow initializes running status", body.includes('status: "Running"')],
  ["workflow records selected model", body.includes("model: modelSelect.value")],
  ["workflow initializes company list", body.includes("companies: []")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI workflow snapshot test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI workflow snapshot test passed.");
