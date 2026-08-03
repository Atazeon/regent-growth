const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["provider setup form exists", html.includes('id="productionIntegrationSetupForm"')],
  ["provider select exists", html.includes('id="productionEmailProviderSelect"')],
  ["sender email input exists", html.includes('id="productionSenderEmailInput"')],
  ["booking link input exists", html.includes('id="productionBookingLinkInput"')],
  ["review gate input exists", html.includes('id="productionReviewGateInput"')],
  ["setup status exists", html.includes('id="productionIntegrationSetupStatus"')],
  ["check setup button exists", html.includes('id="checkProductionIntegrationSetupButton"')],
  ["copy setup button exists", html.includes('id="copyProductionIntegrationSetupButton"')],
  ["download setup button exists", html.includes('id="downloadProductionIntegrationSetupButton"')],
  ["production status endpoint constant exists", app.includes('const productionIntegrationStatusEndpoint = "/api/production-integration-status";')],
  ["setup storage key exists", app.includes('const productionIntegrationSetupStorageKey = "regent-growth-production-integration-setup";')],
  ["default setup exists", app.includes("const defaultProductionIntegrationSetup = {")],
  ["provider presets exist", app.includes("const productionEmailProviderPresets = {")],
  ["setup normalizer exists", app.includes("function normalizeProductionIntegrationSetup(")],
  ["setup loader exists", app.includes("function loadProductionIntegrationSetup()")],
  ["setup saver exists", app.includes("function saveProductionIntegrationSetup(")],
  ["setup packet formatter exists", app.includes("function formatProductionIntegrationSetupPacket()")],
  ["setup packet title exists", app.includes("Production Integration Provider Setup")],
  ["setup check handler exists", app.includes("async function checkProductionIntegrationSetup()")],
  ["setup copy handler exists", app.includes("async function copyProductionIntegrationSetupPacket()")],
  ["setup download handler exists", app.includes("function downloadProductionIntegrationSetupPacket()")],
  ["setup filename exists", app.includes("regent-growth-production-provider-setup-")],
  ["readiness checks sender email", app.includes('label: "Valid sender email"')],
  ["readiness checks review gate", app.includes('label: "Human review gate enabled"')],
  ["readiness includes provider", app.includes("providerLabel: setupReadiness.providerLabel")],
  ["readiness uses default booking link", app.includes("function getProductionBookingLink(")],
  ["setup form listener exists", app.includes('productionIntegrationSetupForm.addEventListener("submit", saveProductionIntegrationSetup)')],
  ["setup check listener exists", app.includes('checkProductionIntegrationSetupButton.addEventListener("click", checkProductionIntegrationSetup)')],
  ["setup copy listener exists", app.includes('copyProductionIntegrationSetupButton.addEventListener("click", copyProductionIntegrationSetupPacket)')],
  ["setup download listener exists", app.includes('downloadProductionIntegrationSetupButton.addEventListener("click", downloadProductionIntegrationSetupPacket)')],
  ["setup form sync called", app.includes("syncProductionIntegrationSetupForm();")],
  ["setup status render called", app.includes("renderProductionIntegrationSetupStatus();")],
  ["setup css exists", css.includes(".production-integration-setup")],
  ["setup grid responsive", css.includes(".setup-grid,")],
  ["server email provider env exists", server.includes("REGENT_EMAIL_PROVIDER")],
  ["server email api env exists", server.includes("REGENT_EMAIL_API_URL")],
  ["server calendar api env exists", server.includes("REGENT_CALENDAR_API_URL")],
  ["server status helper exists", server.includes("function getProductionIntegrationStatus()")],
  ["server status endpoint exists", server.includes('requestUrl.pathname === "/api/production-integration-status"')],
  ["server disables send", server.includes("sendEnabled: false")],
  ["server disables booking", server.includes("bookingEnabled: false")],
  ["plan still tracks production setup", plan.includes("- Production integration provider setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production integration provider setup test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production integration provider setup test passed.");
