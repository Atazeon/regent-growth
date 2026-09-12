const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_PREFLIGHT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook preflight doc title exists", doc.includes("# Production Outlook Reviewed Packet Preflight")],
  ["outlook preflight doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/preflight")],
  ["outlook preflight doc points to fixture", doc.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["outlook preflight doc names schema", doc.includes("regent-growth.outlook-reviewed-packet-preflight.v1")],
  ["outlook preflight doc blocks accepted", doc.includes("accepted: false")],
  ["outlook preflight doc blocks canSend", doc.includes("canSend: false")],
  ["outlook preflight doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook preflight doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook preflight doc names packet validity", doc.includes("reviewedPacketValid")],
  ["outlook preflight doc names env configured", doc.includes("envConfigured")],
  ["outlook preflight doc names implementation ready", doc.includes("implementationReady")],
  ["outlook preflight doc links outlook status", doc.includes("/outlook/status")],
  ["outlook preflight doc links implementation guard", doc.includes("/provider-implementation-guard?provider=outlook")],
  ["outlook preflight doc blocks real sending", doc.includes("must still block real Outlook sending")],
  ["outlook preflight doc requires graph oauth", doc.includes("Microsoft Graph OAuth handling")],
  ["outlook preflight doc requires suppression", doc.includes("suppression enforcement")],
  ["outlook preflight doc requires unsubscribe", doc.includes("unsubscribe enforcement")],
  ["project plan next outlook preflight docs exists", projectPlan.includes("- First Outlook reviewed packet preflight docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook reviewed packet preflight doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook reviewed packet preflight doc test passed.");
