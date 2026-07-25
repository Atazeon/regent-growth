const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["run daily AI button exists", html.includes('id="runDailyAiButton"')],
  ["stop daily AI button exists", html.includes('id="stopDailyAiButton"')],
  ["generate candidates button exists", html.includes('id="generateDiscoveryButton"')],
  ["clear discovery button exists", html.includes('id="clearDiscoveryButton"')],
  ["daily run limit exists", html.includes('id="dailyRunLimit"')],
  ["require evidence toggle exists", html.includes('id="dailyRequireEvidence"')],
  ["auto fetch evidence toggle exists", html.includes('id="dailyAutoFetchEvidence"')],
  ["run daily AI wired", app.includes('runDailyAiButton.addEventListener("click", runDailyAiWorkflow);')],
  ["stop daily AI wired", app.includes('stopDailyAiButton.addEventListener("click", requestDailyAiStop);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product Daily AI controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product Daily AI controls test passed.");
