const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["area filter exists", html.includes('id="outboundSessionAreaFilter"')],
  ["next button exists", html.includes('id="focusNextOutboundStepButton"')],
  ["complete visible button exists", html.includes('id="completeVisibleOutboundStepsButton"')],
  ["next action region exists", html.includes('id="outboundSessionNextAction"')],
  ["filter has all areas option", html.includes('<option value="all">All areas</option>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session refinement UI test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session refinement UI test passed.");
