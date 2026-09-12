const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_OUTLOOK_RESPONSE_MAPPING.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outlook response mapping doc title exists", doc.includes("# Production Outlook Response Mapping Preview")],
  ["outlook response mapping doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/outlook/response-mapping-preview")],
  ["outlook response mapping doc includes success id", doc.includes('"id": "outlook-message-1"')],
  ["outlook response mapping doc includes conversation id", doc.includes('"conversationId": "outlook-conversation-1"')],
  ["outlook response mapping doc names preview schema", doc.includes("regent-growth.outlook-response-mapping-preview.v1")],
  ["outlook response mapping doc names mapping schema", doc.includes("regent-growth.outlook-response-mapping.v1")],
  ["outlook response mapping doc maps accepted", doc.includes("accepted")],
  ["outlook response mapping doc keeps sent false", doc.includes("sent: false")],
  ["outlook response mapping doc keeps booked false", doc.includes("booked: false")],
  ["outlook response mapping doc maps provider id", doc.includes("providerMessageId")],
  ["outlook response mapping doc maps retryable", doc.includes("retryable")],
  ["outlook response mapping doc blocks raw response storage", doc.includes("rawResponseStored: false")],
  ["outlook response mapping doc names throttling", doc.includes("TooManyRequests")],
  ["outlook response mapping doc names service unavailable", doc.includes("ServiceUnavailable")],
  ["outlook response mapping doc names timeout", doc.includes("Timeout")],
  ["outlook response mapping doc names mailbox unavailable", doc.includes("MailboxUnavailable")],
  ["outlook response mapping doc blocks send approval", doc.includes("not send approval")],
  ["outlook response mapping doc blocks canSend", doc.includes("canSend: false")],
  ["project plan next outlook response mapping docs exists", projectPlan.includes("- First Outlook provider response mapping docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook response mapping doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook response mapping doc test passed.");
