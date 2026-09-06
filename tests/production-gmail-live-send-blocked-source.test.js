const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { createBlockedGmailSendResult } = require("../production-provider-middleware");

const result = createBlockedGmailSendResult(fixture);

const checks = [
  ["middleware exports blocked gmail send result", typeof createBlockedGmailSendResult === "function"],
  ["middleware has gmail send route", source.includes('requestUrl.pathname === "/gmail/send"')],
  ["middleware returns forbidden for gmail send", source.includes("sendJson(response, 403, createBlockedGmailSendResult(body));")],
  ["blocked send schema exists", result.schemaVersion === "regent-growth.gmail-send-blocked.v1"],
  ["blocked send has timestamp", typeof result.checkedAt === "string" && result.checkedAt.length > 0],
  ["blocked send names provider", result.provider === "gmail"],
  ["blocked send rejects accepted", result.accepted === false],
  ["blocked send keeps sent false", result.sent === false],
  ["blocked send keeps booked false", result.booked === false],
  ["blocked send clears provider id", result.providerMessageId === ""],
  ["blocked send includes readiness summary", result.readinessSummary === "regent-growth.gmail-send-readiness-summary.v1"],
  ["blocked send includes missing checks", Array.isArray(result.missingChecks)],
  ["blocked send reports blocked endpoint", result.issues.includes("Gmail live-send endpoint is blocked.")],
  ["blocked send reports not implemented", result.issues.includes("Real Gmail sending is not implemented.")],
  ["blocked send blocks approval", result.blockedReasons.includes("Gmail live-send blocked endpoint is not send approval.")],
  ["project plan next gmail blocked send exists", projectPlan.includes("- First Gmail live-send blocked endpoint")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail live-send blocked test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail live-send blocked test passed.");
