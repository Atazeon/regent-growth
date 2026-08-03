const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const markdown = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.md"), "utf8");
const checklistExportPath = path.join(root, "docs", "PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json");
const checklistExport = JSON.parse(fs.readFileSync(checklistExportPath, "utf8"));
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["checklist export file exists", fs.existsSync(checklistExportPath)],
  ["checklist links json export", markdown.includes("PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json")],
  ["checklist export schema exists", checklistExport.schemaVersion === "regent-growth.provider-adapter-checklist.v1"],
  ["checklist export keeps default no-send", checklistExport.canSendDefault === false],
  ["checklist export excludes body content", checklistExport.bodyContentStoredInAuditExports === false],
  ["checklist export has shared gates", Array.isArray(checklistExport.sharedGates) && checklistExport.sharedGates.length >= 10],
  ["checklist export requires automation false", checklistExport.sharedGates.includes("automationAllowed false")],
  ["checklist export requires suppression", checklistExport.sharedGates.includes("suppression-list check required")],
  ["checklist export requires unsubscribe", checklistExport.sharedGates.includes("unsubscribe or opt-out text required")],
  ["checklist export has gmail provider", checklistExport.providers.gmail.canSend === false],
  ["checklist export has gmail env", checklistExport.providers.gmail.requiredEnv.includes("REGENT_GMAIL_REFRESH_TOKEN")],
  ["checklist export has outlook provider", checklistExport.providers.outlook.canSend === false],
  ["checklist export has outlook env", checklistExport.providers.outlook.requiredEnv.includes("REGENT_OUTLOOK_TENANT_ID")],
  ["checklist export has custom provider", checklistExport.providers.custom.canSend === false],
  ["checklist export has custom env", checklistExport.providers.custom.requiredEnv.includes("REGENT_CUSTOM_SEND_URL")],
  ["checklist export blocks canSend true", checklistExport.releaseRule.includes("Do not set canSend true")],
  ["project plan next checklist export exists", projectPlan.includes("- Production middleware provider adapter checklist export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider adapter checklist export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider adapter checklist export test passed.");
