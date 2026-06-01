import fs from "node:fs";
import vm from "node:vm";

const requiredStatuses = [
  "planned",
  "waiting",
  "submitted",
  "reviewing",
  "returned",
  "overdue",
  "blocked",
  "canceled",
  "complete"
];

const requiredCollections = [
  "tracks",
  "offerPackages",
  "leads",
  "opportunities",
  "customers",
  "cohorts",
  "sessions",
  "assignments",
  "submissions",
  "reviews",
  "followups",
  "receipts"
];

function fail(message) {
  console.error(`verification failed: ${message}`);
  process.exit(1);
}

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read("../web/seed-data.js"), sandbox);
vm.runInContext(read("../web/operating-records.js"), sandbox);

const data = sandbox.window.EPOCH_SEED_DATA;
if (!data) fail("seed data was not exported on window.EPOCH_SEED_DATA");
const recordTools = sandbox.window.EPOCH_OPERATING_RECORDS;
if (!recordTools) fail("operating record helpers were not exported on window.EPOCH_OPERATING_RECORDS");

for (const status of requiredStatuses) {
  if (!data.statuses.includes(status)) fail(`seed data missing status ${status}`);
}

for (const collection of requiredCollections) {
  if (!Array.isArray(data[collection]) || data[collection].length === 0) {
    fail(`seed data missing non-empty collection ${collection}`);
  }
}

const header = read("../native/epoch_core.h");
const source = read("../native/epoch_core.c");
for (const status of requiredStatuses) {
  const enumName = `EPOCH_STATUS_${status.toUpperCase()}`;
  if (!header.includes(enumName)) fail(`native header missing ${enumName}`);
  if (!source.includes(`"${status}"`)) fail(`native source missing label ${status}`);
}

