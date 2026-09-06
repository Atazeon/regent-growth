const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_PROVIDER_STATUS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook status doc title exists", doc.includes("# Production Outlook Provider Status")],
  ["outlook status doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/outlook/status")],
  ["outlook status doc names schema", doc.includes("regent-growth.outlook-provider-status.v1")],
  ["outlook status doc blocks canSend", doc.includes("canSend: false")],
  ["outlook status doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook status doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook status doc names client id", doc.includes("REGENT_OUTLOOK_CLIENT_ID")],
  ["outlook status doc names client secret", doc.includes("REGENT_OUTLOOK_CLIENT_SECRET")],
  ["outlook status doc names tenant id", doc.includes("REGENT_OUTLOOK_TENANT_ID")],
  ["outlook status doc names refresh token", doc.includes("REGENT_OUTLOOK_REFRESH_TOKEN")],
  ["outlook status doc explains missing env", doc.includes("missingEnv")],
  ["outlook status doc explains configured env", doc.includes("configuredEnv")],
  ["outlook status doc blocks token logging", doc.includes("Do not log token values")],
  ["outlook status doc links implementation guard", doc.includes("/provider-implementation-guard?provider=outlook")],
  ["outlook status doc links decision record", doc.includes("/provider-decision-record?provider=outlook")],
  ["outlook status doc blocks approval", doc.includes("does not approve Outlook sending")],
  ["project plan next outlook env status docs exists", projectPlan.includes("- First Outlook provider env status docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook provider status doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook provider status doc test passed.");
