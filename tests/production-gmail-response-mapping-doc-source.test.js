const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GMAIL_RESPONSE_MAPPING.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["gmail response mapping doc title exists", doc.includes("# Production Gmail Response Mapping Preview")],
  ["gmail response mapping doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/gmail/response-mapping-preview")],
  ["gmail response mapping doc includes success id", doc.includes('"id": "gmail-message-1"')],
  ["gmail response mapping doc includes thread id", doc.includes('"threadId": "gmail-thread-1"')],
  ["gmail response mapping doc names preview schema", doc.includes("regent-growth.gmail-response-mapping-preview.v1")],
  ["gmail response mapping doc names mapping schema", doc.includes("regent-growth.gmail-response-mapping.v1")],
  ["gmail response mapping doc maps accepted", doc.includes("accepted")],
  ["gmail response mapping doc keeps sent false", doc.includes("sent: false")],
  ["gmail response mapping doc keeps booked false", doc.includes("booked: false")],
  ["gmail response mapping doc maps provider id", doc.includes("providerMessageId")],
  ["gmail response mapping doc maps retryable", doc.includes("retryable")],
  ["gmail response mapping doc blocks raw response storage", doc.includes("rawResponseStored: false")],
  ["gmail response mapping doc names rate limit", doc.includes("rateLimitExceeded")],
  ["gmail response mapping doc names backend error", doc.includes("backendError")],
  ["gmail response mapping doc names internal error", doc.includes("internalError")],
  ["gmail response mapping doc blocks send approval", doc.includes("not send approval")],
  ["gmail response mapping doc blocks canSend", doc.includes("canSend: false")],
  ["project plan next response mapping docs exists", projectPlan.includes("- First Gmail provider response mapping docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail response mapping doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail response mapping doc test passed.");
