const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const {
  getProviderAdapter,
  createProviderSendAdapter
} = require("../production-provider-middleware");

async function run() {
  const gmailInterface = createProviderSendAdapter(getProviderAdapter("gmail"));
  const result = await gmailInterface.sendReviewedPacket({});

  const checks = [
    ["middleware exports provider send adapter", typeof createProviderSendAdapter === "function"],
    ["middleware has sendReviewedPacket interface", source.includes("async sendReviewedPacket()")],
    ["gmail interface keeps provider", gmailInterface.provider === "gmail"],
    ["gmail interface cannot send", gmailInterface.canSend === false],
    ["gmail interface rejects send", result.accepted === false],
    ["gmail interface keeps sent false", result.sent === false],
    ["gmail interface keeps booked false", result.booked === false],
    ["gmail interface explains not send capable", result.issues.some((issue) => issue.includes("not send-capable yet"))],
    ["project plan next adapter interface exists", projectPlan.includes("- First test-mailbox provider adapter interface")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production provider adapter interface test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production provider adapter interface test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
