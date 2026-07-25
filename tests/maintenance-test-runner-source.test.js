const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runner = fs.readFileSync(path.join(root, "tests", "run-source-tests.js"), "utf8");

const checks = [
  ["test runner reads tests dir", runner.includes("const testsDir = path.join(root, \"tests\");")],
  ["test runner finds test files", runner.includes('.filter((filename) => filename.endsWith(".test.js"))')],
  ["test runner sorts files", runner.includes(".sort();")],
  ["test runner checks app syntax", runner.includes('["app syntax", ["--check", path.join(root, "app.js")]]')],
  ["test runner uses current node", runner.includes("process.execPath")],
  ["test runner fails process on failures", runner.includes("process.exit(1);")],
  ["test runner reports count", runner.includes("Source test runner passed ${commands.length} checks.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance test runner test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance test runner test passed.");
