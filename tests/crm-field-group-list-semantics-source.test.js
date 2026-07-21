const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["field row list wrapper exists", app.includes('<div class="crm-field-row-list" role="list" aria-label="${escapeHtml(group.label)} CRM fields">')],
  ["field row listitem retained", app.includes('<div class="crm-field-row" role="listitem"')],
  ["field row list closes before section", app.includes("          </div>\n        </section>")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM field group list semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM field group list semantics test passed.");
