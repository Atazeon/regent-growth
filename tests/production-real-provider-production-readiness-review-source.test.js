const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getRealProviderProductionReadinessReview } = require("../production-provider-middleware");

const review = getRealProviderProductionReadinessReview(fixture);
const providers = review.providers.map((provider) => provider.provider);
const gmail = review.providers.find((provider) => provider.provider === "gmail");
const outlook = review.providers.find((provider) => provider.provider === "outlook");

const checks = [
  ["middleware exports production readiness review", typeof getRealProviderProductionReadinessReview === "function"],
  ["middleware has production readiness route", source.includes('requestUrl.pathname === "/real-provider/production-readiness-review"')],
  ["review schema exists", review.schemaVersion === "regent-growth.real-provider-production-readiness-review.v1"],
  ["review has timestamp", typeof review.generatedAt === "string" && review.generatedAt.length > 0],
  ["review blocks approval", review.approvedForRealSend === false],
  ["review blocks canSend", review.canSend === false],
  ["review keeps sent disabled", review.sentEnabled === false],
  ["review keeps booked disabled", review.bookedEnabled === false],
  ["review includes gmail", providers.includes("gmail")],
  ["review includes outlook", providers.includes("outlook")],
  ["gmail review schema included", gmail.implementationReviewSchema === "regent-growth.gmail-implementation-review-export.v1"],
  ["outlook review schema included", outlook.implementationReviewSchema === "regent-growth.outlook-implementation-review-export.v1"],
  ["gmail run packet schema included", gmail.runPacketSchema === "regent-growth.gmail-provider-run-packet.v1"],
  ["outlook run packet schema included", outlook.runPacketSchema === "regent-growth.outlook-provider-run-packet.v1"],
  ["gmail docs counted", gmail.requiredDocCount >= 10],
  ["outlook docs counted", outlook.requiredDocCount >= 10],
  ["review names gmail endpoint", review.implementationReviewEndpoints.gmail === "/gmail/implementation-review/export"],
  ["review names outlook endpoint", review.implementationReviewEndpoints.outlook === "/outlook/implementation-review/export"],
  ["review names gmail doc", review.requiredDocs.includes("docs/PRODUCTION_GMAIL_IMPLEMENTATION_REVIEW.md")],
  ["review names outlook doc", review.requiredDocs.includes("docs/PRODUCTION_OUTLOOK_IMPLEMENTATION_REVIEW.md")],
  ["review blocks send approval", review.blockedReasons.includes("Production readiness review is not send approval.")],
  ["project plan next production review exists", projectPlan.includes("- Real-provider production readiness review")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider readiness review test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider readiness review test passed.");
