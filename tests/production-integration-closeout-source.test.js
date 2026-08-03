const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["copy closeout button exists", html.includes('id="copyProductionIntegrationCloseoutButton"')],
  ["download closeout button exists", html.includes('id="downloadProductionIntegrationCloseoutButton"')],
  ["copy closeout selector exists", app.includes('const copyProductionIntegrationCloseoutButton = document.querySelector("#copyProductionIntegrationCloseoutButton")')],
  ["download closeout selector exists", app.includes('const downloadProductionIntegrationCloseoutButton = document.querySelector("#downloadProductionIntegrationCloseoutButton")')],
  ["closeout formatter exists", app.includes("function formatProductionIntegrationCloseoutPacket(")],
  ["closeout title exists", app.includes("Production Integration Closeout Packet")],
  ["closeout includes provider status", app.includes("const providerStatus = getProductionProviderStatusRecord();")],
  ["closeout includes release gate", app.includes("const releaseGate = getProductionReleaseGateSummary(prospect);")],
  ["closeout includes dry run", app.includes("const latestDryRun = productionDryRunHistory[0] || null;")],
  ["closeout links boundary doc", app.includes("docs/PRODUCTION_PROVIDER_BOUNDARY.md")],
  ["closeout links middleware contract", app.includes("docs/PRODUCTION_MIDDLEWARE_CONTRACT.md")],
  ["closeout copy exists", app.includes("async function copyProductionIntegrationCloseoutPacket()")],
  ["closeout download exists", app.includes("function downloadProductionIntegrationCloseoutPacket()")],
  ["closeout filename exists", app.includes("regent-growth-production-integration-closeout-")],
  ["copy closeout listener exists", app.includes('copyProductionIntegrationCloseoutButton.addEventListener("click", copyProductionIntegrationCloseoutPacket)')],
  ["download closeout listener exists", app.includes('downloadProductionIntegrationCloseoutButton.addEventListener("click", downloadProductionIntegrationCloseoutPacket)')],
  ["plan next closeout exists", plan.includes("- Production integration closeout packet")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production integration closeout test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production integration closeout test passed.");
