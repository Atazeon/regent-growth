const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderReviewedCrmQueue(reviewedCrmLeads, showEmpty = false)");
const end = app.indexOf("const crmQueuePageSize", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed queue renderer exists", start !== -1],
  ["reviewed bounded page calculated", body.includes("const reviewedPage = getBoundedPage(crmReviewedQueuePage, reviewedCrmLeads.length);")],
  ["reviewed start offset calculated", body.includes("const reviewedStart = reviewedPage * crmQueuePageSize;")],
  ["reviewed page leads sliced", body.includes("const reviewedPageLeads = reviewedCrmLeads.slice(reviewedStart, reviewedStart + crmQueuePageSize);")],
  ["reviewed page state persisted", body.includes("crmReviewedQueuePage = reviewedPage;")],
  ["reviewed pagination rendered", body.includes('${renderCrmQueuePagination("reviewed", reviewedCrmLeads.length, reviewedPage)}')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed queue pagination test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed queue pagination test passed.");
