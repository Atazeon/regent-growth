const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const {
  mapOutlookProviderResponse,
  getOutlookResponseMappingPreview
} = require("../production-provider-middleware");

const mappedSuccess = mapOutlookProviderResponse({ id: "outlook-message-1", conversationId: "outlook-conversation-1" });
const mappedRetryableError = mapOutlookProviderResponse({
  error: {
    code: "ServiceUnavailable",
    message: "Temporary Microsoft Graph failure."
  }
});
const preview = getOutlookResponseMappingPreview({ id: "outlook-message-1", conversationId: "outlook-conversation-1" });

const checks = [
  ["middleware exports outlook response mapper", typeof mapOutlookProviderResponse === "function"],
  ["middleware exports outlook response mapping preview", typeof getOutlookResponseMappingPreview === "function"],
  ["middleware has outlook response mapping route", source.includes('requestUrl.pathname === "/outlook/response-mapping-preview"')],
  ["mapping schema exists", mappedSuccess.schemaVersion === "regent-growth.outlook-response-mapping.v1"],
  ["mapping has timestamp", typeof mappedSuccess.mappedAt === "string" && mappedSuccess.mappedAt.length > 0],
  ["mapping names provider", mappedSuccess.provider === "outlook"],
  ["mapping accepts message id", mappedSuccess.accepted === true],
  ["mapping keeps sent false", mappedSuccess.sent === false],
  ["mapping keeps booked false", mappedSuccess.booked === false],
  ["mapping keeps provider message id", mappedSuccess.providerMessageId === "outlook-message-1"],
  ["mapping keeps conversation id", mappedSuccess.conversationId === "outlook-conversation-1"],
  ["mapping does not store raw response", mappedSuccess.rawResponseStored === false],
  ["retryable error rejected", mappedRetryableError.accepted === false],
  ["retryable error marked retryable", mappedRetryableError.retryable === true],
  ["retryable error keeps issue", mappedRetryableError.issues.includes("Temporary Microsoft Graph failure.")],
  ["preview schema exists", preview.schemaVersion === "regent-growth.outlook-response-mapping-preview.v1"],
  ["preview blocks canSend", preview.canSend === false],
  ["preview keeps sent disabled", preview.sentEnabled === false],
  ["preview keeps booked disabled", preview.bookedEnabled === false],
  ["preview includes mapping", preview.mapping.providerMessageId === "outlook-message-1"],
  ["preview blocks approval", preview.blockedReasons.includes("Outlook response mapping preview is not send approval.")],
  ["project plan next outlook response mapping exists", projectPlan.includes("- First Outlook provider response mapping preview")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook response mapping preview test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook response mapping preview test passed.");
