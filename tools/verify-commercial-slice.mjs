import fs from "node:fs";
import vm from "node:vm";

const requiredStatuses = [
  "planned",
  "waiting",
  "proposed",
  "queued",
  "submitted",
  "reviewing",
  "returned",
  "overdue",
  "blocked",
  "approved",
  "dispatched",
  "acknowledged",
  "in-progress",
  "sent",
  "failed",
  "retry-ready",
  "rejected",
  "rolled-back",
  "canceled",
  "complete"
];

const requiredCollections = [
  "tracks",
  "offerPackages",
  "curriculumFrameworks",
  "packageGameplans",
  "campaignRoutes",
  "leads",
  "opportunities",
  "routePlacements",
  "monitorHealthChecks",
  "notificationEvents",
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
if (!Array.isArray(data.engagements)) fail("seed data missing engagements collection");
if (!Array.isArray(data.workPlans)) fail("seed data missing workPlans collection");
if (!Array.isArray(data.agentHandoffs)) fail("seed data missing agentHandoffs collection");
if (!Array.isArray(data.notificationDeliveries)) fail("seed data missing notificationDeliveries collection");

const header = read("../native/epoch_core.h");
const source = read("../native/epoch_core.c");
for (const status of requiredStatuses) {
  const enumName = `EPOCH_STATUS_${status.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
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
  "intake-form",
  "schedule-form",
  "schedule-lifecycle-form",
  "schedule-lifecycle-session",
  "schedule-lifecycle-action",
  "schedule-lifecycle-confirmation",
  "schedule-feed",
  "intake-feed",
  "submission-form",
  "submission-feed",
  "customer-update-log",
  "opportunity-form",
  "engagement-opportunity",
  "opportunity-feed",
  "engagement-feed",
  "opportunity-confirmation",
  "return-review",
  "monitor-route-status",
  "monitor-controls",
  "storage-status",
  "export-ledger",
  "import-ledger",
  "ledger-json",
  "intake-package",
  "monitor-operator-status",
  "monitor-action-buttons",
  "monitor-action-receipts",
  "agent-handoff-form",
  "agent-handoff-select",
  "agent-handoff-action",
  "agent-handoff-transition",
  "agent-handoff-confirmation",
  "notification-outbox-form",
  "notification-delivery-select",
  "notification-outbox-action",
  "notification-outbox-apply",
  "notification-outbox-confirmation"
]) {
  if (!html.includes(`id="${id}"`)) fail(`web surface missing ${id}`);
}
for (const id of ["admin-gameplans", "student-gameplans", "curriculum-frameworks"]) {
  if (!html.includes(`id="${id}"`)) fail(`curriculum/gameplan surface missing ${id}`);
}
for (const id of ["admin-campaign-routes", "public-campaign-routes", "monitor-campaigns"]) {
  if (!html.includes(id)) fail(`marketing automation surface missing ${id}`);
}
for (const field of ["requesterName", "ageBand", "intakeLane", "billingRegion", "offerKind", "packageId", "documentType", "targetResult", "targetLevel", "baselineSampleState", "weaknessFocus", "availableStudyTime", "deadlineTimezone", "preferredWindow", "requestSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`intake form missing field ${field}`);
}
for (const field of ["owner", "sessionTitle", "startAt", "endAt", "deadlineAt"]) {
  if (!html.includes(`name="${field}"`)) fail(`schedule form missing field ${field}`);
}
for (const field of ["sessionId", "action", "nextActionAt", "reason"]) {
  if (!html.includes(`name="${field}"`)) fail(`schedule lifecycle form missing field ${field}`);
}
for (const field of ["opportunityId", "decision", "planStartAt", "planEndAt", "planDueAt", "decisionNote"]) {
  if (!html.includes(`name="${field}"`)) fail(`opportunity form missing field ${field}`);
}
for (const field of ["handoffId", "action", "nextActionAt", "customerVisibleApproved", "note", "customerSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`agent handoff form missing field ${field}`);
}
for (const field of ["deliveryId", "action", "provider", "channel", "nextActionAt", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`notification outbox form missing field ${field}`);
}
for (const field of ["assignmentId", "reviewDueAt", "submissionTitle", "submissionSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`submission form missing field ${field}`);
}
for (const phrase of ["data-monitor-target", "href=\"#monitor\"", "Direct route", "monitor-command-strip", "monitor-calendar", "monitor-handoffs", "monitor-suite", "monitor-persistence", "monitor-scope", "monitor-memory", "monitor-access"]) {
  if (!html.includes(phrase)) fail(`monitor route surface missing phrase ${phrase}`);
}
for (const phrase of ["monitor-curriculum", "Package Gameplans", "Personalized Gameplan", "Curriculum Frameworks"]) {
  if (!html.includes(phrase)) fail(`curriculum/gameplan HTML missing phrase ${phrase}`);
}
for (const phrase of [
  "SCAFFOLD-aligned",
  "Japan-wide premium services",
  "Request Diagnostic",
  "Compare Packages",
  "Submission-first English programs",
  "Adults first, under-19 by fit only",
  "Direct contracting with minors is not supported on this route",
  "Who is submitting",
  "Country / billing region",
  "Document type",
  "Target result",
  "Target level",
  "Baseline sample",
  "Weakness focus",
  "Available study time",
  "Deadline and timezone",
  "Japan-wide launch routes",
  "Global expansion routes",
  "Campaign Routes",
  "routed before booking",
  "Start with the right first paid step"
]) {
  if (!html.includes(phrase)) fail(`public offer funnel missing phrase ${phrase}`);
}
for (const phrase of [
  "command-strip",
  "topbar-controls",
  "control-chip",
  "mode-button",
  "control-shell",
  "control-rail",
  "rail-tree",
  "Thread Registry",
  "operator-control-panel",
  "Operating Control Panel",
  "Operator Actions",
  "Local Health Actions",
  "Safe Access"
]) {
  if (!html.includes(phrase)) fail(`SCAFFOLD/HERMES alignment surface missing ${phrase}`);
}
if (!html.includes("./operating-records.js")) fail("web surface does not load operating-records.js");

const app = read("../web/app.js");
for (const phrase of [
  "createIntakeRecords",
  "createSubmissionRecords",
  "createScheduleRecords",
  "rescheduleScheduleRecords",
  "cancelScheduleRecords",
  "decideOpportunityRecords",
  "createCalendarExport",
  "createOperatingLedger",
  "importOperatingLedger",
  "returnReviewRecords",
  "buildMonitorReport",
  "summarizeCalendarExport",
  "summarizeDeadlines",
  "summarizeAgentHandoffState",
  "summarizeRoutePlacementState",
  "summarizePersistenceState",
  "summarizeRevenueState",
  "summarizeNotificationState",
  "localStorage",
  "storageStatusText",
  "downloadLedger",
  "wireLedgerControls",
  "wireOpportunityForm",
  "wireMonitorMenu",
  "wireMonitorActionConsole",
  "wirePublicActions",
  "data-public-target",
  "[data-view]",
  "document.body.dataset.activeView",
  "aria-current",
  "viewFromRoute",
  "routeForView",
  "hashchange",
  "aria-selected",
  "renderOfferCatalog",
  "renderOfferOptions",
  "renderCurriculumFrameworks",
  "renderAdminGameplans",
  "renderStudentGameplans",
  "renderCampaignRoutes",
  "summarizeMarketingState",
  "summarizeCurriculumState",
  "Curriculum Readiness",
  "Campaign Readiness",
  "monitor-campaigns",
  "campaign route",
  "monitor-curriculum",
  "gameplan-ready",
  "marketRoute",
  "laborModel",
  "renderOpportunityOptions",
  "renderOpportunityFeed",
  "renderEngagementFeed",
  "frameworkId",
  "gameplanId",
  "renderScheduleFeed",
  "renderScheduleLifecycleOptions",
  "wireScheduleLifecycleForm",
  "renderIntakeSnapshot",
  "renderSubmissions",
  "renderCustomerUpdates",
  "monitorSection",
  "monitor-summary",
  "monitor-scope",
  "monitor-memory",
  "monitor-queue",
  "monitor-timeline",
  "monitor-handoffs",
  "monitor-suite",
  "monitor-notification-outbox",
  "monitor-calendar",
  "monitor-persistence",
  "monitor-access",
  "monitor-risks",
  "monitor-receipts",
  "monitor-route-status",
  "monitor-action-buttons",
  "monitor-action-receipts",
  "monitor-operator-status",
  "Monitor Summary",
  "Dirty Local State",
  "Awaiting Review",
  "Scope Health",
  "Memory Health",
  "Safe Access",
  "Operator Actions",
  "Request Captured",
  "Work Scheduled",
  "Schedule Rescheduled",
  "Schedule Canceled",
  "Submission Received",
  "Review Returned",
  "Ledger Exported",
  "Ledger Imported",
  "renderMonitorActionConsole",
  "runMonitorAction",
  "createMonitorActionRecords",
  "transitionAgentHandoffRecords",
  "createNotificationOutboxRecords",
  "transitionNotificationDeliveryRecords",
  "renderAgentHandoffOptions",
  "renderNotificationDeliveryOptions",
  "wireAgentHandoffForm",
  "wireNotificationOutboxForm",
  "Opportunity Pipeline",
  "Engagement Revenue",
  "Update Events",
  "Agent Handoffs",
  "ARA Handoff Updated",
  "agent-handoff-transition",
  "Notification Outbox",
  "Outbox Queued",
  "Delivery Updated",
  "SYNAPSE Placement",
  "no-duplicate-ui",
  "link-only",
  "operator-approval",
  "Calendar Export",
  "Persistence",
  "library-ready",
  "imported-recovery-snapshot",
  "Engagement Accepted",
  "Opportunity Deferred",
  "Opportunity Rejected"
]) {
  if (!app.includes(phrase)) fail(`app script missing phrase: ${phrase}`);
}

const styles = read("../web/styles.css");
for (const phrase of [
  "color-scheme: dark",
  "--bg: #040404",
  "--panel: #050705",
  "--text: #5b8f68",
  "--heading: #8fb99a",
  "--accent: #0f9b35",
  "--highlight: #78bd83",
  "--timeline-card-bg",
  "--bronze: #8E6142",
  "control-shell",
  "control-rail",
  "operator-control-panel",
  "operator-action-console",
  "handoff-console",
  "outbox-console",
  "monitor-action-button",
  "button-meta",
  "monitor-command-strip",
  "schedule-forms",
  "mode-button.active",
  "font-family: var(--font-mono)",
  "background: var(--panel-soft)"
]) {
  if (!styles.includes(phrase)) fail(`styles missing SCAFFOLD/HERMES alignment phrase: ${phrase}`);
}

if (!data.monitorScope || typeof data.monitorScope !== "object") fail("seed data missing monitor scope contract");
if (!Array.isArray(data.monitorMemory) || data.monitorMemory.length < 3) fail("seed data missing monitor memory notes");
if (!data.accessPosture || typeof data.accessPosture !== "object") fail("seed data missing access posture contract");
if (!Array.isArray(data.monitorHealthChecks) || data.monitorHealthChecks.length < 2) fail("seed data missing ledger-backed monitor health checks");
if (!data.receipts.some((item) => item.kind === "monitor-check")) fail("seed data missing monitor-check receipt");
if (data.accessPosture.defaultPublicPolicy !== "deny-by-default") fail("access posture must default to deny-by-default");
if (data.accessPosture.rawMonitor !== "local-only") fail("access posture must keep raw monitor local-only");
if (!data.monitorMemory.some((item) => item.status === "stale")) fail("monitor memory should demonstrate stale-note risk");

if (!data.offerPackages.some((item) => item.id === "pkg-under19-assessment" && item.routing === "compatibility-required")) {
  fail("offer catalog missing under-19 compatibility package");
}
if (!data.offerPackages.some((item) => item.offerKind === "management_system" && item.priceJpy >= 100000)) {
  fail("offer catalog missing management-system package");
}
if (!data.offerPackages.every((item) => item.marketRoute && item.laborModel)) {
  fail("offer catalog missing marketing route or labor model metadata");
}
if (!data.offerPackages.some((item) => item.laborModel === "async-first" && item.priceJpy >= 45000)) {
  fail("offer catalog missing premium async-first review package");
}
if (!data.offerPackages.some((item) => item.marketRoute.includes("global"))) {
  fail("offer catalog missing global expansion route");
}
if (!Array.isArray(data.campaignRoutes) || data.campaignRoutes.length < 5) fail("campaign route records missing marketing automation coverage");
if (!data.campaignRoutes.every((item) => item.campaignId && item.routeKey && item.channel && item.primaryConversion)) {
  fail("campaign routes missing campaign id, route key, channel, or primary conversion");
}
if (!data.campaignRoutes.every((item) => item.publicRoute && item.adminRoute && item.monitorRoute)) {
  fail("campaign routes missing public/admin/monitor surfaces");
}
if (!data.campaignRoutes.every((item) => Array.isArray(item.monitorKpis) && item.monitorKpis.length)) {
  fail("campaign routes missing monitor KPI sets");
}
if (!data.campaignRoutes.some((item) => item.regionScope === "jp" && item.routeKey.startsWith("ja/offers/"))) {
  fail("campaign routes missing Japan-wide offer route");
}
if (!data.campaignRoutes.some((item) => item.regionScope === "global" && item.routeKey.startsWith("global/offers/"))) {
  fail("campaign routes missing global offer route");
}
if (!data.campaignRoutes.some((item) => item.regionScope === "dual" && item.offerBundle === "crm-system")) {
  fail("campaign routes missing dual CRM/database service route");
}
if (!data.campaignRoutes.some((item) => item.audienceTier === "under19" && item.guardianConsentRequired && item.complianceFlags.includes("no-paid-action-before-consent"))) {
  fail("campaign routes missing guarded under-19 route");
}
if (!data.campaignRoutes.some((item) => item.offerBundle === "tech-support")) fail("campaign routes missing technical support route");
if (!data.campaignRoutes.some((item) => item.offerBundle === "teacher-review")) fail("campaign routes missing teacher review submission route");
for (const campaignRoute of data.campaignRoutes) {
  const publicCopy = `${campaignRoute.publicCopy || ""} ${campaignRoute.ctaPrimary || ""} ${campaignRoute.ctaSecondary || ""}`;
  for (const forbiddenTerm of campaignRoute.copyForbiddenTerms || []) {
    if (forbiddenTerm && publicCopy.includes(forbiddenTerm)) {
      fail(`campaign route ${campaignRoute.id} public copy includes forbidden term ${forbiddenTerm}`);
    }
  }
}
const englishOfferRoutes = data.campaignRoutes.filter((item) => item.offerBundle === "english-cohort" || item.offerBundle === "teacher-review");
for (const route of englishOfferRoutes) {
  const copy = String(route.publicCopy || "").toLowerCase();
  for (const requiredTerm of ["submission", "progress", "teacher-reviewed", "workflow"]) {
    if (!copy.includes(requiredTerm)) fail(`English offer campaign ${route.id} missing required copy term ${requiredTerm}`);
  }
}
if (!data.curriculumFrameworks.some((item) => item.id === "framework-eiken-5-to-1-writing")) {
  fail("curriculum frameworks missing EIKEN 5-1 ladder");
}
const eikenFramework = data.curriculumFrameworks.find((item) => item.id === "framework-eiken-5-to-1-writing");
for (const level of ["5", "4", "3", "Pre-2", "2", "Pre-1", "1"]) {
  if (!eikenFramework.levels.includes(level)) fail(`EIKEN framework missing level ${level}`);
}
if (!eikenFramework.positioning.includes("teacher-reviewed feedback")) fail("EIKEN framework missing outcome/workflow positioning");
if (!eikenFramework.assessmentRules.some((item) => item.includes("Under-19"))) fail("EIKEN framework missing under-19 compatibility rule");
if (!data.packageGameplans.some((item) => item.packageId === "pkg-eiken-writing-monthly" && item.laborModel === "submission-first")) {
  fail("package gameplans missing premium submission-first EIKEN plan");
}
for (const offerPackage of data.offerPackages) {
  if (!data.packageGameplans.some((item) => item.packageId === offerPackage.id)) {
    fail(`package gameplans missing package ${offerPackage.id}`);
  }
}
if (!data.packageGameplans.every((item) => item.customerVisibleSummary && item.internalReadiness && item.under19Policy)) {
  fail("package gameplans missing customer/internal/under-19 policy metadata");
}
if (!data.customers.some((item) => item.gameplanId === "gameplan-premium-eiken-monthly")) {
  fail("customers do not demonstrate assigned personalized gameplan");
}
if (typeof recordTools.createAgentHandoffRecords !== "function") fail("operating helpers missing createAgentHandoffRecords");
if (typeof recordTools.createNotificationOutboxRecords !== "function") fail("operating helpers missing createNotificationOutboxRecords");
if (typeof recordTools.transitionNotificationDeliveryRecords !== "function") fail("operating helpers missing transitionNotificationDeliveryRecords");
if (typeof recordTools.createMonitorActionRecords !== "function") fail("operating helpers missing createMonitorActionRecords");
if (typeof recordTools.summarizeAgentHandoffState !== "function") fail("operating helpers missing summarizeAgentHandoffState");
if (typeof recordTools.summarizeAccessPosture !== "function") fail("operating helpers missing summarizeAccessPosture");
if (typeof recordTools.summarizeMemoryState !== "function") fail("operating helpers missing summarizeMemoryState");
if (typeof recordTools.summarizeRoutePlacementState !== "function") fail("operating helpers missing summarizeRoutePlacementState");
if (typeof recordTools.summarizeScopeState !== "function") fail("operating helpers missing summarizeScopeState");
if (typeof recordTools.summarizeCurriculumState !== "function") fail("operating helpers missing summarizeCurriculumState");
if (typeof recordTools.summarizeMarketingState !== "function") fail("operating helpers missing summarizeMarketingState");

const scopeSummary = recordTools.summarizeScopeState(data, { now: "2026-06-01T12:00:00+09:00" });
if (scopeSummary.allowedCount < 3) fail("scope summary missing allowed surfaces");
if (scopeSummary.blockedCount < 3) fail("scope summary missing blocked surfaces");
if (scopeSummary.status !== "ready") fail("scope summary should be ready for the seed slice");

const memorySummary = recordTools.summarizeMemoryState(data, { now: "2026-06-01T12:00:00+09:00" });
if (memorySummary.total < 3) fail("memory summary missing notes");
if (memorySummary.staleCount < 1) fail("memory summary should detect stale notes");

const accessSummary = recordTools.summarizeAccessPosture(data, { now: "2026-06-01T12:00:00+09:00" });
if (accessSummary.status !== "ready") fail("safe-access posture should be ready for the seed slice");
if (accessSummary.defaultPublicPolicy !== "deny-by-default") fail("safe-access summary lost deny-by-default posture");
if (accessSummary.rawAdmin !== "local-only") fail("safe-access summary should keep raw admin local-only");

const monitorActionResult = recordTools.createMonitorActionRecords(data, {
  actionId: "verify-safe-access-check",
  title: "Verify safe-access check",
  detail: "Verifier recorded a monitor action without creating customer-visible notification events.",
  status: "complete",
  target: "monitor-access",
  effect: "acknowledge-posture",
  priority: "medium"
}, { now: "2026-06-01T12:05:00+09:00" });
if (monitorActionResult.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("monitor action should add a monitor health check");
if (monitorActionResult.data.receipts.filter((item) => item.kind === "monitor-check").length !== data.receipts.filter((item) => item.kind === "monitor-check").length + 1) {
  fail("monitor action should add a monitor-check receipt");
}
if (monitorActionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("monitor action must not create customer-visible notification events");
if (monitorActionResult.records.healthCheck.customerVisible !== false) fail("monitor action health check must remain internal");

const marketingSummary = recordTools.summarizeMarketingState(data);
if (marketingSummary.total !== data.campaignRoutes.length) fail("marketing summary total is wrong");
if (marketingSummary.ready < 3) fail("marketing summary missing ready campaign routes");
if (marketingSummary.jp < 2) fail("marketing summary missing Japan campaign routes");
if (marketingSummary.global < 1) fail("marketing summary missing global campaign routes");
if (marketingSummary.dual < 1) fail("marketing summary missing dual campaign routes");
if (marketingSummary.copyViolations !== 0) fail("marketing summary reported copy policy violations");
if (marketingSummary.under19Routes !== marketingSummary.guardianRequiredRoutes) fail("marketing summary under-19 routes are not guardian gated");
if (marketingSummary.serviceRoutes < 2) fail("marketing summary missing adjacent service routes");

const checklist = read("../docs/first-commercial-slice-checklist.md");
for (const phrase of [
  "Public professional offer page",
  "Internal schedule/admin view",
  "Student/customer status view",
  "EPOCH MONITOR status page",
  "from intake through returned feedback",
  "Curriculum framework",
  "Package gameplan",
  "Campaign route"
]) {
  if (!checklist.includes(phrase)) fail(`checklist missing phrase: ${phrase}`);
}

const marketingAutomationDoc = read("../docs/marketing-advertising-automation-plan.md");
for (const phrase of [
  "campaignRoutes",
  "Japan English progress route",
  "Global professional support route",
  "Under-19 compatibility gate",
  "Do not make Japan-facing public copy AI-forward",
  "technical support retainers",
  "ready campaign routes",
  "copy-policy violations"
]) {
  if (!marketingAutomationDoc.includes(phrase)) fail(`marketing automation doc missing phrase: ${phrase}`);
}

const curriculumFrameworkDoc = read("../docs/curriculum-gameplan-framework.md");
for (const phrase of [
  "curriculumFrameworks",
  "packageGameplans",
  "EIKEN must cover levels 5, 4, 3, Pre-2, 2, Pre-1, and 1",
  "Do not lead public education copy with AI terminology",
  "under-19 guarded gameplan count"
]) {
  if (!curriculumFrameworkDoc.includes(phrase)) fail(`curriculum gameplan framework doc missing phrase: ${phrase}`);
}

const handoffContract = read("../docs/agentic-revenue-handoff-contract.md");
for (const phrase of [
  "SYMBIOSIS",
  "ANVIL",
  "pending-operator-approval",
  "customer-facing",
  "rollback"
]) {
  if (!handoffContract.includes(phrase)) fail(`agentic handoff contract missing phrase: ${phrase}`);
}

const routePlacementContract = read("../docs/synapse-route-placement-contract.md");
for (const phrase of [
  "SYNAPSE Route Placement Contract",
  "routePlacements",
  "EPOCH MONITOR",
  "duplicateUi",
  "local-first",
  "live API integration"
]) {
  if (!routePlacementContract.includes(phrase)) fail(`SYNAPSE route placement contract missing phrase: ${phrase}`);
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
  intakeLane: "parent or guardian",
  billingRegion: "Japan JPY billing",
  documentType: "EIKEN essay",
  targetResult: "Pass EIKEN Pre-1 writing",
  targetLevel: "EIKEN Pre-1",
  baselineSampleState: "ready to submit",
  weaknessFocus: "reason development",
  availableStudyTime: "30 minutes per weekday",
  deadlineTimezone: "June 5 JST",
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
if (intakeResult.data.notificationEvents.length !== data.notificationEvents.length + 1) fail("intake flow did not create a customer update event");
if (intakeResult.records.lead.status !== "waiting") fail("under-19 intake should wait for compatibility review");
if (intakeResult.records.opportunity.packageId !== "pkg-under19-assessment") fail("under-19 intake did not route to compatibility package");
if (intakeResult.records.opportunity.estimatedValueJpy < 60000) fail("under-19 opportunity value does not reflect higher-touch routing");
if (!intakeResult.records.customer.externalStatus.includes("compatibility")) fail("under-19 intake lacks compatibility messaging");
if (!intakeResult.records.assignment.externalVisible) fail("intake request is not external-visible");
if (intakeResult.records.assignment.intakeLane !== "parent or guardian") fail("intake assignment did not preserve intake lane");
if (!intakeResult.records.assignment.summary.includes("Document type: EIKEN essay")) fail("intake assignment summary missing document type");
if (!intakeResult.records.assignment.summary.includes("Target result: Pass EIKEN Pre-1 writing")) fail("intake assignment summary missing target result");
if (!intakeResult.records.assignment.summary.includes("Target level: EIKEN Pre-1")) fail("intake assignment summary missing target level");
if (!intakeResult.records.assignment.summary.includes("Weakness focus: reason development")) fail("intake assignment summary missing weakness focus");
if (!intakeResult.records.receipt.note.includes("Japan JPY billing")) fail("intake receipt missing billing region");
if (!intakeResult.records.notificationEvent.visible) fail("intake update event is not customer-visible");
if (intakeResult.records.opportunity.gameplanStatus !== "gameplan-linked") fail("intake opportunity did not link a package gameplan");
if (intakeResult.records.opportunity.gameplanId !== "gameplan-under19-compatibility") fail("under-19 intake should preserve compatibility gameplan identity");
if (intakeResult.records.opportunity.targetLevel !== "EIKEN Pre-1") fail("intake opportunity did not preserve target level");
if (intakeResult.records.customer.gameplanId !== intakeResult.records.opportunity.gameplanId) fail("intake customer did not preserve gameplan identity");
if (intakeResult.records.assignment.frameworkId !== intakeResult.records.opportunity.frameworkId) fail("intake assignment did not preserve framework identity");

const acceptResult = recordTools.decideOpportunityRecords(intakeResult.data, {
  opportunityId: intakeResult.records.opportunity.id,
  decision: "accept",
  owner: "Jack",
  planStartAt: "2026-06-05T19:30",
  planEndAt: "2026-06-05T20:15",
  planDueAt: "2026-06-06T18:00",
  decisionNote: "Accepted after fit review; start with a diagnostic submission."
}, {
  now: "2026-06-01T02:45:00.000Z"
});

if (acceptResult.records.opportunity.status !== "accepted") fail("accept flow did not mark opportunity accepted");
if (acceptResult.data.engagements.length !== intakeResult.data.engagements.length + 1) fail("accept flow did not create an engagement");
if (acceptResult.data.sessions.length !== intakeResult.data.sessions.length + 1) fail("accept flow did not create onboarding session");
if (acceptResult.data.cohorts.length !== intakeResult.data.cohorts.length + 1) fail("accept flow did not create engagement cohort");
if (acceptResult.data.assignments.length !== intakeResult.data.assignments.length + 1) fail("accept flow did not create first submission plan");
if (acceptResult.data.followups.length !== intakeResult.data.followups.length + 1) fail("accept flow did not create engagement follow-up");
if (acceptResult.data.receipts.length !== intakeResult.data.receipts.length + 1) fail("accept flow did not create acceptance receipt");
if (acceptResult.data.notificationEvents.length !== intakeResult.data.notificationEvents.length + 1) fail("accept flow did not create update event");
if (acceptResult.records.engagement.status !== "active") fail("accept flow did not create active engagement");
if (acceptResult.records.engagement.gameplanId !== intakeResult.records.opportunity.gameplanId) fail("accept flow did not preserve engagement gameplan identity");
if (acceptResult.records.engagement.frameworkId !== intakeResult.records.opportunity.frameworkId) fail("accept flow did not preserve engagement framework identity");
if (!acceptResult.records.assignment.externalVisible) fail("accept flow did not expose the first submission plan externally");
if (acceptResult.records.assignment.engagementId !== acceptResult.records.engagement.id) fail("accept flow did not link assignment to engagement");
if (acceptResult.records.assignment.gameplanId !== intakeResult.records.opportunity.gameplanId) fail("accept flow did not preserve assignment gameplan identity");
if (!acceptResult.records.assignment.summary.includes("Target level: EIKEN Pre-1")) fail("accept flow assignment summary missing target level");
if (!acceptResult.data.customers[0].externalStatus.includes("accepted")) fail("accept flow did not update customer external status");
if (acceptResult.data.customers[0].gameplanId !== intakeResult.records.opportunity.gameplanId) fail("accept flow did not preserve customer gameplan identity");
if (acceptResult.records.notificationEvent.sourceKind !== "engagement") fail("accept flow update event is not sourced to engagement");

const revenueSummary = recordTools.summarizeRevenueState(acceptResult.data);
if (revenueSummary.activeEngagements < 1) fail("revenue summary did not count active engagement");
if (revenueSummary.acceptedValueJpy < 60000) fail("revenue summary did not include accepted value");
if (revenueSummary.acceptedCount < 1) fail("revenue summary did not count accepted opportunity");
const notificationSummary = recordTools.summarizeNotificationState(acceptResult.data);
if (notificationSummary.visible < 1) fail("notification summary did not count visible updates");
if (notificationSummary.posted < 1) fail("notification summary did not count posted updates");

const outboxResult = recordTools.createNotificationOutboxRecords(acceptResult.data, {
  provider: "operator-dispatch",
  channel: "email-draft",
  nextActionAt: "2026-06-02T09:00"
}, {
  now: "2026-06-01T02:50:00.000Z"
});
if (outboxResult.records.deliveries.length < notificationSummary.visible) fail("notification outbox did not queue visible customer updates");
if (outboxResult.data.notificationDeliveries.length !== acceptResult.data.notificationDeliveries.length + outboxResult.records.deliveries.length) fail("notification outbox did not create delivery records");
if (outboxResult.data.receipts.length !== acceptResult.data.receipts.length + outboxResult.records.receipts.length) fail("notification outbox did not create receipts");
if (!outboxResult.records.deliveries.every((item) => item.customerVisible)) fail("notification outbox queued a non-customer-safe update by default");
if (!outboxResult.records.events.every((item) => item.outboxDeliveryId && item.deliveryProvider === "operator-dispatch")) fail("notification events were not linked to outbox deliveries");
const outboxSummary = recordTools.summarizeNotificationState(outboxResult.data);
if (outboxSummary.outbox !== outboxResult.data.notificationDeliveries.length) fail("notification summary did not count outbox records");
if (outboxSummary.queued < 1) fail("notification summary missing queued outbox records");
if (outboxSummary.outboxBlocked < 1) fail("notification summary missing blocked outbox records");
if (outboxSummary.missingOutbox !== 0) fail("notification summary still reports missing outbox records after queueing");

const queuedDelivery = outboxResult.records.deliveries.find((item) => item.status === "queued");
if (!queuedDelivery) fail("notification outbox did not create a queued delivery for lifecycle testing");
const dispatchedDeliveryResult = recordTools.transitionNotificationDeliveryRecords(outboxResult.data, {
  deliveryId: queuedDelivery.id,
  action: "dispatch",
  provider: "operator-dispatch",
  note: "Operator released the customer-safe update to the delivery handoff."
}, {
  now: "2026-06-01T02:51:00.000Z"
});
if (dispatchedDeliveryResult.records.delivery.status !== "dispatched") fail("notification delivery dispatch did not set dispatched status");
if (dispatchedDeliveryResult.records.delivery.attemptCount !== 1) fail("notification delivery dispatch did not increment attempts");
if (dispatchedDeliveryResult.records.receipt.kind !== "notification-delivery-dispatched") fail("notification delivery dispatch missing receipt kind");
const sentDeliveryResult = recordTools.transitionNotificationDeliveryRecords(dispatchedDeliveryResult.data, {
  deliveryId: queuedDelivery.id,
  action: "sent",
  note: "Provider-neutral delivery was marked sent."
}, {
  now: "2026-06-01T02:52:00.000Z"
});
if (sentDeliveryResult.records.delivery.status !== "sent") fail("notification delivery sent did not set sent status");
if (sentDeliveryResult.records.notificationEvent.deliveryStatus !== "sent") fail("notification event did not mirror sent outbox status");
if (sentDeliveryResult.records.receipt.kind !== "notification-delivery-sent") fail("notification delivery sent missing receipt kind");
if (sentDeliveryResult.records.delivery.receiptIds.length < 3) fail("notification delivery did not retain receipt trail");
if (sentDeliveryResult.records.delivery.deliveryHistory.length < 3) fail("notification delivery did not retain delivery history");

let rejectedSentRedispatch = false;
try {
  recordTools.transitionNotificationDeliveryRecords(sentDeliveryResult.data, {
    deliveryId: queuedDelivery.id,
    action: "dispatch",
    note: "Invalid redispatch after sent."
  }, {
    now: "2026-06-01T02:52:30.000Z"
  });
} catch {
  rejectedSentRedispatch = true;
}
if (!rejectedSentRedispatch) fail("notification delivery allowed redispatch after terminal sent state");

const failingDelivery = outboxResult.records.deliveries.find((item) => item.status === "queued" && item.id !== queuedDelivery.id);
if (!failingDelivery) fail("notification outbox did not create a second queued delivery for failure testing");
const failedDeliveryResult = recordTools.transitionNotificationDeliveryRecords(outboxResult.data, {
  deliveryId: failingDelivery.id,
  action: "fail",
  note: "Provider returned a transient delivery failure.",
  error: "provider-timeout"
}, {
  now: "2026-06-01T02:53:00.000Z"
});
if (failedDeliveryResult.records.delivery.status !== "failed") fail("notification delivery fail did not set failed status");
if (failedDeliveryResult.records.receipt.kind !== "notification-delivery-failed") fail("notification delivery fail missing receipt kind");
const retryDeliveryResult = recordTools.transitionNotificationDeliveryRecords(failedDeliveryResult.data, {
  deliveryId: failingDelivery.id,
  action: "retry",
  note: "Failure reviewed and ready for retry."
}, {
  now: "2026-06-01T02:54:00.000Z"
});
if (retryDeliveryResult.records.delivery.status !== "retry-ready") fail("notification delivery retry did not set retry-ready status");
if (recordTools.summarizeNotificationState(retryDeliveryResult.data).retryReady < 1) fail("notification summary missing retry-ready delivery count");
const outboxMonitorReport = recordTools.buildMonitorReport(retryDeliveryResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (outboxMonitorReport.summary.notificationOutbox < outboxResult.records.deliveries.length) fail("monitor summary missing notification outbox count");
if (outboxMonitorReport.summary.retryReadyNotifications < 1) fail("monitor summary missing retry-ready notification count");
if (!outboxMonitorReport.queue.some((item) => item.kind === "notification delivery")) fail("monitor queue missing notification delivery records");

const curriculumSummary = recordTools.summarizeCurriculumState(acceptResult.data);
if (curriculumSummary.frameworks < 2) fail("curriculum summary did not count seeded frameworks");
if (curriculumSummary.gameplans < 3) fail("curriculum summary did not count seeded package gameplans");
if (curriculumSummary.eikenLevelCount < 7) fail("curriculum summary did not count EIKEN 5-1 levels");
if (curriculumSummary.submissionFirstGameplans < 1) fail("curriculum summary did not detect submission-first gameplans");
if (curriculumSummary.under19GuardedGameplans < 1) fail("curriculum summary did not detect under-19 guarded gameplans");

const acceptedExternalStatus = acceptResult.data.customers[0].externalStatus;
const handoffResult = recordTools.createAgentHandoffRecords(acceptResult.data, {
  engagementId: acceptResult.records.engagement.id,
  sourceSystem: "SYMBIOSIS",
  targetSystem: "ANVIL",
  title: "Prepare CRM cleanup work plan",
  summary: "Agent proposes a scoped CRM cleanup plan for operator approval.",
  nextActionAt: "2026-06-06T20:00"
}, {
  now: "2026-06-01T03:05:00.000Z"
});

if (handoffResult.data.workPlans.length !== acceptResult.data.workPlans.length + 1) fail("agent handoff did not create a work plan");
if (handoffResult.data.agentHandoffs.length !== acceptResult.data.agentHandoffs.length + 1) fail("agent handoff did not create a handoff record");
if (handoffResult.data.followups.length !== acceptResult.data.followups.length + 1) fail("agent handoff did not create an approval follow-up");
if (handoffResult.data.receipts.length !== acceptResult.data.receipts.length + 1) fail("agent handoff did not create a receipt");
if (handoffResult.data.notificationEvents.length !== acceptResult.data.notificationEvents.length) fail("agent handoff should not create customer update events before approval");
if (handoffResult.data.customers[0].externalStatus !== acceptedExternalStatus) fail("agent handoff mutated customer-visible status before approval");
if (handoffResult.records.workPlan.status !== "proposed") fail("agent work plan should start proposed");
if (handoffResult.records.handoff.status !== "waiting") fail("agent handoff should wait for approval");
if (handoffResult.records.handoff.approvalStatus !== "pending-operator-approval") fail("agent handoff missing approval boundary");
if (handoffResult.records.handoff.customerVisible) fail("agent handoff should not be customer-visible before approval");
if (!handoffResult.records.receipt.note.includes("operator approval")) fail("agent handoff receipt does not record approval requirement");

const handoffSummary = recordTools.summarizeAgentHandoffState(handoffResult.data);
if (handoffSummary.workPlans < 1 || handoffSummary.handoffs < 1) fail("handoff summary did not count handoff records");
if (handoffSummary.pendingApprovals < 1) fail("handoff summary did not count pending approvals");
if (handoffSummary.customerVisibleBlocked !== 0) fail("handoff summary found customer-visible handoffs before approval");

let rejectedEarlyDispatch = false;
try {
  recordTools.transitionAgentHandoffRecords(handoffResult.data, {
    handoffId: handoffResult.records.handoff.id,
    action: "dispatch",
    note: "Invalid early dispatch attempt."
  }, {
    now: "2026-06-01T03:06:00.000Z"
  });
} catch {
  rejectedEarlyDispatch = true;
}
if (!rejectedEarlyDispatch) fail("agent handoff allowed dispatch before approval");

const routePlacementSummary = recordTools.summarizeRoutePlacementState(handoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (routePlacementSummary.schema !== "epoch.synapse-route-placement") fail("route placement summary has wrong schema");
if (routePlacementSummary.targetSystem !== "SYNAPSE") fail("route placement summary has wrong target system");
if (routePlacementSummary.duplicateUi) fail("route placement summary should not allow duplicated UI");
if (routePlacementSummary.summary.routeCount !== handoffResult.data.routePlacements.length) fail("route placement count does not match data");
if (!routePlacementSummary.routes.some((route) => route.href === "#monitor" && route.surface === "monitor")) fail("route placement summary missing monitor route");
if (!routePlacementSummary.routes.some((route) => route.href === "#public" && route.visibility === "public-intake")) fail("route placement summary missing public intake route");
if (!routePlacementSummary.routes.some((route) => route.summaryKey === "marketing" && route.routeKind === "marketing-readiness")) fail("route placement summary missing marketing readiness route");
if (!routePlacementSummary.routes.every((route) => route.targetSystem === "SYNAPSE")) fail("route placement routes missing SYNAPSE target");
if (routePlacementSummary.summary.pendingHandoffApprovals < 1) fail("route placement summary did not expose handoff approval pressure");
if (routePlacementSummary.summary.campaignRoutes !== data.campaignRoutes.length) fail("route placement summary missing campaign route count");

let rejectedDuplicateHandoff = false;
try {
  recordTools.createAgentHandoffRecords(handoffResult.data, {
    engagementId: acceptResult.records.engagement.id,
    title: "Duplicate handoff attempt"
  }, {
    now: "2026-06-01T03:06:00.000Z"
  });
} catch {
  rejectedDuplicateHandoff = true;
}
if (!rejectedDuplicateHandoff) fail("agent handoff allowed duplicate active handoff for one engagement");

const approvedHandoffResult = recordTools.transitionAgentHandoffRecords(handoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "approve",
  actor: "Jack",
  note: "Operator approved the ARA work plan for dispatch.",
  nextActionAt: "2026-06-06T21:00"
}, {
  now: "2026-06-01T03:07:00.000Z"
});
if (approvedHandoffResult.records.handoff.status !== "approved") fail("agent handoff approval did not set approved status");
if (approvedHandoffResult.records.workPlan.status !== "approved") fail("agent handoff approval did not update the work plan");
if (approvedHandoffResult.records.receipt.kind !== "agent-handoff-approved") fail("agent handoff approval missing receipt kind");
if (!approvedHandoffResult.records.handoff.transportHistory.some((item) => item.action === "approve")) fail("agent handoff approval missing transport history");
if (approvedHandoffResult.data.notificationEvents.length !== handoffResult.data.notificationEvents.length) fail("agent handoff approval created a customer update");
if (approvedHandoffResult.data.customers[0].externalStatus !== acceptedExternalStatus) fail("agent handoff approval changed customer-visible status");
const approvedMonitorReport = recordTools.buildMonitorReport(approvedHandoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (approvedMonitorReport.summary.approvedHandoffs < 1) fail("monitor summary missing approved handoff count");

const dispatchedHandoffResult = recordTools.transitionAgentHandoffRecords(approvedHandoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "dispatch",
  actor: "Jack",
  note: "Approved handoff released to ANVIL.",
  nextActionAt: "2026-06-06T22:00"
}, {
  now: "2026-06-01T03:08:00.000Z"
});
if (dispatchedHandoffResult.records.handoff.status !== "dispatched") fail("agent handoff dispatch did not set dispatched status");
if (!dispatchedHandoffResult.records.handoff.dispatchedAt) fail("agent handoff dispatch missing dispatchedAt");
if (dispatchedHandoffResult.records.receipt.kind !== "agent-handoff-dispatched") fail("agent handoff dispatch missing receipt kind");
const dispatchedMonitorReport = recordTools.buildMonitorReport(dispatchedHandoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (dispatchedMonitorReport.summary.dispatchedHandoffs < 1) fail("monitor summary missing dispatched handoff count");

let rejectedRepeatDispatch = false;
try {
  recordTools.transitionAgentHandoffRecords(dispatchedHandoffResult.data, {
    handoffId: handoffResult.records.handoff.id,
    action: "dispatch",
    note: "Invalid repeat dispatch attempt."
  }, {
    now: "2026-06-01T03:08:30.000Z"
  });
} catch {
  rejectedRepeatDispatch = true;
}
if (!rejectedRepeatDispatch) fail("agent handoff allowed repeat dispatch after dispatch");

const acknowledgedHandoffResult = recordTools.transitionAgentHandoffRecords(dispatchedHandoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "acknowledge",
  actor: "ANVIL",
  note: "ANVIL acknowledged the handoff package.",
  nextActionAt: "2026-06-07T09:00"
}, {
  now: "2026-06-01T03:09:00.000Z"
});
if (acknowledgedHandoffResult.records.handoff.status !== "acknowledged") fail("agent handoff acknowledgement did not set acknowledged status");
if (!acknowledgedHandoffResult.records.handoff.acknowledgedAt) fail("agent handoff acknowledgement missing acknowledgedAt");
if (acknowledgedHandoffResult.records.receipt.kind !== "agent-handoff-acknowledged") fail("agent handoff acknowledgement missing receipt kind");
const acknowledgedMonitorReport = recordTools.buildMonitorReport(acknowledgedHandoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (acknowledgedMonitorReport.summary.acknowledgedHandoffs < 1) fail("monitor summary missing acknowledged handoff count");

const progressedHandoffResult = recordTools.transitionAgentHandoffRecords(acknowledgedHandoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "progress",
  actor: "ANVIL",
  note: "ANVIL started the approved work.",
  nextActionAt: "2026-06-07T12:00"
}, {
  now: "2026-06-01T03:10:00.000Z"
});
if (progressedHandoffResult.records.handoff.status !== "in-progress") fail("agent handoff progress did not set in-progress status");
if (progressedHandoffResult.records.receipt.kind !== "agent-handoff-progress") fail("agent handoff progress missing receipt kind");
const progressedMonitorReport = recordTools.buildMonitorReport(progressedHandoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (progressedMonitorReport.summary.inProgressHandoffs < 1) fail("monitor summary missing in-progress handoff count");

const completedHandoffResult = recordTools.transitionAgentHandoffRecords(progressedHandoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "complete",
  actor: "Jack",
  note: "Operator accepted completion receipt internally.",
  customerVisibleApproved: "false",
  customerSummary: "Service work completed; operator-approved outcome is recorded."
}, {
  now: "2026-06-01T03:11:00.000Z"
});
if (completedHandoffResult.records.handoff.status !== "complete") fail("agent handoff completion did not set complete status");
if (completedHandoffResult.records.receipt.kind !== "agent-handoff-complete") fail("agent handoff completion missing receipt kind");
if (completedHandoffResult.records.notificationEvent) fail("internal handoff completion created a customer update");
if (completedHandoffResult.data.customers[0].externalStatus !== acceptedExternalStatus) fail("internal handoff completion changed customer-visible status");
if (completedHandoffResult.records.handoff.receiptIds.length < 5) fail("agent handoff did not retain receipt trail through lifecycle");
if (completedHandoffResult.records.handoff.transportHistory.length < 5) fail("agent handoff did not retain transport history through lifecycle");
const completedMonitorReport = recordTools.buildMonitorReport(completedHandoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (completedMonitorReport.summary.completedHandoffs < 1) fail("monitor summary missing completed handoff count");

let rejectedTerminalProgress = false;
try {
  recordTools.transitionAgentHandoffRecords(completedHandoffResult.data, {
    handoffId: handoffResult.records.handoff.id,
    action: "progress",
    note: "Invalid terminal progress attempt."
  }, {
    now: "2026-06-01T03:11:30.000Z"
  });
} catch {
  rejectedTerminalProgress = true;
}
if (!rejectedTerminalProgress) fail("agent handoff allowed non-rollback mutation after terminal completion");

const visibleCompleteResult = recordTools.transitionAgentHandoffRecords(progressedHandoffResult.data, {
  handoffId: handoffResult.records.handoff.id,
  action: "complete",
  actor: "Jack",
  note: "Operator approved the customer-safe completion notice.",
  customerVisibleApproved: "true",
  customerSummary: "CRM cleanup work is complete and ready for your review."
}, {
  now: "2026-06-01T03:12:00.000Z"
});
if (!visibleCompleteResult.records.notificationEvent) fail("operator-approved visible completion did not create a customer update");
if (!visibleCompleteResult.data.customers[0].externalStatus.includes("CRM cleanup work is complete")) fail("visible handoff completion did not update customer-safe status");
if (recordTools.summarizeAgentHandoffState(visibleCompleteResult.data).customerVisibleBlocked !== 0) fail("visible completed handoff should not be counted as blocked visibility");

let rejectedDuplicateAccept = false;
try {
  recordTools.decideOpportunityRecords(acceptResult.data, {
    opportunityId: intakeResult.records.opportunity.id,
    decision: "accept",
    planDueAt: "2026-06-07T18:00",
    decisionNote: "Duplicate acceptance attempt."
  }, {
    now: "2026-06-01T02:48:00.000Z"
  });
} catch {
  rejectedDuplicateAccept = true;
}
if (!rejectedDuplicateAccept) fail("accept flow allowed duplicate engagement for one opportunity");

const deferResult = recordTools.decideOpportunityRecords(intakeResult.data, {
  opportunityId: intakeResult.records.opportunity.id,
  decision: "defer",
  owner: "Jack",
  planDueAt: "2026-06-07T18:00",
  decisionNote: "Needs guardian agreement before acceptance."
}, {
  now: "2026-06-01T02:50:00.000Z"
});

if (deferResult.records.opportunity.status !== "deferred") fail("defer flow did not mark opportunity deferred");
if (deferResult.data.engagements.length !== intakeResult.data.engagements.length) fail("defer flow should not create an engagement");
if (deferResult.data.followups.length !== intakeResult.data.followups.length + 1) fail("defer flow did not create follow-up");
if (deferResult.records.receipt.kind !== "opportunity-deferred") fail("defer flow did not create deferred receipt");
if (!deferResult.data.customers[0].externalStatus.includes("deferred")) fail("defer flow did not update customer external status");
if (deferResult.data.notificationEvents.length !== intakeResult.data.notificationEvents.length + 1) fail("defer flow did not create update event");

const rejectResult = recordTools.decideOpportunityRecords(intakeResult.data, {
  opportunityId: intakeResult.records.opportunity.id,
  decision: "reject",
  owner: "Jack",
  planDueAt: "2026-06-07T18:00",
  decisionNote: "Not a fit for current service rules."
}, {
  now: "2026-06-01T02:55:00.000Z"
});

if (rejectResult.records.opportunity.status !== "rejected") fail("reject flow did not mark opportunity rejected");
if (rejectResult.data.engagements.length !== intakeResult.data.engagements.length) fail("reject flow should not create an engagement");
if (rejectResult.records.receipt.kind !== "opportunity-rejected") fail("reject flow did not create rejected receipt");
if (!rejectResult.data.customers[0].externalStatus.includes("closed")) fail("reject flow did not update customer external status");
if (rejectResult.data.notificationEvents.length !== intakeResult.data.notificationEvents.length + 1) fail("reject flow did not create update event");

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
if (scheduleResult.records.session.gameplanId !== intakeResult.records.assignment.gameplanId) fail("schedule flow did not preserve session gameplan identity");
if (!scheduleResult.data.customers[0].externalStatus.includes("scheduled")) fail("schedule flow did not update external status");
if (scheduleResult.data.notificationEvents.length !== intakeResult.data.notificationEvents.length + 1) fail("schedule flow did not create update event");

const deadlineSummary = recordTools.summarizeDeadlines(scheduleResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (deadlineSummary.upcoming < 1) fail("deadline summary did not detect upcoming work");
if (deadlineSummary.owned < 1) fail("deadline summary did not detect owner-linked work");

const rescheduleResult = recordTools.rescheduleScheduleRecords(scheduleResult.data, {
  sessionId: scheduleResult.records.session.id,
  startAt: "2026-06-05T20:30",
  endAt: "2026-06-05T21:15",
  deadlineAt: "2026-06-07T18:00",
  reason: "Student requested a later window."
}, {
  now: "2026-06-01T03:05:00.000Z"
});

if (rescheduleResult.records.session.startAt !== "2026-06-05T20:30:00+09:00") fail("reschedule flow did not update session start");
if (rescheduleResult.records.session.previousStartAt !== scheduleResult.records.session.startAt) fail("reschedule flow did not preserve previous start");
if (!Array.isArray(rescheduleResult.records.session.lifecycleHistory) || rescheduleResult.records.session.lifecycleHistory[0].action !== "rescheduled") {
  fail("reschedule flow did not record lifecycle history");
}
if (rescheduleResult.records.assignment.dueAt !== "2026-06-07T18:00:00+09:00") fail("reschedule flow did not update assignment deadline");
if (rescheduleResult.records.receipt.kind !== "schedule-rescheduled") fail("reschedule flow did not create rescheduled receipt");
if (!rescheduleResult.data.customers[0].externalStatus.includes("rescheduled")) fail("reschedule flow did not update customer-safe status");
if (rescheduleResult.data.notificationEvents.length !== scheduleResult.data.notificationEvents.length + 1) fail("reschedule flow did not create update event");

const cancelResult = recordTools.cancelScheduleRecords(rescheduleResult.data, {
  sessionId: rescheduleResult.records.session.id,
  nextActionAt: "2026-06-08T12:00",
  reason: "Replacement timing will be confirmed."
}, {
  now: "2026-06-01T03:06:00.000Z"
});

if (cancelResult.records.session.status !== "canceled") fail("cancel flow did not mark session canceled");
if (!cancelResult.records.session.canceledAt) fail("cancel flow did not record canceledAt");
if (cancelResult.data.sessions.length !== rescheduleResult.data.sessions.length) fail("cancel flow deleted historical session intent");
if (cancelResult.records.assignment.scheduleStatus !== "canceled") fail("cancel flow did not mark linked assignment schedule status");
if (cancelResult.records.receipt.kind !== "schedule-canceled") fail("cancel flow did not create canceled receipt");
if (!cancelResult.data.customers[0].externalStatus.includes("canceled")) fail("cancel flow did not update customer-safe status");
if (cancelResult.data.notificationEvents.length !== rescheduleResult.data.notificationEvents.length + 1) fail("cancel flow did not create update event");

const submissionResult = recordTools.createSubmissionRecords(cancelResult.data, {
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
if (submissionResult.records.submission.gameplanId !== intakeResult.records.assignment.gameplanId) fail("submission flow did not preserve gameplan identity");
if (submissionResult.records.review.status !== "reviewing") fail("review should enter reviewing status");
if (!submissionResult.data.customers[0].externalStatus.includes("review is in progress")) fail("submission flow did not update customer status");
if (submissionResult.data.notificationEvents.length !== cancelResult.data.notificationEvents.length + 1) fail("submission flow did not create update event");

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
if (returnResult.data.notificationEvents.length !== submissionResult.data.notificationEvents.length + 1) fail("return flow did not create update event");

const monitorReport = recordTools.buildMonitorReport(returnResult.data, { now: "2026-06-01T12:00:00+09:00" });
for (const section of ["summary", "queue", "timeline", "risks", "receipts"]) {
  if (!(section in monitorReport)) fail(`monitor report missing section ${section}`);
}
if (!monitorReport.revenue) fail("monitor report missing revenue state");
if (!monitorReport.curriculum) fail("monitor report missing curriculum state");
if (!monitorReport.notifications) fail("monitor report missing notification state");
if (!monitorReport.marketing) fail("monitor report missing marketing state");
if (!monitorReport.calendar) fail("monitor report missing calendar export state");
if (!monitorReport.persistence) fail("monitor report missing persistence state");
if (!monitorReport.scope) fail("monitor report missing scope state");
if (!monitorReport.memory) fail("monitor report missing memory state");
if (!monitorReport.access) fail("monitor report missing access state");
if (!Array.isArray(monitorReport.monitorHealthChecks)) fail("monitor report missing monitor health checks");
if (!Array.isArray(monitorReport.operatorActions)) fail("monitor report missing operator actions");
if (!monitorReport.routePlacement) fail("monitor report missing SYNAPSE route placement state");
if (!monitorReport.summary.persistenceRevision) fail("monitor summary missing persistence revision");
if (!monitorReport.summary.persistenceState) fail("monitor summary missing persistence adapter state");
if (monitorReport.summary.routePlacements < 1) fail("monitor summary missing route placement count");
if (monitorReport.summary.synapsePlacementMode !== "link-or-embed") fail("monitor summary missing SYNAPSE placement mode");
if (monitorReport.summary.curriculumFrameworks < 2) fail("monitor summary missing curriculum framework count");
if (monitorReport.summary.eikenLevelCount < 7) fail("monitor summary missing EIKEN level count");
if (monitorReport.summary.campaignRoutes !== data.campaignRoutes.length) fail("monitor summary campaign route count is wrong");
if (monitorReport.summary.readyCampaignRoutes < 3) fail("monitor summary missing ready campaign route count");
if (monitorReport.summary.copyComplianceViolations !== 0) fail("monitor summary should not report campaign copy violations");
if (monitorReport.summary.rescheduledScheduleEntries < 1) fail("monitor summary missing rescheduled schedule lifecycle count");
if (monitorReport.summary.canceledScheduleEntries < 1) fail("monitor summary missing canceled schedule lifecycle count");
if (!monitorReport.summary.dirtyLocalState) fail("monitor summary should flag dirty local state before export");
if (monitorReport.summary.awaitingReview < 1) fail("monitor summary missing awaiting-review count");
if (monitorReport.summary.staleMemoryNotes < 1) fail("monitor summary missing stale memory notes");
if (monitorReport.summary.safeAccessViolations !== 0) fail("monitor summary should not report safe-access violations for the seed slice");
if (monitorReport.summary.monitorHealthChecks < 2) fail("monitor summary missing monitor health checks");
if (monitorReport.summary.monitorActionReceipts < 2) fail("monitor summary missing monitor action receipts");
if (monitorReport.summary.operatorActions < 3) fail("monitor summary missing operator actions");
if (!monitorReport.timeline.some((item) => item.kind === "campaign route")) fail("monitor timeline missing campaign routes");
if (!monitorReport.timeline.some((item) => item.kind === "monitor check")) fail("monitor timeline missing monitor health checks");
if (monitorReport.summary.timeline < 1) fail("monitor report did not include timeline records");
if (!Array.isArray(monitorReport.queue)) fail("monitor report queue is not an array");
if (!Array.isArray(monitorReport.receipts) || monitorReport.receipts.length < 1) fail("monitor report receipts missing returned review receipt");
if (!monitorReport.risks.some((item) => item.id === "dirty-local-state")) fail("monitor risks missing dirty-local-state");
if (!monitorReport.risks.some((item) => item.id === "awaiting-review")) fail("monitor risks missing awaiting-review");
if (!monitorReport.risks.some((item) => item.id === "stale-memory")) fail("monitor risks missing stale-memory");

const calendarExport = recordTools.createCalendarExport(returnResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (calendarExport.schema !== "epoch.calendar-export") fail("calendar export has wrong schema");
if (calendarExport.timezone !== "Asia/Tokyo") fail("calendar export has wrong timezone");
if (!Array.isArray(calendarExport.entries) || calendarExport.entries.length < 5) fail("calendar export missing entries");
if (!calendarExport.entries.every((entry) => entry.sourceKind && entry.sourceId && entry.timeKind && entry.timezone && entry.localDate)) {
  fail("calendar export entries are missing normalized fields");
}
if (!calendarExport.entries.some((entry) => entry.sourceKind === "session" && entry.startAt && entry.endAt)) fail("calendar export missing session window");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "session" && entry.status === "canceled")) fail("calendar export missing canceled session state");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "session" && entry.lifecycleAction === "canceled")) fail("calendar export missing lifecycle action");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "session" && entry.previousStartAt)) fail("calendar export missing previous schedule state");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "assignment" && entry.dueAt)) fail("calendar export missing assignment due window");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "submission" && entry.timeKind === "review-window")) fail("calendar export missing submission review window");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "notification" && entry.updateEventId)) fail("calendar export missing update-linked notification window");
if (!calendarExport.entries.some((entry) => entry.sourceKind === "campaign-route" && entry.timeKind === "go-live-window")) fail("calendar export missing campaign go-live window");
const calendarSummary = recordTools.summarizeCalendarExport(calendarExport);
if (calendarSummary.total !== calendarExport.entries.length) fail("calendar summary total is wrong");
if (calendarSummary.customerVisible < 1) fail("calendar summary did not count customer-visible entries");
if (calendarSummary.updateLinked < 1) fail("calendar summary did not count update-linked entries");
if (calendarSummary.canceled < 1) fail("calendar summary did not count canceled lifecycle entries");

const outboxCalendarExport = recordTools.createCalendarExport(retryDeliveryResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (!outboxCalendarExport.entries.some((entry) => entry.sourceKind === "notification-delivery" && entry.timeKind === "delivery-window")) fail("calendar export missing notification delivery window");

const acceptedMonitorReport = recordTools.buildMonitorReport(acceptResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (acceptedMonitorReport.revenue.activeEngagements < 1) fail("monitor revenue did not count active engagement");
if (acceptedMonitorReport.summary.acceptedValueJpy < 60000) fail("monitor summary did not expose accepted value");

const handoffMonitorReport = recordTools.buildMonitorReport(handoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (!handoffMonitorReport.handoffs || handoffMonitorReport.handoffs.handoffs < 1) fail("monitor report missing handoff state");
if (handoffMonitorReport.summary.pendingHandoffApprovals < 1) fail("monitor summary missing pending handoff approvals");
if (!handoffMonitorReport.queue.some((item) => item.kind === "agent handoff")) fail("monitor queue missing agent handoff");
if (!handoffMonitorReport.timeline.some((item) => item.kind === "gameplan")) fail("monitor timeline missing package gameplans");

const handoffCalendarExport = recordTools.createCalendarExport(handoffResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (!handoffCalendarExport.entries.some((entry) => entry.sourceKind === "agent-work-plan" && !entry.externalVisible)) fail("calendar export missing internal agent work plan window");
if (!handoffCalendarExport.entries.some((entry) => entry.sourceKind === "agent-handoff" && entry.timeKind === "handoff-approval-window")) fail("calendar export missing agent handoff approval window");

const exportedLedger = recordTools.createOperatingLedger(returnResult.data, { now: "2026-06-01T04:30:00.000Z" });
if (exportedLedger.schema !== "epoch.operating-ledger") fail("ledger export has wrong schema");
if (exportedLedger.version !== recordTools.ledgerVersion) fail("ledger export has wrong version");
if (!exportedLedger.persistence) fail("ledger export missing persistence metadata");
if (exportedLedger.persistence.schema !== "epoch.ledger-persistence") fail("ledger persistence metadata has wrong schema");
if (exportedLedger.persistence.adapter !== "browser-local-durable-ready") fail("ledger persistence metadata has wrong adapter");
if (!exportedLedger.persistence.ledgerId) fail("ledger persistence metadata missing ledger id");
if (exportedLedger.persistence.revision !== 1) fail("first ledger snapshot should be revision 1");
if (exportedLedger.persistence.parentRevision !== null) fail("first ledger snapshot should not have a parent revision");
if (exportedLedger.persistence.adapterState !== "durable-ready-snapshot") fail("ledger persistence metadata has wrong adapter state");
if (!exportedLedger.persistence.libraryReady) fail("ledger persistence metadata should be LIBRARY-ready");
if (!exportedLedger.persistence.checksum.startsWith("fnv1a32-")) fail("ledger persistence metadata has wrong checksum format");
if (exportedLedger.data.persistence.checksum !== exportedLedger.persistence.checksum) fail("ledger data did not preserve persistence checksum");
if (exportedLedger.counts.receipts !== returnResult.data.receipts.length) fail("ledger export receipt count is wrong");
if (exportedLedger.counts.monitorHealthChecks !== returnResult.data.monitorHealthChecks.length) fail("ledger export monitor health check count is wrong");
if (exportedLedger.counts.notificationEvents !== returnResult.data.notificationEvents.length) fail("ledger export update-event count is wrong");
if (!exportedLedger.monitor || exportedLedger.monitor.timeline < 1) fail("ledger export missing monitor summary");
if (exportedLedger.monitor.persistenceRevision !== exportedLedger.persistence.revision) fail("ledger monitor summary missing persistence revision");
if (!exportedLedger.calendarExport || exportedLedger.calendarExport.entries.length !== calendarExport.entries.length) fail("ledger export missing calendar export entries");
if (!exportedLedger.routePlacement || exportedLedger.routePlacement.summary.routeCount !== exportedLedger.data.routePlacements.length) fail("ledger export missing route placement summary");
if (exportedLedger.counts.routePlacements !== returnResult.data.routePlacements.length) fail("ledger export route placement count is wrong");
if (exportedLedger.counts.curriculumFrameworks !== returnResult.data.curriculumFrameworks.length) fail("ledger export curriculum framework count is wrong");
if (exportedLedger.counts.packageGameplans !== returnResult.data.packageGameplans.length) fail("ledger export package gameplan count is wrong");
if (exportedLedger.counts.campaignRoutes !== returnResult.data.campaignRoutes.length) fail("ledger export campaign route count is wrong");
if (exportedLedger.monitor.campaignRoutes !== returnResult.data.campaignRoutes.length) fail("ledger monitor summary missing campaign routes");
if (exportedLedger.monitor.monitorHealthChecks !== returnResult.data.monitorHealthChecks.length) fail("ledger monitor summary missing monitor health checks");

const persistenceSummary = recordTools.summarizePersistenceState(exportedLedger.data);
if (persistenceSummary.ledgerId !== exportedLedger.persistence.ledgerId) fail("persistence summary did not preserve ledger id");
if (persistenceSummary.revision !== exportedLedger.persistence.revision) fail("persistence summary did not preserve revision");

const engagementLedger = recordTools.createOperatingLedger(acceptResult.data, { now: "2026-06-01T04:35:00.000Z" });
if (engagementLedger.counts.engagements !== acceptResult.data.engagements.length) fail("ledger export engagement count is wrong");

const handoffLedger = recordTools.createOperatingLedger(handoffResult.data, { now: "2026-06-01T04:40:00.000Z" });
if (handoffLedger.counts.workPlans !== handoffResult.data.workPlans.length) fail("ledger export work-plan count is wrong");
if (handoffLedger.counts.agentHandoffs !== handoffResult.data.agentHandoffs.length) fail("ledger export handoff count is wrong");
if (handoffLedger.monitor.pendingHandoffApprovals < 1) fail("ledger monitor summary missing handoff approvals");

const lifecycleHandoffLedger = recordTools.createOperatingLedger(completedHandoffResult.data, { now: "2026-06-01T04:42:00.000Z" });
if (lifecycleHandoffLedger.monitor.completedHandoffs < 1) fail("ledger monitor summary missing completed handoff lifecycle count");
if (lifecycleHandoffLedger.counts.receipts !== completedHandoffResult.data.receipts.length) fail("ledger export did not preserve handoff lifecycle receipts");

const outboxLedger = recordTools.createOperatingLedger(retryDeliveryResult.data, { now: "2026-06-01T04:43:00.000Z" });
if (outboxLedger.counts.notificationDeliveries !== retryDeliveryResult.data.notificationDeliveries.length) fail("ledger export notification delivery count is wrong");
if (outboxLedger.monitor.notificationOutbox !== retryDeliveryResult.data.notificationDeliveries.length) fail("ledger monitor summary missing notification outbox count");
if (outboxLedger.monitor.retryReadyNotifications < 1) fail("ledger monitor summary missing retry-ready notifications");

const importedLedger = recordTools.importOperatingLedger(data, JSON.stringify(exportedLedger));
if (importedLedger.data.receipts.length !== returnResult.data.receipts.length) fail("ledger import did not preserve receipts");
if (importedLedger.data.monitorHealthChecks.length !== returnResult.data.monitorHealthChecks.length) fail("ledger import did not preserve monitor health checks");
if (importedLedger.data.notificationEvents.length !== returnResult.data.notificationEvents.length) fail("ledger import did not preserve update events");
if (importedLedger.data.routePlacements.length !== returnResult.data.routePlacements.length) fail("ledger import did not preserve route placements");
if (importedLedger.data.campaignRoutes.length !== returnResult.data.campaignRoutes.length) fail("ledger import did not preserve campaign routes");
if (importedLedger.data.customers[0].externalStatus !== returnResult.data.customers[0].externalStatus) fail("ledger import did not preserve external status");
if (importedLedger.data.persistence.checksum !== exportedLedger.persistence.checksum) fail("ledger import did not preserve persistence checksum");
if (importedLedger.ledger.persistence.revision !== exportedLedger.persistence.revision) fail("ledger import did not preserve persistence revision");

const recoveryLedger = recordTools.createOperatingLedger(importedLedger.data, {
  now: "2026-06-01T04:45:00.000Z",
  adapterState: "imported-recovery-snapshot",
  recoveryNote: "Imported ledger JSON and wrote a browser-local recovery snapshot."
});
if (recoveryLedger.persistence.revision !== exportedLedger.persistence.revision + 1) fail("recovery snapshot did not advance revision");
if (recoveryLedger.persistence.parentRevision !== exportedLedger.persistence.revision) fail("recovery snapshot did not retain parent revision");
if (recoveryLedger.persistence.ledgerId !== exportedLedger.persistence.ledgerId) fail("recovery snapshot did not preserve ledger id");
if (recoveryLedger.persistence.adapterState !== "imported-recovery-snapshot") fail("recovery snapshot did not record adapter state");

const importedEngagementLedger = recordTools.importOperatingLedger(data, JSON.stringify(engagementLedger));
if (importedEngagementLedger.data.engagements.length !== acceptResult.data.engagements.length) fail("ledger import did not preserve engagements");

const importedHandoffLedger = recordTools.importOperatingLedger(data, JSON.stringify(handoffLedger));
if (importedHandoffLedger.data.workPlans.length !== handoffResult.data.workPlans.length) fail("ledger import did not preserve work plans");
if (importedHandoffLedger.data.agentHandoffs.length !== handoffResult.data.agentHandoffs.length) fail("ledger import did not preserve agent handoffs");
if (importedHandoffLedger.data.customers[0].externalStatus !== acceptedExternalStatus) fail("ledger import changed customer-visible state for handoff records");

const importedLifecycleHandoffLedger = recordTools.importOperatingLedger(data, JSON.stringify(lifecycleHandoffLedger));
if (importedLifecycleHandoffLedger.data.agentHandoffs[0].status !== "complete") fail("ledger import did not preserve completed handoff status");
if (importedLifecycleHandoffLedger.data.agentHandoffs[0].receiptIds.length < 5) fail("ledger import did not preserve handoff lifecycle receipt ids");
if (importedLifecycleHandoffLedger.data.agentHandoffs[0].transportHistory.length < 5) fail("ledger import did not preserve handoff transport history");

const importedOutboxLedger = recordTools.importOperatingLedger(data, JSON.stringify(outboxLedger));
if (importedOutboxLedger.data.notificationDeliveries.length !== retryDeliveryResult.data.notificationDeliveries.length) fail("ledger import did not preserve notification deliveries");
if (!importedOutboxLedger.data.notificationDeliveries.some((item) => item.status === "retry-ready")) fail("ledger import did not preserve retry-ready delivery status");
if (!importedOutboxLedger.data.notificationDeliveries.some((item) => Array.isArray(item.deliveryHistory) && item.deliveryHistory.length >= 2)) fail("ledger import did not preserve notification delivery history");

let rejectedInvalidLedger = false;
try {
  recordTools.importOperatingLedger(data, JSON.stringify({ data: { statuses: "bad", receipts: [] } }));
} catch {
  rejectedInvalidLedger = true;
}
if (!rejectedInvalidLedger) fail("ledger import accepted an invalid statuses field");

const invalidPersistenceLedger = JSON.parse(JSON.stringify(exportedLedger));
invalidPersistenceLedger.persistence.schema = "invalid.schema";
invalidPersistenceLedger.data.persistence = invalidPersistenceLedger.persistence;
let rejectedInvalidPersistence = false;
try {
  recordTools.importOperatingLedger(data, JSON.stringify(invalidPersistenceLedger));
} catch {
  rejectedInvalidPersistence = true;
}
if (!rejectedInvalidPersistence) fail("ledger import accepted invalid persistence metadata");

const tamperedLedger = JSON.parse(JSON.stringify(exportedLedger));
tamperedLedger.data.receipts = [];
let rejectedTamperedLedger = false;
try {
  recordTools.importOperatingLedger(data, JSON.stringify(tamperedLedger));
} catch {
  rejectedTamperedLedger = true;
}
if (!rejectedTamperedLedger) fail("ledger import accepted data with stale persistence checksum");

console.log("commercial slice verification passed");
