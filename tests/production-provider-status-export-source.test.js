const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["copy provider status button exists", html.includes('id="copyProductionProviderStatusButton"')],
  ["download provider status button exists", html.includes('id="downloadProductionProviderStatusButton"')],
  ["copy provider status selector exists", app.includes('const copyProductionProviderStatusButton = document.querySelector("#copyProductionProviderStatusButton")')],
  ["download provider status selector exists", app.includes('const downloadProductionProviderStatusButton = document.querySelector("#downloadProductionProviderStatusButton")')],
  ["provider status record exists", app.includes("function getProductionProviderStatusRecord()")],
  ["provider status includes setup", app.includes("setup: productionIntegrationSetup")],
  ["provider status includes server", app.includes("serverStatus: productionIntegrationServerStatus")],
  ["provider status includes stub", app.includes("stubMode: isProductionProviderStubStatus()")],
  ["provider status includes compliance", app.includes("compliance: getProductionComplianceSummary()")],
  ["provider status includes release gate", app.includes("releaseGate: getProductionReleaseGateSummary()")],
  ["provider status copy exists", app.includes("async function copyProductionProviderStatus()")],
  ["provider status download exists", app.includes("function downloadProductionProviderStatus()")],
  ["provider status filename exists", app.includes("regent-growth-production-provider-status-")],
  ["provider status copy listener exists", app.includes('copyProductionProviderStatusButton.addEventListener("click", copyProductionProviderStatus)')],
  ["provider status download listener exists", app.includes('downloadProductionProviderStatusButton.addEventListener("click", downloadProductionProviderStatus)')],
  ["plan next status export exists", plan.includes("- Production provider status export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider status export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider status export test passed.");
