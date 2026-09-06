const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getGmailUnsubscribePreflight } = require("../production-provider-middleware");

const missingPreflight = getGmailUnsubscribePreflight(fixture);
const validPayload = JSON.parse(JSON.stringify(fixture));
validPayload.packet.message.body = `${validPayload.packet.message.body}\n\nReply unsubscribe or opt out and I will not contact you again.`;
const validPreflight = getGmailUnsubscribePreflight(validPayload);
const emptyPreflight = getGmailUnsubscribePreflight({ packet: { message: {} } });
const serializedValid = JSON.stringify(validPreflight);

const checks = [
  ["middleware exports gmail unsubscribe preflight", typeof getGmailUnsubscribePreflight === "function"],
  ["middleware has gmail unsubscribe route", source.includes('requestUrl.pathname === "/gmail/unsubscribe-preflight"')],
  ["unsubscribe preflight schema exists", validPreflight.schemaVersion === "regent-growth.gmail-unsubscribe-preflight.v1"],
  ["unsubscribe preflight has timestamp", typeof validPreflight.checkedAt === "string" && validPreflight.checkedAt.length > 0],
  ["unsubscribe preflight names provider", validPreflight.provider === "gmail"],
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
  ["empty preflight requires body", emptyPreflight.issues.includes("Message body is required for Gmail unsubscribe preflight.")],
  ["valid preflight omits body content", !serializedValid.includes(validPayload.packet.message.body)],
  ["unsubscribe preflight blocks approval", validPreflight.blockedReasons.includes("Gmail unsubscribe preflight is not send approval.")],
  ["project plan next gmail unsubscribe exists", projectPlan.includes("- First Gmail unsubscribe preflight")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail unsubscribe preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail unsubscribe preflight test passed.");
