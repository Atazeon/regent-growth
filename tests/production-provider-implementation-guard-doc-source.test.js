const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_IMPLEMENTATION_GUARD.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["implementation guard doc title exists", doc.includes("# Production Provider Implementation Guard")],
  ["implementation guard doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/provider-implementation-guard?provider=gmail")],
  ["implementation guard doc names schema", doc.includes("regent-growth.provider-implementation-guard.v1")],
  ["implementation guard doc names gmail", doc.includes("gmail")],
  ["implementation guard doc names outlook", doc.includes("outlook")],
  ["implementation guard doc names custom", doc.includes("custom")],
  ["implementation guard doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["implementation guard doc blocks enable send", doc.includes("canEnableSend: false")],
  ["implementation guard doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["implementation guard doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["implementation guard doc names send adapter flag", doc.includes("REGENT_GMAIL_SEND_ADAPTER_REVIEWED")],
  ["implementation guard doc names suppression flag", doc.includes("REGENT_GMAIL_SUPPRESSION_REVIEWED")],
  ["implementation guard doc names unsubscribe flag", doc.includes("REGENT_GMAIL_UNSUBSCRIBE_REVIEWED")],
  ["implementation guard doc names audit flag", doc.includes("REGENT_GMAIL_AUDIT_REVIEWED")],
  ["implementation guard doc names retry flag", doc.includes("REGENT_GMAIL_RETRY_REVIEWED")],
  ["implementation guard doc names setup flag", doc.includes("REGENT_GMAIL_SETUP_APPROVED")],
  ["implementation guard doc lists controls", doc.includes("send-adapter") && doc.includes("manual-setup-review")],
  ["implementation guard doc keeps canSend reviewed", doc.includes("`canSend` should only change")],
  ["project plan next implementation guard docs exists", projectPlan.includes("- First provider-specific implementation guard docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider implementation guard doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider implementation guard doc test passed.");
