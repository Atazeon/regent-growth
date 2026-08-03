const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["audit list exists", html.includes('id="reviewedSendAuditList"')],
  ["download audit button exists", html.includes('id="downloadReviewedSendAuditButton"')],
  ["clear audit button exists", html.includes('id="clearReviewedSendAuditButton"')],
  ["audit storage key exists", app.includes('const reviewedSendPacketAuditStorageKey = "regent-growth-reviewed-send-packet-audit";')],
  ["audit state loads", app.includes("let reviewedSendPacketAuditLog = loadReviewedSendPacketAuditLog();")],
  ["audit normalizer exists", app.includes("function normalizeReviewedSendPacketAuditEntry(")],
  ["audit loader exists", app.includes("function loadReviewedSendPacketAuditLog()")],
  ["audit saver exists", app.includes("function saveReviewedSendPacketAuditLog()")],
  ["audit render exists", app.includes("function renderReviewedSendPacketAuditLog()")],
  ["audit record exists", app.includes("function recordReviewedSendPacketAudit(")],
  ["audit record captures blockers", app.includes("blockers: validation.blockingChecks.map((check) => check.label)")],
  ["audit export record exists", app.includes("function getReviewedSendPacketAuditRecord()")],
  ["audit download exists", app.includes("function downloadReviewedSendPacketAuditLog()")],
  ["audit clear exists", app.includes("function clearReviewedSendPacketAuditLog()")],
  ["copy records audit", app.includes('recordReviewedSendPacketAudit("Copied reviewed send packet")')],
  ["download records audit", app.includes('recordReviewedSendPacketAudit("Downloaded reviewed send packet")')],
  ["audit download filename exists", app.includes("regent-growth-reviewed-send-audit-")],
  ["download audit listener exists", app.includes('downloadReviewedSendAuditButton.addEventListener("click", downloadReviewedSendPacketAuditLog)')],
  ["clear audit listener exists", app.includes('clearReviewedSendAuditButton.addEventListener("click", clearReviewedSendPacketAuditLog)')],
  ["audit renders on startup", app.includes("renderReviewedSendPacketAuditLog();")],
  ["audit css exists", css.includes(".send-packet-audit")],
  ["audit list css exists", css.includes(".audit-list article")],
  ["plan next audit exists", plan.includes("- Reviewed send packet audit log")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Reviewed send packet audit test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Reviewed send packet audit test passed.");
