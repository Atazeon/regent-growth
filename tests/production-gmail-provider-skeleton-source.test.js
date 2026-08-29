const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getProviderAdapter,
  createProviderSendAdapter,
  createGmailSendAdapter
} = require("../production-provider-middleware");

async function run() {
  const adapter = getProviderAdapter("gmail");
  const gmailAdapter = createGmailSendAdapter(adapter);
  const routedAdapter = createProviderSendAdapter(adapter);
  const result = await routedAdapter.sendReviewedPacket(fixture);

  const checks = [
    ["middleware exports gmail skeleton", typeof createGmailSendAdapter === "function"],
    ["provider factory routes gmail", source.includes('if (adapter.name === "gmail") return createGmailSendAdapter(adapter);')],
    ["gmail skeleton has provider", gmailAdapter.provider === "gmail"],
    ["gmail skeleton cannot send", gmailAdapter.canSend === false],
    ["routed adapter uses gmail", routedAdapter.provider === "gmail"],
    ["gmail result stays rejected", result.accepted === false],
    ["gmail result keeps sent false", result.sent === false],
    ["gmail result keeps booked false", result.booked === false],
    ["gmail result names provider", result.provider === "gmail"],
    ["gmail result has no provider id", result.providerMessageId === ""],
    ["gmail result includes implementation guard", result.implementationGuard === "regent-growth.provider-implementation-guard.v1"],
    ["gmail result includes missing controls", Array.isArray(result.missingControls) && result.missingControls.includes("send-adapter")],
    ["gmail result reports missing control issue", result.issues.some((issue) => issue.includes("Gmail implementation control missing: send-adapter."))],
    ["gmail result reports not implemented", result.message.includes("Real Gmail sending is not implemented")],
    ["project plan next gmail skeleton exists", projectPlan.includes("- First Gmail provider adapter implementation skeleton")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production Gmail provider skeleton test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production Gmail provider skeleton test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
