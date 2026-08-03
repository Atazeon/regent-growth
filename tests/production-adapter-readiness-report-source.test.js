const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getAdapterReadinessReport } = require("../production-provider-middleware");

const report = getAdapterReadinessReport();
const providerNames = report.adapters.map((adapter) => adapter.provider);
const gmail = report.adapters.find((adapter) => adapter.provider === "gmail");
const outlook = report.adapters.find((adapter) => adapter.provider === "outlook");
const custom = report.adapters.find((adapter) => adapter.provider === "custom");

const checks = [
  ["middleware exports readiness report", typeof getAdapterReadinessReport === "function"],
  ["middleware has adapter readiness route", source.includes('requestUrl.pathname === "/adapter-readiness"')],
  ["report schema exists", report.schemaVersion === "regent-growth.adapter-readiness.v1"],
  ["report has timestamp", typeof report.checkedAt === "string" && report.checkedAt.length > 0],
  ["report disables sending", report.sentEnabled === false],
  ["report disables booking", report.bookedEnabled === false],
  ["report lists stub", providerNames.includes("stub")],
  ["report lists gmail", providerNames.includes("gmail")],
  ["report lists outlook", providerNames.includes("outlook")],
  ["report lists custom", providerNames.includes("custom")],
  ["gmail is blocked", gmail.readyForImplementation === false && gmail.blockedReasons.includes("Adapter is skeleton-only.")],
  ["gmail reports missing env", gmail.missingEnv.includes("REGENT_GMAIL_CLIENT_ID")],
  ["outlook reports missing env", outlook.missingEnv.includes("REGENT_OUTLOOK_TENANT_ID")],
  ["custom reports missing env", custom.missingEnv.includes("REGENT_CUSTOM_SEND_URL")],
  ["report has no ready providers", Array.isArray(report.readyProviders) && report.readyProviders.length === 0],
  ["report has blocked providers", report.blockedProviders.includes("gmail") && report.blockedProviders.includes("custom")],
  ["project plan next adapter readiness exists", projectPlan.includes("- Production middleware adapter readiness report")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production adapter readiness report test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production adapter readiness report test passed.");
