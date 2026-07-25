const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["discovery form exists", html.includes('id="discoveryForm"')],
  ["target industry field exists", html.includes('id="discoveryIndustries"')],
  ["target location field exists", html.includes('id="discoveryLocation"')],
  ["candidate count field bounds exist", html.includes('id="discoveryCount" name="count" type="number" min="3" max="20"')],
  ["daily run limit field bounds exist", html.includes('id="dailyRunLimit" name="dailyRunLimit" type="number" min="1" max="10"')],
  ["evidence requirement toggle exists", html.includes('id="dailyRequireEvidence"')],
  ["auto-fetch evidence toggle exists", html.includes('id="dailyAutoFetchEvidence"')],
  ["candidate generation listener exists", app.includes('generateDiscoveryButton.addEventListener("click", generateDiscoveryCandidates);')],
  ["daily run listener exists", app.includes('runDailyAiButton.addEventListener("click", runDailyAiWorkflow);')],
  ["stop run listener exists", app.includes('stopDailyAiButton.addEventListener("click", requestDailyAiStop);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Discovery section controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Discovery section controls test passed.");
