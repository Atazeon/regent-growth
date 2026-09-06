const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getProviderAdapter,
  createProviderSendAdapter,
  createOutlookSendAdapter
} = require("../production-provider-middleware");

async function run() {
  const adapter = getProviderAdapter("outlook");
  const outlookAdapter = createOutlookSendAdapter(adapter);
  const routedAdapter = createProviderSendAdapter(adapter);
  const result = await routedAdapter.sendReviewedPacket(fixture);

  const checks = [
    ["middleware exports outlook skeleton", typeof createOutlookSendAdapter === "function"],
    ["provider factory routes outlook", source.includes('if (adapter.name === "outlook") return createOutlookSendAdapter(adapter);')],
    ["outlook skeleton has provider", outlookAdapter.provider === "outlook"],
    ["outlook skeleton cannot send", outlookAdapter.canSend === false],
    ["routed adapter uses outlook", routedAdapter.provider === "outlook"],
    ["outlook result stays rejected", result.accepted === false],
    ["outlook result keeps sent false", result.sent === false],
    ["outlook result keeps booked false", result.booked === false],
    ["outlook result names provider", result.provider === "outlook"],
    ["outlook result has no provider id", result.providerMessageId === ""],
    ["outlook result includes implementation guard", result.implementationGuard === "regent-growth.provider-implementation-guard.v1"],
    ["outlook result includes missing controls", Array.isArray(result.missingControls) && result.missingControls.includes("send-adapter")],
    ["outlook result reports missing control issue", result.issues.some((issue) => issue.includes("Outlook implementation control missing: send-adapter."))],
    ["outlook result explains not send capable", result.issues.some((issue) => issue.includes("not send-capable yet"))],
    ["outlook result reports not implemented", result.message.includes("Real Outlook sending is not implemented")],
    ["project plan next outlook skeleton exists", projectPlan.includes("- First Outlook provider adapter implementation skeleton")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production Outlook provider skeleton test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production Outlook provider skeleton test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
