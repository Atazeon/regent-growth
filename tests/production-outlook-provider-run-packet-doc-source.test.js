const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_RUN_PACKET.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook run packet doc title exists", doc.includes("# Production Outlook Provider Run Packet")],
  ["outlook run packet doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/outlook/run-packet")],
  ["outlook run packet doc names schema", doc.includes("regent-growth.outlook-provider-run-packet.v1")],
  ["outlook run packet doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["outlook run packet doc blocks canSend", doc.includes("canSend: false")],
  ["outlook run packet doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["outlook run packet doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["outlook run packet doc lists status", doc.includes("/outlook/status")],
  ["outlook run packet doc lists preflight", doc.includes("/outlook/preflight")],
  ["outlook run packet doc lists audit preview", doc.includes("/outlook/audit-preview")],
  ["outlook run packet doc lists retry preview", doc.includes("/outlook/retry-preview")],
  ["outlook run packet doc lists response mapping", doc.includes("/outlook/response-mapping-preview")],
  ["outlook run packet doc lists suppression", doc.includes("/outlook/suppression-preflight")],
  ["outlook run packet doc lists unsubscribe", doc.includes("/outlook/unsubscribe-preflight")],
  ["outlook run packet doc lists readiness", doc.includes("/outlook/send-readiness")],
  ["outlook run packet doc lists blocked send", doc.includes("/outlook/send")],
  ["outlook run packet doc requires body storage proof", doc.includes("bodyContentStored is false")],
  ["outlook run packet doc requires 403 proof", doc.includes("returns `403`")],
  ["outlook run packet doc blocks approval", doc.includes("not send approval")],
  ["project plan next outlook run packet docs exists", projectPlan.includes("- First Outlook provider run packet docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook provider run packet doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook provider run packet doc test passed.");
