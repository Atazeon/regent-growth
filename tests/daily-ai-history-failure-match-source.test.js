const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getDailyHistoryFailedProspects(snapshot)");
const end = app.indexOf("function getVisibleDailyHistoryFailedProspects()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["history failure matcher exists", start !== -1],
  ["failure matcher keys companies", body.includes("const companyKeys = new Set(snapshot.companies.map(getCompanyMatchKey).filter(Boolean));")],
  ["failure matcher checks pipeline company", body.includes("companyKeys.has(getCompanyMatchKey(prospect.company))")],
  ["failure matcher requires missing email", body.includes("&& !prospect.aiEmail")],
  ["failure matcher requires Daily AI note", body.includes('(prospect.responseNotes || "").includes("Daily AI failed:")')],
  ["failure packet formatter exists", app.includes("function formatDailyAiFailurePacket(items = getDailyAiFailedProspects())")],
  ["failure packet includes website", app.includes('`Website: ${prospect.website || "Not set"}`')],
  ["failure packet includes latest note", app.includes('`Failure: ${getLatestDailyAiFailureNote(prospect) || "No failure note saved."}`')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI history failure match test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI history failure match test passed.");
