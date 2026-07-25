const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const ids = [
  "copyHandoffPacketButton",
  "exportWarmCsvButton",
  "exportWarmJsonButton",
  "markCrmReadyButton",
  "handoffOwnerInput",
  "handoffStatusInput",
  "handoffDueInput",
  "handoffNotesInput"
];

const checks = ids.map((id) => [`${id} handoff control exists`, html.includes(`id="${id}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product handoff controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product handoff controls test passed.");
