const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getAdapterReadinessExport } = require("../production-provider-middleware");

const readinessExport = getAdapterReadinessExport();

const checks = [
  ["middleware exports readiness export", typeof getAdapterReadinessExport === "function"],
  ["middleware has readiness export route", source.includes('requestUrl.pathname === "/adapter-readiness/export"')],
  ["readiness export schema exists", readinessExport.schemaVersion === "regent-growth.adapter-readiness-export.v1"],
  ["readiness export has timestamp", typeof readinessExport.generatedAt === "string" && readinessExport.generatedAt.length > 0],
  ["readiness export links checklist", readinessExport.checklist === "docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.md"],
  ["readiness export links machine checklist", readinessExport.machineChecklist === "docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json"],
  ["readiness export links readiness docs", readinessExport.readinessDocs === "docs/PRODUCTION_READINESS_REPORT.md"],
  ["readiness export includes report", readinessExport.report && readinessExport.report.schemaVersion === "regent-growth.adapter-readiness.v1"],
  ["readiness export keeps sent disabled", readinessExport.report.sentEnabled === false],
  ["readiness export keeps blocked providers", readinessExport.report.blockedProviders.includes("gmail")],
  ["project plan next readiness export exists", projectPlan.includes("- Production middleware readiness report export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production adapter readiness export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production adapter readiness export test passed.");
