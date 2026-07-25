const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function researchAndDraftDailyProspects(prospectsToProcess)");
const end = app.indexOf("async function runDailyAiWorkflow()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["research/draft loop exists", start !== -1],
  ["loop honors stop request", body.includes("if (dailyRunStopRequested)")],
  ["loop skips completed AI work", body.includes("if (prospect.aiBrief && prospect.aiEmail)")],
  ["loop selects current prospect", body.includes("selectedProspectIndex = prospects.indexOf(prospect);")],
  ["loop researches missing brief", body.includes("if (!prospect.aiBrief)")],
  ["loop applies parsed research", body.includes("applyResearchToProspect(prospect, research);")],
  ["loop drafts missing email", body.includes("if (!prospect.aiEmail)")],
  ["loop moves drafted prospect stage", body.includes('prospect.stage = "Email Drafted";')],
  ["loop saves after each prospect", body.includes("saveProspects();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Daily AI research/draft loop test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Daily AI research/draft loop test passed.");
