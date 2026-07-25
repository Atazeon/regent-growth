const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const requiredIds = [
  "modelSelect",
  "runDailyAiButton",
  "generateDiscoveryButton",
  "dailyRunCapacitySummary",
  "dailyRunReviewQueue",
  "prospectList",
  "selectedDetail",
  "researchPrompt",
  "emailDraft",
  "emailSendSummary",
  "crmSetupStatus",
  "crmRetryQueue",
  "teamSyncStatus",
  "ownerWorkloadList",
  "blockedHandoffList",
  "reminderList"
];

const checks = requiredIds.map((id) => [`${id} exists`, html.includes(`id="${id}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product smoke DOM test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product smoke DOM test passed.");
