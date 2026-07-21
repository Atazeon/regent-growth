const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["checklist heading id exists", html.includes('<h3 id="crmChecklistHeading">Checklist</h3>')],
  ["checklist list labelled", html.includes('<div class="checklist" role="list" aria-labelledby="crmChecklistHeading">')],
  ["checklist items labelled", html.includes('<label role="listitem"><input type="checkbox"> Decision-maker identified</label>')],
  ["assessment item retained", html.includes('<label role="listitem"><input type="checkbox"> Assessment notes ready</label>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist semantics test passed.");
