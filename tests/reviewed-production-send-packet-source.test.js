const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["copy send packet button exists", html.includes('id="copyReviewedSendPacketButton"')],
  ["download send packet button exists", html.includes('id="downloadReviewedSendPacketButton"')],
  ["send packet preview exists", html.includes('id="reviewedSendPacketPreview"')],
  ["send packet preview selector exists", app.includes('const reviewedSendPacketPreview = document.querySelector("#reviewedSendPacketPreview")')],
  ["copy send packet selector exists", app.includes('const copyReviewedSendPacketButton = document.querySelector("#copyReviewedSendPacketButton")')],
  ["download send packet selector exists", app.includes('const downloadReviewedSendPacketButton = document.querySelector("#downloadReviewedSendPacketButton")')],
  ["send packet builder exists", app.includes("function getReviewedProductionSendPacket(")],
  ["send packet formatter exists", app.includes("function formatReviewedProductionSendPacket(")],
  ["send packet validation exists", app.includes("function getReviewedSendPacketValidation(")],
  ["send packet preview render exists", app.includes("function renderReviewedSendPacketPreview(")],
  ["schema version exists", app.includes('schemaVersion: "regent-growth.reviewed-send.v1"')],
  ["automation disabled exists", app.includes("automationAllowed: false")],
  ["human review required exists", app.includes("humanReviewRequired: true")],
  ["automatic send disabled exists", app.includes("automaticSendDisabled: true")],
  ["automatic booking disabled exists", app.includes("automaticBookingDisabled: true")],
  ["compliance review required exists", app.includes("complianceReviewRequired: true")],
  ["provider block exists", app.includes("selectedProvider: productionIntegrationSetup.provider")],
  ["message block exists", app.includes("message: {") && app.includes("subject: emailReadiness.subject")],
  ["calendar block exists", app.includes("calendar: {") && app.includes("bookingLink: integrationReadiness.bookingLink")],
  ["readiness checks exported", app.includes("readinessChecks: integrationReadiness.checks.map")],
  ["validation blocks required checks", app.includes("blockingChecks = packet.readinessChecks.filter")],
  ["validation warns provider setup", app.includes("Provider server environment not checked or not configured.")],
  ["validation warns booking link", app.includes("No booking link is attached.")],
  ["preview shows blockers", app.includes("Blockers: ${blockingText} Warnings: ${warningText}")],
  ["preview render called from send status", app.includes("renderReviewedSendPacketPreview(prospect);")],
  ["preview refreshes after setup save", app.includes("renderReviewedSendPacketPreview();")],
  ["copy send handler exists", app.includes("async function copyReviewedProductionSendPacket()")],
  ["download send handler exists", app.includes("function downloadReviewedProductionSendPacket()")],
  ["send packet filename exists", app.includes("regent-growth-reviewed-send-packet-")],
  ["copy send listener exists", app.includes('copyReviewedSendPacketButton.addEventListener("click", copyReviewedProductionSendPacket)')],
  ["download send listener exists", app.includes('downloadReviewedSendPacketButton.addEventListener("click", downloadReviewedProductionSendPacket)')],
  ["plan tracks send packet next", plan.includes("- Reviewed production send packet schema")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Reviewed production send packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Reviewed production send packet test passed.");
