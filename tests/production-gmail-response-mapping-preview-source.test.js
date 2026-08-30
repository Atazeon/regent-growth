const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const {
  mapGmailProviderResponse,
  getGmailResponseMappingPreview
} = require("../production-provider-middleware");

const mappedSuccess = mapGmailProviderResponse({ id: "gmail-message-1", threadId: "gmail-thread-1" });
const mappedRetryableError = mapGmailProviderResponse({
  error: {
    code: "backendError",
    reason: "backendError",
    message: "Temporary Gmail backend failure."
  }
});
const preview = getGmailResponseMappingPreview({ id: "gmail-message-1", threadId: "gmail-thread-1" });

const checks = [
  ["middleware exports gmail response mapper", typeof mapGmailProviderResponse === "function"],
  ["middleware exports gmail response mapping preview", typeof getGmailResponseMappingPreview === "function"],
  ["middleware has gmail response mapping route", source.includes('requestUrl.pathname === "/gmail/response-mapping-preview"')],
  ["mapping schema exists", mappedSuccess.schemaVersion === "regent-growth.gmail-response-mapping.v1"],
  ["mapping has timestamp", typeof mappedSuccess.mappedAt === "string" && mappedSuccess.mappedAt.length > 0],
  ["mapping names provider", mappedSuccess.provider === "gmail"],
  ["mapping accepts message id", mappedSuccess.accepted === true],
  ["mapping keeps sent false", mappedSuccess.sent === false],
  ["mapping keeps booked false", mappedSuccess.booked === false],
  ["mapping keeps provider message id", mappedSuccess.providerMessageId === "gmail-message-1"],
  ["mapping keeps thread id", mappedSuccess.threadId === "gmail-thread-1"],
  ["mapping does not store raw response", mappedSuccess.rawResponseStored === false],
  ["retryable error rejected", mappedRetryableError.accepted === false],
  ["retryable error marked retryable", mappedRetryableError.retryable === true],
  ["retryable error keeps issue", mappedRetryableError.issues.includes("Temporary Gmail backend failure.")],
  ["preview schema exists", preview.schemaVersion === "regent-growth.gmail-response-mapping-preview.v1"],
  ["preview blocks canSend", preview.canSend === false],
  ["preview keeps sent disabled", preview.sentEnabled === false],
  ["preview keeps booked disabled", preview.bookedEnabled === false],
  ["preview includes mapping", preview.mapping.providerMessageId === "gmail-message-1"],
  ["preview blocks approval", preview.blockedReasons.includes("Gmail response mapping preview is not send approval.")],
  ["project plan next response mapping exists", projectPlan.includes("- First Gmail provider response mapping preview")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail response mapping preview test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail response mapping preview test passed.");
