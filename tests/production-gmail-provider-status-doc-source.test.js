const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_PROVIDER_STATUS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail status doc title exists", doc.includes("# Production Gmail Provider Status")],
  ["gmail status doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/gmail/status")],
  ["gmail status doc names schema", doc.includes("regent-growth.gmail-provider-status.v1")],
  ["gmail status doc blocks canSend", doc.includes("canSend: false")],
  ["gmail status doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail status doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail status doc names client id", doc.includes("REGENT_GMAIL_CLIENT_ID")],
  ["gmail status doc names client secret", doc.includes("REGENT_GMAIL_CLIENT_SECRET")],
  ["gmail status doc names refresh token", doc.includes("REGENT_GMAIL_REFRESH_TOKEN")],
  ["gmail status doc explains missing env", doc.includes("missingEnv")],
  ["gmail status doc explains configured env", doc.includes("configuredEnv")],
  ["gmail status doc blocks token logging", doc.includes("Do not log token values")],
  ["gmail status doc links implementation guard", doc.includes("/provider-implementation-guard?provider=gmail")],
  ["gmail status doc links decision record", doc.includes("/provider-decision-record?provider=gmail")],
  ["gmail status doc blocks approval", doc.includes("does not approve Gmail sending")],
  ["project plan next gmail env status docs exists", projectPlan.includes("- First Gmail provider adapter env status docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail provider status doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail provider status doc test passed.");
