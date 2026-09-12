const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getRealProviderSendAdapterImplementationPlan } = require("../production-provider-middleware");

const plan = getRealProviderSendAdapterImplementationPlan();

const checks = [
  ["middleware exports send adapter implementation plan", typeof getRealProviderSendAdapterImplementationPlan === "function"],
  ["middleware has implementation plan route", source.includes('requestUrl.pathname === "/real-provider/send-adapter-implementation-plan"')],
  ["implementation plan schema exists", plan.schemaVersion === "regent-growth.real-provider-send-adapter-implementation-plan.v1"],
  ["implementation plan has timestamp", typeof plan.generatedAt === "string" && plan.generatedAt.length > 0],
  ["implementation plan blocks approval", plan.approvedForRealSend === false],
  ["implementation plan blocks canSend", plan.canSend === false],
  ["implementation plan keeps sent disabled", plan.sentEnabled === false],
  ["implementation plan keeps booked disabled", plan.bookedEnabled === false],
  ["implementation plan targets gmail", plan.targetProviders.includes("gmail")],
  ["implementation plan targets outlook", plan.targetProviders.includes("outlook")],
  ["implementation plan links readiness review", plan.prerequisiteEndpoints.includes("/real-provider/production-readiness-review")],
  ["implementation plan links gap list", plan.prerequisiteEndpoints.includes("/real-provider/rollout-gap-list")],
  ["implementation plan includes oauth stage", plan.implementationStages.some((stage) => stage.includes("OAuth token loading"))],
  ["implementation plan includes suppression stage", plan.implementationStages.some((stage) => stage.includes("suppression checks"))],
  ["implementation plan includes unsubscribe stage", plan.implementationStages.some((stage) => stage.includes("unsubscribe language"))],
  ["implementation plan includes retry stage", plan.implementationStages.some((stage) => stage.includes("retry behavior"))],
  ["implementation plan includes approval stage", plan.implementationStages.some((stage) => stage.includes("manual setup approval"))],
  ["implementation plan includes blocked default test", plan.requiredTests.some((test) => test.includes("blocked default behavior"))],
  ["implementation plan blocks send approval", plan.blockedReasons.includes("Implementation plan is not send approval.")],
  ["project plan next implementation plan exists", projectPlan.includes("- First real-provider send adapter implementation plan")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real-provider send adapter implementation plan test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real-provider send adapter implementation plan test passed.");
