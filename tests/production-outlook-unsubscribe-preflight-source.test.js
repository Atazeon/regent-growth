const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getOutlookUnsubscribePreflight } = require("../production-provider-middleware");

const missingPreflight = getOutlookUnsubscribePreflight(fixture);
const validPayload = JSON.parse(JSON.stringify(fixture));
validPayload.packet.message.body = `${validPayload.packet.message.body}\n\nReply unsubscribe or opt out and I will not contact you again.`;
const validPreflight = getOutlookUnsubscribePreflight(validPayload);
const emptyPreflight = getOutlookUnsubscribePreflight({ packet: { message: {} } });
const serializedValid = JSON.stringify(validPreflight);

const checks = [
  ["middleware exports outlook unsubscribe preflight", typeof getOutlookUnsubscribePreflight === "function"],
  ["middleware has outlook unsubscribe route", source.includes('requestUrl.pathname === "/outlook/unsubscribe-preflight"')],
  ["unsubscribe preflight schema exists", validPreflight.schemaVersion === "regent-growth.outlook-unsubscribe-preflight.v1"],
  ["unsubscribe preflight has timestamp", typeof validPreflight.checkedAt === "string" && validPreflight.checkedAt.length > 0],
  ["unsubscribe preflight names provider", validPreflight.provider === "outlook"],
  ["unsubscribe preflight blocks canSend", validPreflight.canSend === false],
  ["unsubscribe preflight keeps sent disabled", validPreflight.sentEnabled === false],
  ["unsubscribe preflight keeps booked disabled", validPreflight.bookedEnabled === false],
  ["unsubscribe preflight does not store body", validPreflight.bodyContentStored === false],
  ["unsubscribe preflight requires unsubscribe", validPreflight.requiredTerms.includes("unsubscribe")],
  ["unsubscribe preflight requires opt out", validPreflight.requiredTerms.includes("opt out")],
  ["missing preflight fails language", missingPreflight.hasUnsubscribeLanguage === false],
  ["missing preflight reports issue", missingPreflight.issues.includes("Message body must include unsubscribe or opt-out language.")],
  ["valid preflight finds language", validPreflight.hasUnsubscribeLanguage === true],
  ["valid preflight clears issues", validPreflight.issues.length === 0],
  ["empty preflight requires body", emptyPreflight.issues.includes("Message body is required for Outlook unsubscribe preflight.")],
  ["valid preflight omits body content", !serializedValid.includes(validPayload.packet.message.body)],
  ["unsubscribe preflight blocks approval", validPreflight.blockedReasons.includes("Outlook unsubscribe preflight is not send approval.")],
  ["project plan next outlook unsubscribe exists", projectPlan.includes("- First Outlook unsubscribe preflight")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook unsubscribe preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook unsubscribe preflight test passed.");
