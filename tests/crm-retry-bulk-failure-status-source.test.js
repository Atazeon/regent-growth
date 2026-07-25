const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retryFailedCrmSyncs()");
const end = app.indexOf("function showFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["bulk retry function exists", start !== -1],
  ["bulk retry catches errors", body.includes("} catch (error) {")],
  ["bulk retry keeps failed status", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["bulk retry saves failures", body.includes("saveProspects();")],
  ["bulk retry renders failures", body.includes("renderProspects();")],
  ["bulk retry reports error status", body.includes('setCrmSetupStatus(`CRM retry failed: ${error.message}`, "error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry bulk failure status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry bulk failure status test passed.");