const html = read("../web/index.html");
for (const id of [
  "view-admin",
  "view-student",
  "view-monitor",
  "view-public",
  "offer-catalog",
  "schedule-form",
  "schedule-feed",
  "intake-form",
  "intake-feed",
  "submission-form",
  "submission-feed",
  "return-review",
  "storage-status",
  "export-ledger",
  "import-ledger",
  "ledger-json",
  "intake-package"
]) {
  if (!html.includes(`id="${id}"`)) fail(`web surface missing ${id}`);
}
for (const field of ["requesterName", "ageBand", "offerKind", "packageId", "preferredWindow", "requestSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`intake form missing field ${field}`);
}
for (const field of ["owner", "sessionTitle", "startAt", "endAt", "deadlineAt"]) {
  if (!html.includes(`name="${field}"`)) fail(`schedule form missing field ${field}`);
}
for (const field of ["assignmentId", "reviewDueAt", "submissionTitle", "submissionSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`submission form missing field ${field}`);
}
if (!html.includes("./operating-records.js")) fail("web surface does not load operating-records.js");

const app = read("../web/app.js");
for (const phrase of [
  "createIntakeRecords",
  "createSubmissionRecords",
  "createScheduleRecords",
  "createOperatingLedger",
  "importOperatingLedger",
  "returnReviewRecords",
  "buildMonitorReport",
  "summarizeDeadlines",
  "localStorage",
  "storageStatusText",
  "downloadLedger",
  "wireLedgerControls",
  "renderOfferCatalog",
  "renderOfferOptions",
  "renderScheduleFeed",
  "renderIntakeSnapshot",
  "renderSubmissions",
  "monitorSection",
  "Monitor Summary",
  "Request Captured",
  "Work Scheduled",
  "Submission Received",
  "Review Returned",
  "Ledger Exported",
  "Ledger Imported",
  "Opportunity Pipeline"
]) {
  if (!app.includes(phrase)) fail(`app script missing phrase: ${phrase}`);
}

if (!data.offerPackages.some((item) => item.id === "pkg-under19-assessment" && item.routing === "compatibility-required")) {
  fail("offer catalog missing under-19 compatibility package");
}
if (!data.offerPackages.some((item) => item.offerKind === "management_system" && item.priceJpy >= 100000)) {
  fail("offer catalog missing management-system package");
}

const checklist = read("../docs/first-commercial-slice-checklist.md");
for (const phrase of [
  "Public professional offer page",
  "Internal schedule/admin view",
  "Student/customer status view",
  "EPOCH MONITOR status page",
  "from intake through returned feedback"
]) {
  if (!checklist.includes(phrase)) fail(`checklist missing phrase: ${phrase}`);
}

const attention = [
  ...data.assignments,
  ...data.submissions,
  ...data.reviews
].filter((item) => ["submitted", "reviewing", "overdue", "blocked"].includes(item.status));

if (attention.length < 3) fail("seed workflow does not demonstrate enough attention states");
if (!data.receipts.some((item) => item.status === "complete")) fail("seed workflow lacks a completed receipt");

const intakeResult = recordTools.createIntakeRecords(data, {
  requesterName: "Compatibility prospect",
  ageBand: "under-19",
  offerKind: "education",
  packageId: "pkg-eiken-writing-monthly",
  preferredWindow: "2026-06-05T19:30",
  requestSummary: "Needs EIKEN writing support but requires fit review."
}, {
  now: "2026-06-01T02:30:00.000Z"
});

if (intakeResult.data.leads.length !== data.leads.length + 1) fail("intake flow did not create a lead");
if (intakeResult.data.opportunities.length !== data.opportunities.length + 1) fail("intake flow did not create an opportunity");
if (intakeResult.data.customers.length !== data.customers.length + 1) fail("intake flow did not create a customer");
if (intakeResult.data.assignments.length !== data.assignments.length + 1) fail("intake flow did not create a visible request");
if (intakeResult.data.followups.length !== data.followups.length + 1) fail("intake flow did not create a follow-up");
if (intakeResult.data.receipts.length !== data.receipts.length + 1) fail("intake flow did not create a receipt");
if (intakeResult.records.lead.status !== "waiting") fail("under-19 intake should wait for compatibility review");
if (intakeResult.records.opportunity.packageId !== "pkg-under19-assessment") fail("under-19 intake did not route to compatibility package");
if (intakeResult.records.opportunity.estimatedValueJpy < 60000) fail("under-19 opportunity value does not reflect higher-touch routing");
if (!intakeResult.records.customer.externalStatus.includes("compatibility")) fail("under-19 intake lacks compatibility messaging");
if (!intakeResult.records.assignment.externalVisible) fail("intake request is not external-visible");

const scheduleResult = recordTools.createScheduleRecords(intakeResult.data, {
  assignmentId: intakeResult.records.assignment.id,
  sessionTitle: "Diagnostic scheduling call",
  owner: "Jack",
  startAt: "2026-06-05T19:30",
  endAt: "2026-06-05T20:15",
  deadlineAt: "2026-06-06T18:00"
}, {
  now: "2026-06-01T03:00:00.000Z"
});

if (scheduleResult.data.sessions.length !== intakeResult.data.sessions.length + 1) fail("schedule flow did not create a session");
if (scheduleResult.data.cohorts.length !== intakeResult.data.cohorts.length + 1) fail("schedule flow did not create a cohort");
if (scheduleResult.records.assignment.status !== "planned") fail("schedule flow did not set assignment planned");
if (scheduleResult.records.session.owner !== "Jack") fail("schedule flow did not assign owner");
if (!scheduleResult.data.customers[0].externalStatus.includes("scheduled")) fail("schedule flow did not update external status");

const deadlineSummary = recordTools.summarizeDeadlines(scheduleResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (deadlineSummary.upcoming < 1) fail("deadline summary did not detect upcoming work");
if (deadlineSummary.owned < 1) fail("deadline summary did not detect owner-linked work");

const submissionResult = recordTools.createSubmissionRecords(scheduleResult.data, {
  assignmentId: intakeResult.records.assignment.id,
  reviewDueAt: "2026-06-06T18:00",
  submissionTitle: "Diagnostic essay",
  submissionSummary: "Student submitted a diagnostic essay for review."
}, {
  now: "2026-06-01T03:10:00.000Z"
});

if (submissionResult.data.submissions.length !== intakeResult.data.submissions.length + 1) fail("submission flow did not create a submission");
if (submissionResult.data.reviews.length !== intakeResult.data.reviews.length + 1) fail("submission flow did not create a review");
if (submissionResult.records.submission.status !== "reviewing") fail("submission should enter reviewing status");
if (submissionResult.records.review.status !== "reviewing") fail("review should enter reviewing status");
if (!submissionResult.data.customers[0].externalStatus.includes("review is in progress")) fail("submission flow did not update customer status");

const returnResult = recordTools.returnReviewRecords(submissionResult.data, {
  submissionId: submissionResult.records.submission.id,
  returnedSummary: "Feedback returned with revision target."
}, {
  now: "2026-06-01T04:00:00.000Z"
});

if (returnResult.records.submission.status !== "returned") fail("return flow did not update submission status");
if (returnResult.records.review.status !== "returned") fail("return flow did not update review status");
if (returnResult.data.receipts.length !== submissionResult.data.receipts.length + 1) fail("return flow did not create a receipt");
if (!returnResult.data.customers[0].externalStatus.includes("Feedback returned")) fail("return flow did not update external status");

const monitorReport = recordTools.buildMonitorReport(returnResult.data, { now: "2026-06-01T12:00:00+09:00" });
for (const section of ["summary", "queue", "timeline", "risks", "receipts"]) {
  if (!(section in monitorReport)) fail(`monitor report missing section ${section}`);
}
if (monitorReport.summary.timeline < 1) fail("monitor report did not include timeline records");
if (!Array.isArray(monitorReport.queue)) fail("monitor report queue is not an array");
if (!Array.isArray(monitorReport.receipts) || monitorReport.receipts.length < 1) fail("monitor report receipts missing returned review receipt");

const exportedLedger = recordTools.createOperatingLedger(returnResult.data, { now: "2026-06-01T04:30:00.000Z" });
if (exportedLedger.schema !== "epoch.operating-ledger") fail("ledger export has wrong schema");
if (exportedLedger.version !== recordTools.ledgerVersion) fail("ledger export has wrong version");
if (exportedLedger.counts.receipts !== returnResult.data.receipts.length) fail("ledger export receipt count is wrong");
if (!exportedLedger.monitor || exportedLedger.monitor.timeline < 1) fail("ledger export missing monitor summary");

const importedLedger = recordTools.importOperatingLedger(data, JSON.stringify(exportedLedger));
if (importedLedger.data.receipts.length !== returnResult.data.receipts.length) fail("ledger import did not preserve receipts");
if (importedLedger.data.customers[0].externalStatus !== returnResult.data.customers[0].externalStatus) fail("ledger import did not preserve external status");

let rejectedInvalidLedger = false;
try {
  recordTools.importOperatingLedger(data, JSON.stringify({ data: { statuses: "bad", receipts: [] } }));
} catch {
  rejectedInvalidLedger = true;
}
if (!rejectedInvalidLedger) fail("ledger import accepted an invalid statuses field");

console.log("commercial slice verification passed");
