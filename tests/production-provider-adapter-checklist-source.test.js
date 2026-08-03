const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const checklist = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.md"), "utf8");
const planDoc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["checklist title exists", checklist.includes("# Production Provider Adapter Checklist")],
  ["checklist keeps automation disabled", checklist.includes("automationAllowed: false")],
  ["checklist requires human review", checklist.includes("Keep human review required")],
  ["checklist requires compliance review", checklist.includes("Keep compliance review required")],
  ["checklist requires release gate", checklist.includes("Require release gate evidence")],
  ["checklist requires suppression", checklist.includes("Require suppression-list checks")],
  ["checklist requires unsubscribe", checklist.includes("Require unsubscribe or opt-out text")],
  ["checklist requires sender match", checklist.includes("sender identity matching")],
  ["checklist requires audit records", checklist.includes("before-send and after-send audit records")],
  ["checklist keeps body out of audit exports", checklist.includes("Keep message body out of audit exports")],
  ["checklist has gmail section", checklist.includes("## Gmail Adapter")],
  ["checklist has outlook section", checklist.includes("## Outlook Adapter")],
  ["checklist has custom section", checklist.includes("## Custom Adapter")],
  ["checklist blocks canSend true", checklist.includes("Do not set `canSend: true`")],
  ["plan links checklist", planDoc.includes("docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.md")],
  ["project plan next checklist exists", projectPlan.includes("- Production middleware provider adapter checklist")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider adapter checklist test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider adapter checklist test passed.");
