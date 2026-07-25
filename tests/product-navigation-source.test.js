const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["dashboard nav exists", html.includes('href="#dashboard"')],
  ["reminders nav exists", html.includes('href="#reminders"')],
  ["discovery nav exists", html.includes('href="#discovery"')],
  ["prospects nav exists", html.includes('href="#prospects"')],
  ["detail nav exists", html.includes('href="#detail"')],
  ["prompts nav exists", html.includes('href="#prompts"')],
  ["research nav exists", html.includes('href="#research"')],
  ["outreach nav exists", html.includes('href="#outreach"')],
  ["handoff nav exists", html.includes('href="#handoff"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product navigation test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product navigation test passed.");
