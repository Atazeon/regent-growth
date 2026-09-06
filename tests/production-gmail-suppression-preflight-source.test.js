const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getSuppressedEmailsForProvider,
  getGmailSuppressionPreflight
} = require("../production-provider-middleware");

const originalShared = process.env.REGENT_SUPPRESSION_EMAILS;
const originalGmail = process.env.REGENT_GMAIL_SUPPRESSION_EMAILS;

process.env.REGENT_SUPPRESSION_EMAILS = "shared@example.com";
process.env.REGENT_GMAIL_SUPPRESSION_EMAILS = `${fixture.packet.message.to}, other@example.com`;

const suppressedEmails = getSuppressedEmailsForProvider("gmail");
const suppressedPreflight = getGmailSuppressionPreflight(fixture);

process.env.REGENT_GMAIL_SUPPRESSION_EMAILS = "other@example.com";
const allowedPreflight = getGmailSuppressionPreflight(fixture);
const missingRecipientPreflight = getGmailSuppressionPreflight({ packet: { message: {} } });

if (originalShared === undefined) {
  delete process.env.REGENT_SUPPRESSION_EMAILS;
} else {
  process.env.REGENT_SUPPRESSION_EMAILS = originalShared;
}

if (originalGmail === undefined) {
  delete process.env.REGENT_GMAIL_SUPPRESSION_EMAILS;
} else {
  process.env.REGENT_GMAIL_SUPPRESSION_EMAILS = originalGmail;
}

const checks = [
  ["middleware exports suppressed email helper", typeof getSuppressedEmailsForProvider === "function"],
  ["middleware exports gmail suppression preflight", typeof getGmailSuppressionPreflight === "function"],
  ["middleware has gmail suppression route", source.includes('requestUrl.pathname === "/gmail/suppression-preflight"')],
  ["suppression helper includes shared list", suppressedEmails.includes("shared@example.com")],
  ["suppression helper includes gmail list", suppressedEmails.includes(fixture.packet.message.to.toLowerCase())],
  ["suppression preflight schema exists", suppressedPreflight.schemaVersion === "regent-growth.gmail-suppression-preflight.v1"],
  ["suppression preflight has timestamp", typeof suppressedPreflight.checkedAt === "string" && suppressedPreflight.checkedAt.length > 0],
  ["suppression preflight names provider", suppressedPreflight.provider === "gmail"],
  ["suppression preflight blocks canSend", suppressedPreflight.canSend === false],
  ["suppression preflight keeps sent disabled", suppressedPreflight.sentEnabled === false],
  ["suppression preflight keeps booked disabled", suppressedPreflight.bookedEnabled === false],
  ["suppression preflight records recipient", suppressedPreflight.recipientEmail === fixture.packet.message.to.toLowerCase()],
  ["suppression preflight reports configured list", suppressedPreflight.suppressionListConfigured === true],
  ["suppression preflight catches suppressed recipient", suppressedPreflight.suppressed === true],
  ["suppression preflight reports issue", suppressedPreflight.issues.includes("Recipient is on the Gmail suppression list.")],
  ["allowed preflight is not suppressed", allowedPreflight.suppressed === false],
  ["missing recipient reports issue", missingRecipientPreflight.issues.includes("Recipient email is required for Gmail suppression preflight.")],
  ["suppression preflight blocks approval", suppressedPreflight.blockedReasons.includes("Gmail suppression preflight is not send approval.")],
  ["project plan next gmail suppression exists", projectPlan.includes("- First Gmail suppression preflight")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail suppression preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail suppression preflight test passed.");
