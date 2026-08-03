const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["compliance progress exists", html.includes('id="productionComplianceProgress"')],
  ["compliance checklist exists", html.includes('id="productionComplianceChecklist"')],
  ["copy compliance button exists", html.includes('id="copyProductionComplianceButton"')],
  ["download compliance button exists", html.includes('id="downloadProductionComplianceButton"')],
  ["reset compliance button exists", html.includes('id="resetProductionComplianceButton"')],
  ["compliance storage key exists", app.includes('const productionComplianceStorageKey = "regent-growth-production-compliance";')],
  ["compliance items exist", app.includes("const productionComplianceItems = [")],
  ["sender domain item exists", app.includes("Sender domain and mailbox are verified")],
  ["unsubscribe item exists", app.includes("Unsubscribe or opt-out process is ready")],
  ["human review item exists", app.includes("Human review remains required before every production send")],
  ["legal review item exists", app.includes("Compliance/legal review is complete for the target market")],
  ["compliance state loads", app.includes("let productionComplianceState = loadProductionComplianceState();")],
  ["compliance loader exists", app.includes("function loadProductionComplianceState()")],
  ["compliance saver exists", app.includes("function saveProductionComplianceState()")],
  ["compliance summary exists", app.includes("function getProductionComplianceSummary()")],
  ["compliance render exists", app.includes("function renderProductionComplianceChecklist()")],
  ["compliance formatter exists", app.includes("function formatProductionComplianceChecklist()")],
  ["compliance copy exists", app.includes("async function copyProductionComplianceChecklist()")],
  ["compliance download exists", app.includes("function downloadProductionComplianceChecklist()")],
  ["compliance reset exists", app.includes("function resetProductionComplianceChecklist()")],
  ["compliance filename exists", app.includes("regent-growth-production-compliance-")],
  ["compliance checkbox listener exists", app.includes('productionComplianceChecklist.addEventListener("change"')],
  ["copy compliance listener exists", app.includes('copyProductionComplianceButton.addEventListener("click", copyProductionComplianceChecklist)')],
  ["download compliance listener exists", app.includes('downloadProductionComplianceButton.addEventListener("click", downloadProductionComplianceChecklist)')],
  ["reset compliance listener exists", app.includes('resetProductionComplianceButton.addEventListener("click", resetProductionComplianceChecklist)')],
  ["compliance renders startup", app.includes("renderProductionComplianceChecklist();")],
  ["plan next compliance exists", plan.includes("- Production send compliance checklist")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production send compliance test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production send compliance test passed.");
