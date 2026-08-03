const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["copy retry button exists", html.includes('id="copyReviewedSendRetryPacketButton"')],
  ["download retry button exists", html.includes('id="downloadReviewedSendRetryPacketButton"')],
  ["copy retry selector exists", app.includes('const copyReviewedSendRetryPacketButton = document.querySelector("#copyReviewedSendRetryPacketButton")')],
  ["download retry selector exists", app.includes('const downloadReviewedSendRetryPacketButton = document.querySelector("#downloadReviewedSendRetryPacketButton")')],
  ["latest blocked helper exists", app.includes("function getLatestBlockedProductionDryRun()")],
  ["retry packet builder exists", app.includes("function getReviewedSendRetryPacket()")],
  ["retry schema exists", app.includes('schemaVersion: "regent-growth.reviewed-send-retry.v1"')],
  ["retry suggested fixes exist", app.includes("suggestedFixes: blockedRun?.issues?.length")],
  ["retry includes current packet", app.includes("currentReviewedSendPacket: currentPacket")],
  ["retry keeps send disabled", app.includes("dryRunRequiredBeforeSend: true")],
  ["retry formatter exists", app.includes("function formatReviewedSendRetryPacket()")],
  ["retry copy exists", app.includes("async function copyReviewedSendRetryPacket()")],
  ["retry download exists", app.includes("function downloadReviewedSendRetryPacket()")],
  ["retry filename exists", app.includes("regent-growth-reviewed-send-retry-")],
  ["copy retry listener exists", app.includes('copyReviewedSendRetryPacketButton.addEventListener("click", copyReviewedSendRetryPacket)')],
  ["download retry listener exists", app.includes('downloadReviewedSendRetryPacketButton.addEventListener("click", downloadReviewedSendRetryPacket)')],
  ["plan next retry exists", plan.includes("- Reviewed send retry packet export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Reviewed send retry packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Reviewed send retry packet test passed.");
