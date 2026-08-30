const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail preflight doc title exists", doc.includes("# Production Gmail Reviewed Packet Preflight")],
  ["gmail preflight doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/preflight")],
  ["gmail preflight doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["gmail preflight doc names schema", doc.includes("regent-growth.gmail-reviewed-packet-preflight.v1")],
  ["gmail preflight doc blocks accepted", doc.includes("accepted: false")],
  ["gmail preflight doc blocks canSend", doc.includes("canSend: false")],
  ["gmail preflight doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail preflight doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail preflight doc names packet validity", doc.includes("reviewedPacketValid")],
  ["gmail preflight doc names env configured", doc.includes("envConfigured")],
  ["gmail preflight doc names implementation ready", doc.includes("implementationReady")],
  ["gmail preflight doc links gmail status", doc.includes("/gmail/status")],
  ["gmail preflight doc links implementation guard", doc.includes("/provider-implementation-guard?provider=gmail")],
  ["gmail preflight doc blocks real sending", doc.includes("must still block real Gmail sending")],
  ["gmail preflight doc requires oauth", doc.includes("OAuth handling")],
  ["gmail preflight doc requires suppression", doc.includes("suppression enforcement")],
  ["gmail preflight doc requires unsubscribe", doc.includes("unsubscribe enforcement")],
  ["project plan next gmail preflight docs exists", projectPlan.includes("- First Gmail reviewed packet preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail reviewed packet preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail reviewed packet preflight doc test passed.");
