const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const ids = [
  "generateDiscoveryButton",
  "runDailyAiButton",
  "dailyRunReviewQueue",
  "openMailClientButton",
  "openGmailButton",
  "openOutlookButton",
  "markEmailSentButton",
  "markCrmReadyButton",
  "handoffOwnerInput",
  "handoffDueInput",
  "checkCrmSetupButton",
  "copyHandoffPacketButton"
];

const checks = ids.map((id) => [`${id} supports post-launch walkthrough`, html.includes(`id="${id}"`)]);
const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Post-launch app walkthrough support test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Post-launch app walkthrough support test passed.");
