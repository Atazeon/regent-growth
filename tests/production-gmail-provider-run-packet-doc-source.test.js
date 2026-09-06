const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_RUN_PACKET.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail run packet doc title exists", doc.includes("# Production Gmail Provider Run Packet")],
  ["gmail run packet doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/gmail/run-packet")],
  ["gmail run packet doc names schema", doc.includes("regent-growth.gmail-provider-run-packet.v1")],
  ["gmail run packet doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["gmail run packet doc blocks canSend", doc.includes("canSend: false")],
  ["gmail run packet doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["gmail run packet doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["gmail run packet doc lists status", doc.includes("/gmail/status")],
  ["gmail run packet doc lists preflight", doc.includes("/gmail/preflight")],
  ["gmail run packet doc lists audit preview", doc.includes("/gmail/audit-preview")],
  ["gmail run packet doc lists retry preview", doc.includes("/gmail/retry-preview")],
  ["gmail run packet doc lists response mapping", doc.includes("/gmail/response-mapping-preview")],
  ["gmail run packet doc lists suppression", doc.includes("/gmail/suppression-preflight")],
  ["gmail run packet doc lists unsubscribe", doc.includes("/gmail/unsubscribe-preflight")],
  ["gmail run packet doc lists readiness", doc.includes("/gmail/send-readiness")],
  ["gmail run packet doc lists blocked send", doc.includes("/gmail/send")],
  ["gmail run packet doc requires body storage proof", doc.includes("bodyContentStored is false")],
  ["gmail run packet doc requires 403 proof", doc.includes("returns `403`")],
  ["gmail run packet doc blocks approval", doc.includes("not send approval")],
  ["project plan next gmail run packet docs exists", projectPlan.includes("- First Gmail provider run packet docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail provider run packet doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail provider run packet doc test passed.");
