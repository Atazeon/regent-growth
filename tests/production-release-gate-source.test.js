const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["release gate summary exists", html.includes('id="productionReleaseGateSummary"')],
  ["copy release gate button exists", html.includes('id="copyProductionReleaseGateButton"')],
  ["download release gate button exists", html.includes('id="downloadProductionReleaseGateButton"')],
  ["release gate selector exists", app.includes('const productionReleaseGateSummary = document.querySelector("#productionReleaseGateSummary")')],
  ["copy release gate selector exists", app.includes('const copyProductionReleaseGateButton = document.querySelector("#copyProductionReleaseGateButton")')],
  ["download release gate selector exists", app.includes('const downloadProductionReleaseGateButton = document.querySelector("#downloadProductionReleaseGateButton")')],
  ["release gate summary helper exists", app.includes("function getProductionReleaseGateSummary(")],
  ["release gate render exists", app.includes("function renderProductionReleaseGateSummary(")],
  ["release gate formatter exists", app.includes("function formatProductionReleaseGateSummary(")],
  ["release gate copy exists", app.includes("async function copyProductionReleaseGateSummary()")],
  ["release gate download exists", app.includes("function downloadProductionReleaseGateSummary()")],
  ["release gate checks provider setup", app.includes('label: "Provider setup ready"')],
  ["release gate checks packet", app.includes('label: "Reviewed send packet valid"')],
  ["release gate checks dry run", app.includes('label: "Latest dry run accepted"')],
  ["release gate checks compliance", app.includes('label: "Compliance checklist complete"')],
  ["release gate keeps automation disabled", app.includes('label: "Automatic send still disabled"')],
  ["release gate filename exists", app.includes("regent-growth-production-release-gate-")],
  ["copy release gate listener exists", app.includes('copyProductionReleaseGateButton.addEventListener("click", copyProductionReleaseGateSummary)')],
  ["download release gate listener exists", app.includes('downloadProductionReleaseGateButton.addEventListener("click", downloadProductionReleaseGateSummary)')],
  ["release gate renders from send status", app.includes("renderProductionReleaseGateSummary(prospect);")],
  ["release gate renders startup", app.includes("renderProductionReleaseGateSummary();")],
  ["plan next release gate exists", plan.includes("- Production send release gate summary")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production release gate test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production release gate test passed.");
