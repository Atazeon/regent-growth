const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["dry run button exists", html.includes('id="dryRunReviewedSendPacketButton"')],
  ["dry run endpoint constant exists", app.includes('const productionSendDryRunEndpoint = "/api/production-send-dry-run";')],
  ["dry run selector exists", app.includes('const dryRunReviewedSendPacketButton = document.querySelector("#dryRunReviewedSendPacketButton")')],
  ["dry run handler exists", app.includes("async function dryRunReviewedProductionSendPacket()")],
  ["dry run posts packet", app.includes("body: JSON.stringify({ packet })")],
  ["dry run records audit", app.includes('recordReviewedSendPacketAudit("Dry-ran reviewed send packet")')],
  ["dry run listener exists", app.includes('dryRunReviewedSendPacketButton.addEventListener("click", dryRunReviewedProductionSendPacket)')],
  ["server validator exists", server.includes("function validateReviewedSendPacket(")],
  ["server dry run exists", server.includes("function dryRunReviewedSendPacket(")],
  ["server dry run endpoint exists", server.includes('requestUrl.pathname === "/api/production-send-dry-run"')],
  ["server dry run never sends", server.includes("sent: false")],
  ["server dry run never books", server.includes("booked: false")],
  ["server requires schema", server.includes('packet.schemaVersion !== "regent-growth.reviewed-send.v1"')],
  ["server requires automation false", server.includes('packet.automationAllowed !== false')],
  ["server requires automatic send disabled", server.includes("packet.safety?.automaticSendDisabled !== true")],
  ["plan next dry run exists", plan.includes("- Reviewed provider dry-run endpoint")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Reviewed provider dry-run test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Reviewed provider dry-run test passed.");
