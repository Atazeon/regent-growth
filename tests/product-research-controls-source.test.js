const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const ids = [
  "checkResearchSourcesButton",
  "searchProspectSourcesButton",
  "fetchProspectSourceButton",
  "generateBriefButton",
  "copyResearchBriefButton",
  "exportResearchBriefButton",
  "exportResearchJsonButton",
  "copyResearchJsonButton",
  "clearResearchBriefButton"
];

const checks = ids.map((id) => [`${id} research control exists`, html.includes(`id="${id}"`)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product research controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product research controls test passed.");
