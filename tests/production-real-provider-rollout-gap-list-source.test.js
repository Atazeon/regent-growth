const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getRealProviderRolloutGapList } = require("../production-provider-middleware");

const gapList = getRealProviderRolloutGapList();
const providers = gapList.providers.map((provider) => provider.provider);
const gmail = gapList.providers.find((provider) => provider.provider === "gmail");
const outlook = gapList.providers.find((provider) => provider.provider === "outlook");

const checks = [
  ["middleware exports rollout gap list", typeof getRealProviderRolloutGapList === "function"],
  ["middleware has rollout gap route", source.includes('requestUrl.pathname === "/real-provider/rollout-gap-list"')],
  ["gap list schema exists", gapList.schemaVersion === "regent-growth.real-provider-rollout-gap-list.v1"],
  ["gap list has timestamp", typeof gapList.generatedAt === "string" && gapList.generatedAt.length > 0],
  ["gap list blocks approval", gapList.approvedForRealSend === false],
  ["gap list blocks canSend", gapList.canSend === false],
  ["gap list keeps sent disabled", gapList.sentEnabled === false],
  ["gap list keeps booked disabled", gapList.bookedEnabled === false],
  ["gap list includes gmail", providers.includes("gmail")],
  ["gap list includes outlook", providers.includes("outlook")],
  ["gmail gaps include oauth", gmail.gaps.some((gap) => gap.includes("OAuth send adapter"))],
  ["gmail gaps include suppression", gmail.gaps.some((gap) => gap.includes("suppression enforcement"))],
  ["gmail gaps include unsubscribe", gmail.gaps.some((gap) => gap.includes("unsubscribe enforcement"))],
  ["gmail gaps include audit", gmail.gaps.some((gap) => gap.includes("audit logging"))],
  ["outlook gaps include oauth", outlook.gaps.some((gap) => gap.includes("OAuth send adapter"))],
  ["outlook gaps include response handling", outlook.gaps.some((gap) => gap.includes("provider response handling"))],
  ["outlook gaps include manual approval", outlook.gaps.some((gap) => gap.includes("manual setup approval"))],
  ["gmail links implementation review", gmail.implementationReviewEndpoint === "/gmail/implementation-review/export"],
  ["outlook links implementation review", outlook.implementationReviewEndpoint === "/outlook/implementation-review/export"],
  ["gap list blocks send approval", gapList.blockedReasons.includes("Rollout gap list is not send approval.")],
  ["project plan next gap list exists", projectPlan.includes("- First real-provider rollout gap list")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider rollout gap list test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider rollout gap list test passed.");
