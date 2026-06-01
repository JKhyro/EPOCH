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
  "leads",
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
for (const id of ["view-admin", "view-student", "view-monitor", "view-public", "intake-form", "intake-feed"]) {
  if (!html.includes(`id="${id}"`)) fail(`web surface missing ${id}`);
}
for (const field of ["requesterName", "ageBand", "offerKind", "preferredWindow", "requestSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`intake form missing field ${field}`);
}
if (!html.includes("./operating-records.js")) fail("web surface does not load operating-records.js");

const app = read("../web/app.js");
for (const phrase of [
  "createIntakeRecords",
  "localStorage",
  "renderIntakeSnapshot",
  "Request Captured"
]) {
  if (!app.includes(phrase)) fail(`app script missing phrase: ${phrase}`);
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
  preferredWindow: "2026-06-05T19:30",
  requestSummary: "Needs EIKEN writing support but requires fit review."
}, {
  now: "2026-06-01T02:30:00.000Z"
});

if (intakeResult.data.leads.length !== data.leads.length + 1) fail("intake flow did not create a lead");
if (intakeResult.data.customers.length !== data.customers.length + 1) fail("intake flow did not create a customer");
if (intakeResult.data.assignments.length !== data.assignments.length + 1) fail("intake flow did not create a visible request");
if (intakeResult.data.followups.length !== data.followups.length + 1) fail("intake flow did not create a follow-up");
if (intakeResult.data.receipts.length !== data.receipts.length + 1) fail("intake flow did not create a receipt");
if (intakeResult.records.lead.status !== "waiting") fail("under-19 intake should wait for compatibility review");
if (!intakeResult.records.customer.externalStatus.includes("compatibility")) fail("under-19 intake lacks compatibility messaging");
if (!intakeResult.records.assignment.externalVisible) fail("intake request is not external-visible");

console.log("commercial slice verification passed");
