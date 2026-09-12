const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { createBlockedOutlookSendResult } = require("../production-provider-middleware");

const result = createBlockedOutlookSendResult(fixture);

const checks = [
  ["middleware exports blocked outlook send result", typeof createBlockedOutlookSendResult === "function"],
  ["middleware has outlook send route", source.includes('requestUrl.pathname === "/outlook/send"')],
  ["middleware returns forbidden for outlook send", source.includes("sendJson(response, 403, createBlockedOutlookSendResult(body));")],
  ["blocked send schema exists", result.schemaVersion === "regent-growth.outlook-send-blocked.v1"],
  ["blocked send has timestamp", typeof result.checkedAt === "string" && result.checkedAt.length > 0],
  ["blocked send names provider", result.provider === "outlook"],
  ["blocked send rejects accepted", result.accepted === false],
  ["blocked send keeps sent false", result.sent === false],
  ["blocked send keeps booked false", result.booked === false],
  ["blocked send clears provider id", result.providerMessageId === ""],
  ["blocked send includes readiness summary", result.readinessSummary === "regent-growth.outlook-send-readiness-summary.v1"],
  ["blocked send includes missing checks", Array.isArray(result.missingChecks)],
  ["blocked send reports blocked endpoint", result.issues.includes("Outlook live-send endpoint is blocked.")],
  ["blocked send reports not implemented", result.issues.includes("Real Outlook sending is not implemented.")],
  ["blocked send blocks approval", result.blockedReasons.includes("Outlook live-send blocked endpoint is not send approval.")],
  ["project plan next outlook blocked send exists", projectPlan.includes("- First Outlook live-send blocked endpoint")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook live-send blocked test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook live-send blocked test passed.");
