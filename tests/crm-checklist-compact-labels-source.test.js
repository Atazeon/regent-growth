const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy label compact", html.includes('aria-label="Copy CRM checklist summary">Copy</button>')],
  ["download label compact", html.includes('aria-label="Download CRM checklist summary">Download</button>')],
  ["reset label compact", html.includes('aria-label="Clear saved CRM checklist progress">Reset</button>')],
  ["json labels retained", html.includes('aria-label="Copy CRM checklist JSON">Copy JSON</button>') && html.includes('aria-label="Download CRM checklist JSON">Download JSON</button>')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist compact labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist compact labels test passed.");
