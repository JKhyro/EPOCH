import fs from "node:fs";
import vm from "node:vm";

const requiredStatuses = [
  "planned",
  "waiting",
  "proposed",
  "draft",
  "presented",
  "available",
  "unavailable",
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
  "snoozed",
  "retry-ready",
  "payment-ready",
  "payment-blocked",
  "paid-recorded",
  "declined",
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
  "marketingConversionEvents",
  "providerAdapterCandidates",
  "marketingAnalyticsAdapterPrototypes",
  "calendarAdapterPrototypes",
  "notificationProviderPrototypes",
  "paymentProviderPrototypes",
  "authProviderPrototypes",
  "leads",
  "opportunities",
  "routePlacements",
  "accessGateways",
  "librarySyncHandoffs",
  "calendarProviderHandoffs",
  "notificationProviderHandoffs",
  "paymentProviderHandoffs",
  "authSessionRoleHandoffs",
  "customerAccountHistories",
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
if (!Array.isArray(data.quotes)) fail("seed data missing quotes collection");
if (!Array.isArray(data.reminderRules)) fail("seed data missing reminderRules collection");
if (!Array.isArray(data.recurrenceCandidates)) fail("seed data missing recurrenceCandidates collection");
if (!Array.isArray(data.availabilityWindows)) fail("seed data missing availabilityWindows collection");
if (!Array.isArray(data.accessGateways)) fail("seed data missing accessGateways collection");
if (!Array.isArray(data.librarySyncHandoffs)) fail("seed data missing librarySyncHandoffs collection");
if (!Array.isArray(data.calendarProviderHandoffs)) fail("seed data missing calendarProviderHandoffs collection");
if (!Array.isArray(data.notificationProviderHandoffs)) fail("seed data missing notificationProviderHandoffs collection");
if (!Array.isArray(data.paymentProviderHandoffs)) fail("seed data missing paymentProviderHandoffs collection");
if (!Array.isArray(data.authSessionRoleHandoffs)) fail("seed data missing authSessionRoleHandoffs collection");
if (!Array.isArray(data.marketingAnalyticsAdapterPrototypes)) fail("seed data missing marketingAnalyticsAdapterPrototypes collection");
if (!Array.isArray(data.calendarAdapterPrototypes)) fail("seed data missing calendarAdapterPrototypes collection");
if (!Array.isArray(data.paymentProviderPrototypes)) fail("seed data missing paymentProviderPrototypes collection");
if (!Array.isArray(data.authProviderPrototypes)) fail("seed data missing authProviderPrototypes collection");
if (!Array.isArray(data.customerAccountHistories)) fail("seed data missing customerAccountHistories collection");

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
  "customer-account-history",
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
  "notification-outbox-confirmation",
  "quote-payment-form",
  "quote-select",
  "quote-opportunity",
  "quote-action",
  "quote-payment-apply",
  "quote-payment-confirmation",
  "reminder-control-form",
  "reminder-control-kind",
  "reminder-control-action",
  "reminder-rule-select",
  "recurrence-candidate-select",
  "availability-window-select",
  "reminder-source",
  "reminder-control-apply",
  "reminder-control-confirmation",
  "access-gateway-form",
  "access-gateway-select",
  "access-gateway-action",
  "access-gateway-apply",
  "access-gateway-confirmation",
  "library-sync-form",
  "library-sync-select",
  "library-sync-action",
  "library-sync-apply",
  "library-sync-confirmation",
  "calendar-provider-form",
  "calendar-provider-select",
  "calendar-provider-action",
  "calendar-provider-apply",
  "calendar-provider-confirmation",
  "notification-provider-form",
  "notification-provider-select",
  "notification-provider-action",
  "notification-provider-apply",
  "notification-provider-confirmation",
  "payment-provider-form",
  "payment-provider-select",
  "payment-provider-action",
  "payment-provider-apply",
  "payment-provider-confirmation",
  "auth-session-role-form",
  "auth-session-role-select",
  "auth-session-role-action",
  "auth-session-role-apply",
  "auth-session-role-confirmation",
  "marketing-conversion-form",
  "marketing-conversion-select",
  "marketing-conversion-action",
  "marketing-conversion-apply",
  "marketing-conversion-confirmation",
  "provider-adapter-form",
  "provider-adapter-select",
  "provider-adapter-action",
  "provider-adapter-apply",
  "provider-adapter-confirmation",
  "calendar-adapter-form",
  "calendar-adapter-select",
  "calendar-adapter-action",
  "calendar-adapter-apply",
  "calendar-adapter-confirmation",
  "notification-prototype-form",
  "notification-prototype-select",
  "notification-prototype-action",
  "notification-prototype-apply",
  "notification-prototype-confirmation",
  "payment-prototype-form",
  "payment-prototype-select",
  "payment-prototype-action",
  "payment-prototype-apply",
  "payment-prototype-confirmation",
  "auth-prototype-form",
  "auth-prototype-select",
  "auth-prototype-action",
  "auth-prototype-apply",
  "auth-prototype-confirmation"
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
for (const field of ["quoteId", "opportunityId", "action", "amountJpy", "nextActionAt", "guardianConsentRecorded", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`quote payment form missing field ${field}`);
}
for (const field of ["controlKind", "action", "reminderId", "recurrenceId", "availabilityId", "sourceId", "startAt", "endAt", "cadence", "capacity", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`reminder control form missing field ${field}`);
}
for (const field of ["gatewayId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`access gateway form missing field ${field}`);
}
for (const field of ["handoffId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`LIBRARY sync form missing field ${field}`);
}
for (const field of ["handoffId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`notification provider form missing field ${field}`);
}
for (const field of ["prototypeId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`sandbox notification provider form missing field ${field}`);
}
for (const field of ["prototypeId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`sandbox payment provider form missing field ${field}`);
}
for (const field of ["prototypeId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`sandbox auth provider form missing field ${field}`);
}
for (const field of ["prototypeId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`sandbox marketing analytics adapter form missing field ${field}`);
}
for (const field of ["handoffId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`payment provider form missing field ${field}`);
}
for (const field of ["handoffId", "action", "note"]) {
  if (!html.includes(`name="${field}"`)) fail(`auth/session role form missing field ${field}`);
}
for (const field of ["assignmentId", "reviewDueAt", "submissionTitle", "submissionSummary"]) {
  if (!html.includes(`name="${field}"`)) fail(`submission form missing field ${field}`);
}
for (const phrase of ["data-monitor-target", "href=\"#monitor\"", "Direct route", "monitor-command-strip", "monitor-calendar", "monitor-handoffs", "monitor-suite", "monitor-library-sync", "monitor-calendar-provider", "monitor-notification-provider", "monitor-notification-prototype", "monitor-payment-provider", "monitor-payment-prototype", "monitor-auth-prototype", "monitor-marketing-analytics-prototype", "monitor-auth-session", "monitor-persistence", "monitor-scope", "monitor-memory", "monitor-access"]) {
  if (!html.includes(phrase)) fail(`monitor route surface missing phrase ${phrase}`);
}
for (const phrase of ["monitor-curriculum", "Package Gameplans", "Personalized Gameplan", "Curriculum Frameworks"]) {
  if (!html.includes(phrase)) fail(`curriculum/gameplan HTML missing phrase ${phrase}`);
}
for (const phrase of ["Controlled gateway", "Access Gateways", "Apply Access Gateway Action"]) {
  if (!html.includes(phrase)) fail(`access gateway HTML missing phrase ${phrase}`);
}
for (const phrase of ["LIBRARY handoff", "LIBRARY Sync", "Apply LIBRARY Sync Action"]) {
  if (!html.includes(phrase)) fail(`LIBRARY sync HTML missing phrase ${phrase}`);
}
for (const phrase of ["Calendar handoff", "Calendar Providers", "Apply Calendar Provider Action"]) {
  if (!html.includes(phrase)) fail(`calendar provider HTML missing phrase ${phrase}`);
}
for (const phrase of ["Notification Providers", "Notification Provider Handoffs", "Apply Notification Provider Action"]) {
  if (!html.includes(phrase)) fail(`notification provider HTML missing phrase ${phrase}`);
}
for (const phrase of ["Payment Providers", "Payment Provider Handoffs", "Apply Payment Provider Action"]) {
  if (!html.includes(phrase)) fail(`payment provider HTML missing phrase ${phrase}`);
}
for (const phrase of ["Sandbox Payment Provider", "Apply Sandbox Payment Provider Action", "monitor-payment-prototype", "live checkout, invoice sending, capture, refunds, OAuth, secrets, webhooks, provider writes, and customer-visible payment requests remain disabled"]) {
  if (!html.includes(phrase)) fail(`sandbox payment provider HTML missing phrase ${phrase}`);
}
for (const phrase of ["Sandbox Auth Provider", "Apply Sandbox Auth Provider Action", "monitor-auth-prototype", "production login, OAuth, secrets, credentials, token storage, refresh-token storage, webhooks, provider writes, external sessions, customer-visible auth behavior, and raw admin/monitor exposure remain disabled"]) {
  if (!html.includes(phrase)) fail(`sandbox auth provider HTML missing phrase ${phrase}`);
}
for (const phrase of ["Auth Sessions", "Auth Session Role Handoffs", "Apply Auth Session Role Action"]) {
  if (!html.includes(phrase)) fail(`auth/session role HTML missing phrase ${phrase}`);
}
for (const phrase of ["Marketing Conversion KPIs", "Apply Marketing Conversion KPI Action", "monitor-marketing-conversions", "live pixels, ad API writes, credentials, webhooks, and invasive tracking remain deferred"]) {
  if (!html.includes(phrase)) fail(`marketing conversion HTML missing phrase ${phrase}`);
}
for (const phrase of ["Provider Adapter Go/No-Go", "Apply Provider Adapter Go/No-Go Action", "monitor-provider-adapters", "live API calls, secrets, OAuth clients, webhooks, provider writes, and production behavior remain disabled"]) {
  if (!html.includes(phrase)) fail(`provider adapter HTML missing phrase ${phrase}`);
}
for (const phrase of ["Sandbox Marketing Analytics Adapter", "Apply Sandbox Marketing Analytics Adapter Action", "monitor-marketing-analytics-prototype", "live pixels, ad API writes, analytics credentials, webhooks, provider writes, invasive tracking, personal-data storage, cross-site identifiers, third-party cookies, fingerprinting, cross-device identity, customer-visible analytics, and under-19 paid action before consent remain disabled"]) {
  if (!html.includes(phrase)) fail(`sandbox marketing analytics adapter HTML missing phrase ${phrase}`);
}
for (const phrase of ["Sandbox Calendar Adapter", "Apply Sandbox Calendar Adapter Action", "monitor-calendar-adapter", "live calendar API calls, OAuth, secrets, webhooks, provider writes, and invitations remain disabled"]) {
  if (!html.includes(phrase)) fail(`sandbox calendar adapter HTML missing phrase ${phrase}`);
}
for (const phrase of ["Sandbox Notification Provider", "Apply Sandbox Notification Provider Action", "monitor-notification-prototype", "live email, LINE, SMS, NEXUS, OAuth, secrets, webhooks, provider writes, and customer-visible sends remain disabled"]) {
  if (!html.includes(phrase)) fail(`sandbox notification provider HTML missing phrase ${phrase}`);
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
  "summarizeMarketingConversionState",
  "summarizeProviderAdapterSelectionState",
  "summarizeMarketingAnalyticsAdapterPrototypeState",
  "summarizeCalendarAdapterPrototypeState",
  "summarizeAuthProviderPrototypeState",
  "summarizeCustomerAccountHistoryState",
  "summarizeCurriculumState",
  "Curriculum Readiness",
  "Campaign Readiness",
  "Conversion KPIs",
  "Provider Adapters",
  "Sandbox Analytics Prototype",
  "Sandbox Calendar Adapter",
  "Sandbox Auth Provider",
  "Customer Account History",
  "monitor-campaigns",
  "monitor-marketing-conversions",
  "monitor-provider-adapters",
  "monitor-marketing-analytics-prototype",
  "monitor-calendar-adapter",
  "monitor-auth-prototype",
  "monitor-account-history",
  "campaign route",
  "marketing conversion",
  "provider adapter",
  "marketing analytics prototype",
  "calendar adapter",
  "auth prototype",
  "account history",
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
  "renderCustomerAccountHistory",
  "monitorSection",
  "monitor-summary",
  "monitor-scope",
  "monitor-memory",
  "monitor-queue",
  "monitor-timeline",
  "monitor-handoffs",
  "monitor-suite",
  "monitor-notification-outbox",
  "monitor-quotes",
  "monitor-reminders",
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
  "createQuoteEstimateRecords",
  "transitionQuoteEstimateRecords",
  "createReminderRuleRecords",
  "transitionReminderRuleRecords",
  "createRecurrenceCandidateRecords",
  "transitionRecurrenceCandidateRecords",
  "createAvailabilityWindowRecords",
  "transitionAvailabilityWindowRecords",
  "transitionAccessGatewayRecords",
  "transitionLibrarySyncHandoffRecords",
  "transitionCalendarProviderHandoffRecords",
  "transitionNotificationProviderHandoffRecords",
  "transitionPaymentProviderHandoffRecords",
  "transitionAuthSessionRoleHandoffRecords",
  "transitionMarketingConversionEventRecords",
  "transitionProviderAdapterCandidateRecords",
  "transitionCalendarAdapterPrototypeRecords",
  "transitionAuthProviderPrototypeRecords",
  "summarizeLibrarySyncState",
  "summarizeCalendarProviderState",
  "summarizeNotificationProviderState",
  "summarizePaymentProviderState",
  "summarizeAuthSessionRoleState",
  "summarizeMarketingConversionState",
  "summarizeProviderAdapterSelectionState",
  "summarizeCalendarAdapterPrototypeState",
  "summarizeAuthProviderPrototypeState",
  "summarizeCustomerAccountHistoryState",
  "summarizeAccessGatewayState",
  "renderAccessGatewayOptions",
  "renderLibrarySyncOptions",
  "renderCalendarProviderOptions",
  "wireAccessGatewayForm",
  "wireLibrarySyncForm",
  "wireCalendarProviderForm",
  "Access Gateway",
  "Access Gateway Records",
  "Access Gateway Updated",
  "LIBRARY Sync",
  "LIBRARY Sync Handoffs",
  "LIBRARY Sync Updated",
  "Calendar Providers",
  "Calendar Provider Handoffs",
  "Calendar Provider Updated",
  "Notification Providers",
  "Notification Provider Handoffs",
  "Notification Provider Updated",
  "Payment Providers",
  "Payment Provider Handoffs",
  "Payment Provider Updated",
  "Auth / Session Roles",
  "Auth Session Role Handoffs",
  "Auth Session Role Updated",
  "Marketing Conversion KPIs",
  "Marketing Conversion KPI Updated",
  "Provider Adapter Go/No-Go",
  "Provider Adapter Go/No-Go Updated",
  "Sandbox Calendar Adapter Updated",
  "Sandbox Auth Provider Updated",
  "Customer Account History",
  "renderAgentHandoffOptions",
  "renderNotificationDeliveryOptions",
  "renderNotificationProviderOptions",
  "renderPaymentProviderOptions",
  "renderAuthSessionRoleOptions",
  "renderMarketingConversionOptions",
  "renderProviderAdapterOptions",
  "renderCalendarAdapterOptions",
  "renderAuthPrototypeOptions",
  "renderQuoteOptions",
  "renderReminderControlOptions",
  "wireAgentHandoffForm",
  "wireNotificationOutboxForm",
  "wireNotificationProviderForm",
  "wirePaymentProviderForm",
  "wireAuthSessionRoleForm",
  "wireMarketingConversionForm",
  "wireProviderAdapterForm",
  "wireCalendarAdapterForm",
  "wireAuthPrototypeForm",
  "wireQuotePaymentForm",
  "wireReminderControlForm",
  "Opportunity Pipeline",
  "Engagement Revenue",
  "Update Events",
  "Agent Handoffs",
  "ARA Handoff Updated",
  "agent-handoff-transition",
  "Notification Outbox",
  "Outbox Queued",
  "Delivery Updated",
  "Quote Readiness",
  "Quote Created",
  "Quote Updated",
  "Reminder Control",
  "Schedule Control Updated",
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
  "quote-console",
  "reminder-console",
  "access-gateway-console",
  "library-sync-console",
  "calendar-provider-console",
  "notification-provider-console",
  "payment-provider-console",
  "auth-session-role-console",
  "marketing-conversion-console",
  "provider-adapter-console",
  "calendar-adapter-console",
  "notification-prototype-console",
  "payment-prototype-console",
  "auth-prototype-console",
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
if (!Array.isArray(data.accessGateways) || data.accessGateways.length < 4) fail("seed data missing controlled access gateway records");
if (!Array.isArray(data.librarySyncHandoffs) || data.librarySyncHandoffs.length < 2) fail("seed data missing LIBRARY sync handoff records");
if (!Array.isArray(data.calendarProviderHandoffs) || data.calendarProviderHandoffs.length < 3) fail("seed data missing calendar provider handoff records");
if (!Array.isArray(data.notificationProviderHandoffs) || data.notificationProviderHandoffs.length < 3) fail("seed data missing notification provider handoff records");
if (!Array.isArray(data.paymentProviderHandoffs) || data.paymentProviderHandoffs.length < 3) fail("seed data missing payment provider handoff records");
if (!Array.isArray(data.authSessionRoleHandoffs) || data.authSessionRoleHandoffs.length < 4) fail("seed data missing auth/session role handoff records");
if (!Array.isArray(data.monitorHealthChecks) || data.monitorHealthChecks.length < 2) fail("seed data missing ledger-backed monitor health checks");
if (!data.receipts.some((item) => item.kind === "monitor-check")) fail("seed data missing monitor-check receipt");
if (!data.receipts.some((item) => item.kind === "library-sync-handoff")) fail("seed data missing LIBRARY sync handoff receipt");
if (!data.receipts.some((item) => item.kind === "calendar-provider-handoff")) fail("seed data missing calendar provider handoff receipt");
if (!data.receipts.some((item) => item.kind === "notification-provider-handoff")) fail("seed data missing notification provider handoff receipt");
if (!data.receipts.some((item) => item.kind === "payment-provider-handoff")) fail("seed data missing payment provider handoff receipt");
if (!data.receipts.some((item) => item.kind === "auth-session-role-handoff")) fail("seed data missing auth/session role handoff receipt");
if (data.accessPosture.defaultPublicPolicy !== "deny-by-default") fail("access posture must default to deny-by-default");
if (data.accessPosture.rawMonitor !== "local-only") fail("access posture must keep raw monitor local-only");
if (data.accessPosture.safeGateway !== "controlled-public-customer-gateway") fail("access posture must name the controlled public/customer gateway");
if (!data.accessGateways.some((item) => item.surface === "public" && item.publicExposure === "controlled-public")) fail("access gateways missing controlled public intake");
if (!data.accessGateways.some((item) => item.surface === "student" && item.publicExposure === "controlled-customer")) fail("access gateways missing controlled customer status");
if (!data.accessGateways.some((item) => item.surface === "admin" && item.publicExposure === "denied")) fail("access gateways missing raw admin denial");
if (!data.accessGateways.some((item) => item.surface === "monitor" && item.publicExposure === "denied")) fail("access gateways missing raw monitor denial");
if (!data.librarySyncHandoffs.some((item) => item.targetSystem === "LIBRARY" && item.syncMode === "ledger-snapshot")) fail("LIBRARY sync handoffs missing EPOCH-to-LIBRARY ledger snapshot");
if (!data.librarySyncHandoffs.some((item) => item.sourceSystem === "LIBRARY" && item.syncMode === "recovery-import")) fail("LIBRARY sync handoffs missing recovery import route");
if (!data.librarySyncHandoffs.every((item) => item.visibility === "internal" && item.customerVisible === false)) fail("LIBRARY sync handoffs must be internal-only");
if (!data.calendarProviderHandoffs.some((item) => item.providerKind === "google" && item.targetProvider.includes("Google"))) fail("calendar provider handoffs missing Google readiness");
if (!data.calendarProviderHandoffs.some((item) => item.providerKind === "microsoft" && item.targetProvider.includes("Microsoft"))) fail("calendar provider handoffs missing Microsoft readiness");
if (!data.calendarProviderHandoffs.some((item) => item.syncMode === "invitation-readiness" && item.readinessChecks.includes("no-provider-send"))) fail("calendar provider handoffs missing no-send invitation readiness");
if (!data.calendarProviderHandoffs.every((item) => item.visibility === "internal" && item.customerVisible === false && item.liveSyncEnabled === false && item.sendsInvitations === false && item.externalProviderWrite === false)) {
  fail("calendar provider handoffs must be internal-only and no-live-send");
}
if (!data.notificationProviderHandoffs.some((item) => item.providerKind === "email" && item.targetProvider.includes("email"))) fail("notification provider handoffs missing email readiness");
if (!data.notificationProviderHandoffs.some((item) => item.providerKind === "line-sms" && item.targetProvider.includes("LINE"))) fail("notification provider handoffs missing LINE/SMS readiness");
if (!data.notificationProviderHandoffs.some((item) => item.syncMode === "template-consent-readiness" && item.readinessChecks.includes("consent-policy-defined") && item.readinessChecks.includes("no-live-send"))) fail("notification provider handoffs missing template/consent no-send readiness");
if (!data.notificationProviderHandoffs.every((item) => item.visibility === "internal" && item.customerVisible === false && item.liveSendEnabled === false && item.externalProviderWrite === false && item.storesCredentials === false && item.webhookEnabled === false)) {
  fail("notification provider handoffs must be internal-only with no live send, credentials, webhooks, or provider writes");
}
if (!data.paymentProviderHandoffs.some((item) => item.providerKind === "invoice" && item.targetProvider.includes("invoice"))) fail("payment provider handoffs missing invoice readiness");
if (!data.paymentProviderHandoffs.some((item) => item.providerKind === "checkout" && item.readinessChecks.includes("checkout-handoff-ready"))) fail("payment provider handoffs missing checkout readiness");
if (!data.paymentProviderHandoffs.some((item) => item.syncMode === "eligibility-guard-readiness" && item.readinessChecks.includes("guardian-consent-gate") && item.readinessChecks.includes("no-live-payment"))) fail("payment provider handoffs missing guardian eligibility no-payment readiness");
if (!data.paymentProviderHandoffs.every((item) => item.visibility === "internal" && item.customerVisible === false && item.livePaymentEnabled === false && item.externalProviderWrite === false && item.storesCredentials === false && item.webhookEnabled === false && item.capturesPayment === false)) {
  fail("payment provider handoffs must be internal-only with no live checkout, capture, credentials, webhooks, or provider writes");
}
if (!data.authSessionRoleHandoffs.some((item) => item.surface === "public" && item.publicExposure === "controlled-public" && item.readinessChecks.includes("public-intake-route-only"))) fail("auth/session roles missing controlled public intake readiness");
if (!data.authSessionRoleHandoffs.some((item) => item.surface === "student" && item.publicExposure === "controlled-customer" && item.customerSafe === true)) fail("auth/session roles missing controlled customer status readiness");
if (!data.authSessionRoleHandoffs.some((item) => item.surface === "admin" && item.publicExposure === "denied" && item.rawSurface === true)) fail("auth/session roles missing admin raw denial readiness");
if (!data.authSessionRoleHandoffs.some((item) => item.surface === "monitor" && item.publicExposure === "denied" && item.rawSurface === true)) fail("auth/session roles missing monitor raw denial readiness");
if (!data.authSessionRoleHandoffs.every((item) => item.productionAuthEnabled === false && item.identityProviderWrite === false && item.storesCredentials === false && item.storesTokens === false && item.oauthClientConfigured === false && item.externalSessionEnabled === false && item.readinessChecks.includes("no-live-auth"))) {
  fail("auth/session role handoffs must remain no-live-auth with no provider writes, credentials, tokens, OAuth clients, or external sessions");
}
if (!Array.isArray(data.marketingConversionEvents) || data.marketingConversionEvents.length < 5) fail("seed data missing marketing conversion KPI records");
if (!data.receipts.some((item) => item.kind === "marketing-conversion")) fail("seed data missing marketing-conversion receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-marketing-conversions" && item.effect === "marketing-conversion-readiness")) fail("seed data missing marketing conversion monitor health check");
const conversionEventTypes = new Set(data.marketingConversionEvents.map((item) => item.eventType));
for (const eventType of ["offer_view", "diagnostic_submit", "portfolio_submit", "consult_booking", "compatibility_request"]) {
  if (!conversionEventTypes.has(eventType)) fail(`marketing conversion events missing ${eventType}`);
}
if (!data.marketingConversionEvents.some((item) => item.regionScope === "jp" && item.routeKey.startsWith("ja/offers/"))) fail("marketing conversion events missing Japan route KPI");
if (!data.marketingConversionEvents.some((item) => item.regionScope === "global" && item.routeKey.startsWith("global/offers/"))) fail("marketing conversion events missing global route KPI");
if (!data.marketingConversionEvents.some((item) => item.offerBundle === "teacher-review" && item.readinessChecks.includes("submission-first"))) fail("marketing conversion events missing submission-first teacher-review KPI");
const under19Conversion = data.marketingConversionEvents.find((item) => item.audienceTier === "under19");
if (!under19Conversion) fail("marketing conversion events missing under-19 guarded KPI");
if (!under19Conversion.readinessChecks.includes("guardian-consent-required") || !under19Conversion.readinessChecks.includes("no-paid-action-before-consent")) {
  fail("under-19 marketing conversion KPI missing guardian consent or no-paid-action checks");
}
for (const event of data.marketingConversionEvents) {
  if (!data.campaignRoutes.some((route) => route.id === event.campaignRouteId)) fail(`marketing conversion event ${event.id} references missing campaign route`);
  if (event.livePixelEnabled !== false || event.externalAdApiWrite !== false || event.invasiveTracking !== false || event.storesPersonalData !== false || event.productionAnalyticsCredential !== false || event.webhookEnabled !== false || event.crossSiteIdentifier !== false) {
    fail(`marketing conversion event ${event.id} enabled a live tracking or external-write safeguard`);
  }
  if (event.localOnly !== true || event.customerVisible !== false || event.customerSafe !== true || event.analyticsProvider !== "provider-neutral ledger" || event.attributionPolicy !== "first-party-route-key-only") {
    fail(`marketing conversion event ${event.id} lost local/provider-neutral attribution posture`);
  }
  for (const requiredCheck of ["no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials"]) {
    if (!event.readinessChecks.includes(requiredCheck)) fail(`marketing conversion event ${event.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(event.monitorKpis) || !event.monitorKpis.length) fail(`marketing conversion event ${event.id} missing monitor KPIs`);
}
if (!Array.isArray(data.providerAdapterCandidates) || data.providerAdapterCandidates.length < 6) fail("seed data missing provider adapter candidate records");
if (!data.receipts.some((item) => item.kind === "provider-adapter-selection")) fail("seed data missing provider-adapter-selection receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-provider-adapters" && item.effect === "provider-adapter-selection-readiness")) fail("seed data missing provider adapter monitor health check");
const providerFamilies = new Set(data.providerAdapterCandidates.map((item) => item.providerFamily));
for (const family of ["calendar", "notification", "payment", "auth-session", "analytics-advertising", "durable-persistence"]) {
  if (!providerFamilies.has(family)) fail(`provider adapter candidates missing ${family}`);
}
const familyRequiredChecks = {
  calendar: ["no-live-sync"],
  notification: ["no-live-send", "consent-boundary-required"],
  payment: ["no-payment-capture", "legal-review-required", "consent-boundary-required"],
  "auth-session": ["no-live-auth", "raw-monitor-denied-public", "raw-admin-denied-public"],
  "analytics-advertising": ["no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking", "legal-review-required", "consent-boundary-required"],
  "durable-persistence": ["backup-plan-required", "recovery-plan-required"]
};
for (const candidate of data.providerAdapterCandidates) {
  if (candidate.sandboxOnly !== true || candidate.liveApiCalls !== false || candidate.productionEnabled !== false || candidate.externalProviderWrite !== false) {
    fail(`provider adapter candidate ${candidate.id} lost sandbox-only/no-live-provider posture`);
  }
  if (candidate.secretsPresent !== false || candidate.credentialsStored !== false || candidate.oauthConfigured !== false || candidate.webhookEnabled !== false) {
    fail(`provider adapter candidate ${candidate.id} enabled secrets, credentials, OAuth, or webhooks`);
  }
  if (candidate.customerVisible !== false || candidate.customerSafe !== false) fail(`provider adapter candidate ${candidate.id} should remain internal-only`);
  for (const requiredCheck of ["provider-candidate-recorded", "sandbox-only-before-go-live", "operator-approval-required", "credential-plan-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", ...(familyRequiredChecks[candidate.providerFamily] || [])]) {
    if (!candidate.readinessChecks.includes(requiredCheck)) fail(`provider adapter candidate ${candidate.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(candidate.goCriteria) || !candidate.goCriteria.length) fail(`provider adapter candidate ${candidate.id} missing go criteria`);
  if (!Array.isArray(candidate.blockers) || !candidate.blockers.length) fail(`provider adapter candidate ${candidate.id} missing blockers`);
}
if (!Array.isArray(data.marketingAnalyticsAdapterPrototypes) || data.marketingAnalyticsAdapterPrototypes.length < 1) fail("seed data missing sandbox marketing analytics adapter prototype records");
if (!data.receipts.some((item) => item.kind === "marketing-analytics-adapter-prototype")) fail("seed data missing marketing-analytics-adapter-prototype receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-marketing-analytics-prototype" && item.effect === "marketing-analytics-sandbox-proof")) fail("seed data missing sandbox marketing analytics adapter monitor health check");
for (const prototype of data.marketingAnalyticsAdapterPrototypes) {
  if (!data.providerAdapterCandidates.some((item) => item.id === prototype.providerCandidateId && item.providerFamily === "analytics-advertising")) fail(`marketing analytics adapter prototype ${prototype.id} does not link to an analytics-advertising provider adapter candidate`);
  if (!Array.isArray(prototype.sourceEventIds) || !prototype.sourceEventIds.some((id) => data.marketingConversionEvents.some((item) => item.id === id))) fail(`marketing analytics adapter prototype ${prototype.id} does not link to marketing conversion KPI records`);
  if (prototype.adapterFamily !== "analytics-advertising") fail(`marketing analytics adapter prototype ${prototype.id} is not in the analytics-advertising family`);
  if (prototype.sandboxOnly !== true || prototype.localOnly !== true) fail(`marketing analytics adapter prototype ${prototype.id} must remain sandbox/local only`);
  if (prototype.livePixelEnabled !== false || prototype.externalAdApiWrite !== false || prototype.liveApiCalls !== false || prototype.externalProviderWrite !== false || prototype.productionEnabled !== false) {
    fail(`marketing analytics adapter prototype ${prototype.id} enabled live analytics/ad provider behavior`);
  }
  if (prototype.invasiveTracking !== false || prototype.storesPersonalData !== false || prototype.productionAnalyticsCredential !== false || prototype.crossSiteIdentifier !== false || prototype.thirdPartyCookieEnabled !== false || prototype.fingerprintingEnabled !== false || prototype.crossDeviceIdentityEnabled !== false) {
    fail(`marketing analytics adapter prototype ${prototype.id} enabled invasive tracking, personal data, credentials, or identity safeguards`);
  }
  if (prototype.secretsPresent !== false || prototype.credentialsStored !== false || prototype.storesCredentials !== false || prototype.oauthConfigured !== false || prototype.webhookEnabled !== false) {
    fail(`marketing analytics adapter prototype ${prototype.id} enabled secrets, credentials, OAuth, or webhooks`);
  }
  if (prototype.customerVisible !== false || prototype.customerSafe !== false || prototype.publicProofSurface !== false) fail(`marketing analytics adapter prototype ${prototype.id} should remain internal-only`);
  if (prototype.legalReviewRequired !== true || prototype.privacyReviewRequired !== true || prototype.consentBoundaryRequired !== true || prototype.under19ConsentGated !== true || prototype.noPaidActionBeforeConsent !== true) {
    fail(`marketing analytics adapter prototype ${prototype.id} lost legal/privacy/consent or under-19 guard posture`);
  }
  for (const requiredCheck of ["provider-candidate-required", "marketing-conversion-kpi-required", "campaign-route-key-preserved", "privacy-boundary-required", "consent-boundary-required", "legal-review-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-pixel", "no-external-ad-api-write", "first-party-ledger-only", "no-invasive-tracking", "no-analytics-credentials", "no-webhooks", "no-provider-writes", "no-personal-data-storage", "no-cross-site-identifier", "no-third-party-cookie", "no-fingerprinting", "no-cross-device-identity", "no-customer-visible-analytics", "guardian-consent-required", "no-paid-action-before-consent"]) {
    if (!prototype.readinessChecks.includes(requiredCheck)) fail(`marketing analytics adapter prototype ${prototype.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(prototype.payloadPreview) || !prototype.payloadPreview.length) fail(`marketing analytics adapter prototype ${prototype.id} missing local conversion payload preview`);
  if (!prototype.payloadPreview.some((item) => item.audienceTier === "under19" && item.guardianConsentRequired === true && item.noPaidActionBeforeConsent === true)) fail(`marketing analytics adapter prototype ${prototype.id} missing under-19 consent-gated preview`);
  if (!Array.isArray(prototype.blockers) || !prototype.blockers.length) fail(`marketing analytics adapter prototype ${prototype.id} missing blockers`);
}
if (!Array.isArray(data.calendarAdapterPrototypes) || data.calendarAdapterPrototypes.length < 1) fail("seed data missing sandbox calendar adapter prototype records");
if (!data.receipts.some((item) => item.kind === "calendar-adapter-prototype")) fail("seed data missing calendar-adapter-prototype receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-calendar-adapter" && item.effect === "calendar-adapter-sandbox-proof")) fail("seed data missing sandbox calendar adapter monitor health check");
for (const prototype of data.calendarAdapterPrototypes) {
  if (!data.providerAdapterCandidates.some((item) => item.id === prototype.providerCandidateId && item.providerFamily === "calendar")) fail(`calendar adapter prototype ${prototype.id} does not link to a calendar provider adapter candidate`);
  if (prototype.adapterFamily !== "calendar") fail(`calendar adapter prototype ${prototype.id} is not in the calendar family`);
  if (prototype.sandboxOnly !== true || prototype.localOnly !== true) fail(`calendar adapter prototype ${prototype.id} must remain sandbox/local only`);
  if (prototype.liveApiCalls !== false || prototype.liveSyncEnabled !== false || prototype.sendsInvitations !== false || prototype.externalProviderWrite !== false || prototype.productionEnabled !== false) {
    fail(`calendar adapter prototype ${prototype.id} enabled live provider behavior`);
  }
  if (prototype.secretsPresent !== false || prototype.credentialsStored !== false || prototype.oauthConfigured !== false || prototype.webhookEnabled !== false) {
    fail(`calendar adapter prototype ${prototype.id} enabled secrets, credentials, OAuth, or webhooks`);
  }
  if (prototype.customerVisible !== false || prototype.customerSafe !== false) fail(`calendar adapter prototype ${prototype.id} should remain internal-only`);
  for (const requiredCheck of ["calendar-export-schema-stable", "provider-go-no-go-required", "sandbox-only-before-go-live", "operator-approval-required", "no-live-api", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-live-sync", "no-invitation-send"]) {
    if (!prototype.readinessChecks.includes(requiredCheck)) fail(`calendar adapter prototype ${prototype.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(prototype.payloadPreview) || !prototype.payloadPreview.length) fail(`calendar adapter prototype ${prototype.id} missing local payload preview`);
  if (!Array.isArray(prototype.blockers) || !prototype.blockers.length) fail(`calendar adapter prototype ${prototype.id} missing blockers`);
}
if (!Array.isArray(data.notificationProviderPrototypes) || data.notificationProviderPrototypes.length < 1) fail("seed data missing sandbox notification provider prototype records");
if (!data.receipts.some((item) => item.kind === "notification-provider-prototype")) fail("seed data missing notification-provider-prototype receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-notification-prototype" && item.effect === "notification-provider-sandbox-proof")) fail("seed data missing sandbox notification provider monitor health check");
for (const prototype of data.notificationProviderPrototypes) {
  if (!data.providerAdapterCandidates.some((item) => item.id === prototype.providerCandidateId && item.providerFamily === "notification")) fail(`notification provider prototype ${prototype.id} does not link to a notification provider adapter candidate`);
  if (!data.notificationProviderHandoffs.some((item) => item.id === prototype.sourceHandoffId)) fail(`notification provider prototype ${prototype.id} does not link to a notification provider handoff`);
  if (prototype.adapterFamily !== "notification") fail(`notification provider prototype ${prototype.id} is not in the notification family`);
  if (prototype.sandboxOnly !== true || prototype.localOnly !== true) fail(`notification provider prototype ${prototype.id} must remain sandbox/local only`);
  if (prototype.liveSendEnabled !== false || prototype.liveEmailSend !== false || prototype.liveLineSend !== false || prototype.liveSmsSend !== false || prototype.liveNexusSend !== false || prototype.externalProviderWrite !== false || prototype.productionEnabled !== false) {
    fail(`notification provider prototype ${prototype.id} enabled live notification provider behavior`);
  }
  if (prototype.secretsPresent !== false || prototype.credentialsStored !== false || prototype.storesCredentials !== false || prototype.oauthConfigured !== false || prototype.webhookEnabled !== false) {
    fail(`notification provider prototype ${prototype.id} enabled secrets, credentials, OAuth, or webhooks`);
  }
  if (prototype.customerVisible !== false || prototype.customerSafe !== false) fail(`notification provider prototype ${prototype.id} should remain internal-only`);
  for (const requiredCheck of ["provider-handoff-required", "template-consent-required", "notification-outbox-schema-stable", "sandbox-only-before-go-live", "operator-approval-required", "no-live-send", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-customer-visible-send", "no-nexus-send"]) {
    if (!prototype.readinessChecks.includes(requiredCheck)) fail(`notification provider prototype ${prototype.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(prototype.payloadPreview) || !prototype.payloadPreview.length) fail(`notification provider prototype ${prototype.id} missing local payload preview`);
  if (!Array.isArray(prototype.blockers) || !prototype.blockers.length) fail(`notification provider prototype ${prototype.id} missing blockers`);
}
if (!Array.isArray(data.paymentProviderPrototypes) || data.paymentProviderPrototypes.length < 1) fail("seed data missing sandbox payment provider prototype records");
if (!data.receipts.some((item) => item.kind === "payment-provider-prototype")) fail("seed data missing payment-provider-prototype receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-payment-prototype" && item.effect === "payment-provider-sandbox-proof")) fail("seed data missing sandbox payment provider monitor health check");
for (const prototype of data.paymentProviderPrototypes) {
  if (!data.providerAdapterCandidates.some((item) => item.id === prototype.providerCandidateId && item.providerFamily === "payment")) fail(`payment provider prototype ${prototype.id} does not link to a payment provider adapter candidate`);
  if (!data.paymentProviderHandoffs.some((item) => item.id === prototype.sourceHandoffId)) fail(`payment provider prototype ${prototype.id} does not link to a payment provider handoff`);
  if (prototype.adapterFamily !== "payment") fail(`payment provider prototype ${prototype.id} is not in the payment family`);
  if (prototype.sandboxOnly !== true || prototype.localOnly !== true) fail(`payment provider prototype ${prototype.id} must remain sandbox/local only`);
  if (prototype.livePaymentEnabled !== false || prototype.liveCheckoutEnabled !== false || prototype.liveCaptureEnabled !== false || prototype.liveRefundEnabled !== false || prototype.invoiceSendEnabled !== false || prototype.checkoutSessionCreated !== false || prototype.paymentLinkCreated !== false || prototype.capturesPayment !== false || prototype.externalProviderWrite !== false || prototype.productionEnabled !== false) {
    fail(`payment provider prototype ${prototype.id} enabled live payment provider behavior`);
  }
  if (prototype.secretsPresent !== false || prototype.credentialsStored !== false || prototype.storesCredentials !== false || prototype.oauthConfigured !== false || prototype.webhookEnabled !== false) {
    fail(`payment provider prototype ${prototype.id} enabled secrets, credentials, OAuth, or webhooks`);
  }
  if (prototype.customerVisible !== false || prototype.customerSafe !== false) fail(`payment provider prototype ${prototype.id} should remain internal-only`);
  if (prototype.legalReviewRequired !== true || prototype.taxReviewRequired !== true || prototype.privacyReviewRequired !== true || prototype.under19Guarded !== true) {
    fail(`payment provider prototype ${prototype.id} lost legal/tax/privacy or under-19 guard posture`);
  }
  for (const requiredCheck of ["provider-candidate-required", "payment-provider-handoff-required", "quote-payment-schema-stable", "legal-review-required", "tax-review-required", "privacy-boundary-required", "under19-eligibility-gate", "sandbox-only-before-go-live", "operator-approval-required", "no-live-payment", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-checkout-session", "no-payment-capture", "no-refunds", "no-invoice-send", "no-customer-visible-payment-request"]) {
    if (!prototype.readinessChecks.includes(requiredCheck)) fail(`payment provider prototype ${prototype.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(prototype.payloadPreview) || !prototype.payloadPreview.length) fail(`payment provider prototype ${prototype.id} missing local payload preview`);
  if (!Array.isArray(prototype.blockers) || !prototype.blockers.length) fail(`payment provider prototype ${prototype.id} missing blockers`);
}
if (!Array.isArray(data.authProviderPrototypes) || data.authProviderPrototypes.length < 1) fail("seed data missing sandbox auth provider prototype records");
if (!data.receipts.some((item) => item.kind === "auth-provider-prototype")) fail("seed data missing auth-provider-prototype receipt");
if (!data.monitorHealthChecks.some((item) => item.target === "monitor-auth-prototype" && item.effect === "auth-provider-sandbox-proof")) fail("seed data missing sandbox auth provider monitor health check");
for (const prototype of data.authProviderPrototypes) {
  if (!data.providerAdapterCandidates.some((item) => item.id === prototype.providerCandidateId && item.providerFamily === "auth-session")) fail(`auth provider prototype ${prototype.id} does not link to an auth-session provider adapter candidate`);
  if (!Array.isArray(prototype.sourceHandoffIds) || !prototype.sourceHandoffIds.some((id) => data.authSessionRoleHandoffs.some((item) => item.id === id))) fail(`auth provider prototype ${prototype.id} does not link to auth/session role handoffs`);
  if (prototype.adapterFamily !== "auth-session") fail(`auth provider prototype ${prototype.id} is not in the auth-session family`);
  if (prototype.sandboxOnly !== true || prototype.localOnly !== true) fail(`auth provider prototype ${prototype.id} must remain sandbox/local only`);
  if (prototype.liveAuthEnabled !== false || prototype.liveLoginEnabled !== false || prototype.productionAuthEnabled !== false || prototype.identityProviderWrite !== false || prototype.externalProviderWrite !== false || prototype.externalSessionEnabled !== false) {
    fail(`auth provider prototype ${prototype.id} enabled live auth provider behavior`);
  }
  if (prototype.oauthClientConfigured !== false || prototype.oauthConfigured !== false || prototype.secretsPresent !== false || prototype.credentialsStored !== false || prototype.storesCredentials !== false || prototype.storesTokens !== false || prototype.tokenStorageEnabled !== false || prototype.refreshTokenStorageEnabled !== false || prototype.webhookEnabled !== false) {
    fail(`auth provider prototype ${prototype.id} enabled OAuth, secrets, credentials, tokens, refresh-token storage, or webhooks`);
  }
  if (prototype.customerVisible !== false || prototype.customerSafe !== false) fail(`auth provider prototype ${prototype.id} should remain internal-only`);
  if (prototype.rawAdminExposure !== false || prototype.rawMonitorExposure !== false) fail(`auth provider prototype ${prototype.id} exposed raw admin or monitor routes`);
  for (const requiredCheck of ["provider-candidate-required", "auth-session-role-handoff-required", "auth-boundary-schema-stable", "public-intake-route-only", "controlled-customer-route", "raw-admin-denied-public", "raw-monitor-denied-public", "sandbox-only-before-go-live", "operator-approval-required", "privacy-boundary-required", "consent-boundary-required", "no-live-auth", "no-secrets", "no-oauth-client", "no-webhooks", "no-provider-writes", "no-credential-storage", "no-token-storage", "no-refresh-token-storage", "no-external-session", "no-customer-visible-auth"]) {
    if (!prototype.readinessChecks.includes(requiredCheck)) fail(`auth provider prototype ${prototype.id} missing ${requiredCheck}`);
  }
  if (!Array.isArray(prototype.payloadPreview) || prototype.payloadPreview.length < 4) fail(`auth provider prototype ${prototype.id} missing local access payload previews`);
  if (!prototype.payloadPreview.some((item) => item.surface === "admin" && item.publicExposure === "denied")) fail(`auth provider prototype ${prototype.id} missing raw admin denial preview`);
  if (!prototype.payloadPreview.some((item) => item.surface === "monitor" && item.publicExposure === "denied")) fail(`auth provider prototype ${prototype.id} missing raw monitor denial preview`);
  if (!Array.isArray(prototype.blockers) || !prototype.blockers.length) fail(`auth provider prototype ${prototype.id} missing blockers`);
}
if (!Array.isArray(data.customerAccountHistories) || data.customerAccountHistories.length < data.customers.length) fail("seed data missing durable customer account history records");
if (!data.receipts.some((item) => item.kind === "customer-account-history" || item.id === "receipt-client-request-seed")) fail("seed data missing customer account history receipt evidence");
for (const history of data.customerAccountHistories) {
  if (!data.customers.some((customer) => customer.id === history.customerId)) fail(`account history ${history.id} is not linked to a known customer`);
  if (history.visibility !== "controlled-customer") fail(`account history ${history.id} must use controlled-customer visibility`);
  if (history.customerSafe !== true || history.localOnly !== true || history.liveProviderWrite !== false || history.externalNotification !== false || history.productionEnabled !== false) {
    fail(`account history ${history.id} lost customer-safe local-only guardrails`);
  }
  for (const requiredGuardrail of ["controlled-customer-status-only", "no-live-provider-write", "no-customer-send", "no-secret-material", "no-raw-monitor"]) {
    if (!history.guardrails.includes(requiredGuardrail)) fail(`account history ${history.id} missing ${requiredGuardrail}`);
  }
  if (!Array.isArray(history.statusTimeline) || !history.statusTimeline.length) fail(`account history ${history.id} missing status timeline`);
  if (!history.statusTimeline.every((event) => event.customerSafe !== false && event.operatorVisible !== false)) fail(`account history ${history.id} has unsafe timeline event`);
}
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
if (typeof recordTools.createNotificationProviderHandoffRecords !== "function") fail("operating helpers missing createNotificationProviderHandoffRecords");
if (typeof recordTools.transitionNotificationProviderHandoffRecords !== "function") fail("operating helpers missing transitionNotificationProviderHandoffRecords");
if (typeof recordTools.createPaymentProviderHandoffRecords !== "function") fail("operating helpers missing createPaymentProviderHandoffRecords");
if (typeof recordTools.transitionPaymentProviderHandoffRecords !== "function") fail("operating helpers missing transitionPaymentProviderHandoffRecords");
if (typeof recordTools.createAuthSessionRoleHandoffRecords !== "function") fail("operating helpers missing createAuthSessionRoleHandoffRecords");
if (typeof recordTools.transitionAuthSessionRoleHandoffRecords !== "function") fail("operating helpers missing transitionAuthSessionRoleHandoffRecords");
if (typeof recordTools.createMarketingConversionEventRecords !== "function") fail("operating helpers missing createMarketingConversionEventRecords");
if (typeof recordTools.transitionMarketingConversionEventRecords !== "function") fail("operating helpers missing transitionMarketingConversionEventRecords");
if (typeof recordTools.createProviderAdapterCandidateRecords !== "function") fail("operating helpers missing createProviderAdapterCandidateRecords");
if (typeof recordTools.transitionProviderAdapterCandidateRecords !== "function") fail("operating helpers missing transitionProviderAdapterCandidateRecords");
if (typeof recordTools.createCalendarAdapterPrototypeRecords !== "function") fail("operating helpers missing createCalendarAdapterPrototypeRecords");
if (typeof recordTools.transitionCalendarAdapterPrototypeRecords !== "function") fail("operating helpers missing transitionCalendarAdapterPrototypeRecords");
if (typeof recordTools.createAuthProviderPrototypeRecords !== "function") fail("operating helpers missing createAuthProviderPrototypeRecords");
if (typeof recordTools.transitionAuthProviderPrototypeRecords !== "function") fail("operating helpers missing transitionAuthProviderPrototypeRecords");
if (typeof recordTools.createCustomerAccountHistoryRecords !== "function") fail("operating helpers missing createCustomerAccountHistoryRecords");
if (typeof recordTools.createQuoteEstimateRecords !== "function") fail("operating helpers missing createQuoteEstimateRecords");
if (typeof recordTools.transitionQuoteEstimateRecords !== "function") fail("operating helpers missing transitionQuoteEstimateRecords");
if (typeof recordTools.createReminderRuleRecords !== "function") fail("operating helpers missing createReminderRuleRecords");
if (typeof recordTools.transitionReminderRuleRecords !== "function") fail("operating helpers missing transitionReminderRuleRecords");
if (typeof recordTools.createRecurrenceCandidateRecords !== "function") fail("operating helpers missing createRecurrenceCandidateRecords");
if (typeof recordTools.transitionRecurrenceCandidateRecords !== "function") fail("operating helpers missing transitionRecurrenceCandidateRecords");
if (typeof recordTools.createAvailabilityWindowRecords !== "function") fail("operating helpers missing createAvailabilityWindowRecords");
if (typeof recordTools.transitionAvailabilityWindowRecords !== "function") fail("operating helpers missing transitionAvailabilityWindowRecords");
if (typeof recordTools.createAccessGatewayRecords !== "function") fail("operating helpers missing createAccessGatewayRecords");
if (typeof recordTools.transitionAccessGatewayRecords !== "function") fail("operating helpers missing transitionAccessGatewayRecords");
if (typeof recordTools.createLibrarySyncHandoffRecords !== "function") fail("operating helpers missing createLibrarySyncHandoffRecords");
if (typeof recordTools.transitionLibrarySyncHandoffRecords !== "function") fail("operating helpers missing transitionLibrarySyncHandoffRecords");
if (typeof recordTools.createCalendarProviderHandoffRecords !== "function") fail("operating helpers missing createCalendarProviderHandoffRecords");
if (typeof recordTools.transitionCalendarProviderHandoffRecords !== "function") fail("operating helpers missing transitionCalendarProviderHandoffRecords");
if (typeof recordTools.createMonitorActionRecords !== "function") fail("operating helpers missing createMonitorActionRecords");
if (typeof recordTools.summarizeAgentHandoffState !== "function") fail("operating helpers missing summarizeAgentHandoffState");
if (typeof recordTools.summarizeQuoteState !== "function") fail("operating helpers missing summarizeQuoteState");
if (typeof recordTools.summarizeScheduleControlState !== "function") fail("operating helpers missing summarizeScheduleControlState");
if (typeof recordTools.summarizeAccessGatewayState !== "function") fail("operating helpers missing summarizeAccessGatewayState");
if (typeof recordTools.summarizeLibrarySyncState !== "function") fail("operating helpers missing summarizeLibrarySyncState");
if (typeof recordTools.summarizeCalendarProviderState !== "function") fail("operating helpers missing summarizeCalendarProviderState");
if (typeof recordTools.summarizeNotificationProviderState !== "function") fail("operating helpers missing summarizeNotificationProviderState");
if (typeof recordTools.summarizePaymentProviderState !== "function") fail("operating helpers missing summarizePaymentProviderState");
if (typeof recordTools.summarizeAuthSessionRoleState !== "function") fail("operating helpers missing summarizeAuthSessionRoleState");
if (typeof recordTools.summarizeMarketingConversionState !== "function") fail("operating helpers missing summarizeMarketingConversionState");
if (typeof recordTools.summarizeProviderAdapterSelectionState !== "function") fail("operating helpers missing summarizeProviderAdapterSelectionState");
if (typeof recordTools.summarizeCalendarAdapterPrototypeState !== "function") fail("operating helpers missing summarizeCalendarAdapterPrototypeState");
if (typeof recordTools.summarizeAuthProviderPrototypeState !== "function") fail("operating helpers missing summarizeAuthProviderPrototypeState");
if (typeof recordTools.summarizeCustomerAccountHistoryState !== "function") fail("operating helpers missing summarizeCustomerAccountHistoryState");
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
if (accessSummary.safeGateway !== "controlled-public-customer-gateway") fail("safe-access summary lost controlled gateway name");

const gatewaySummary = recordTools.summarizeAccessGatewayState(data, { now: "2026-06-01T12:00:00+09:00" });
if (gatewaySummary.status !== "ready") fail("access gateway summary should be ready for the seed slice");
if (gatewaySummary.controlledPublic < 1) fail("access gateway summary missing controlled public route");
if (gatewaySummary.controlledCustomer < 1) fail("access gateway summary missing controlled customer route");
if (gatewaySummary.deniedRaw < 2) fail("access gateway summary missing raw admin/monitor denial");
const brokenGatewayData = recordTools.cloneData(data);
brokenGatewayData.accessGateways = brokenGatewayData.accessGateways.map((item) => item.id === "gateway-raw-monitor" ? { ...item, publicExposure: "controlled-public" } : item);
const brokenGatewaySummary = recordTools.summarizeAccessGatewayState(brokenGatewayData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenGatewaySummary.status !== "blocked" || !brokenGatewaySummary.violations.length) fail("access gateway summary should block raw monitor exposure");

const librarySyncSummary = recordTools.summarizeLibrarySyncState(data, { now: "2026-06-01T12:00:00+09:00" });
if (librarySyncSummary.handoffCount < 2) fail("LIBRARY sync summary missing handoff count");
if (librarySyncSummary.exportHandoffs < 1) fail("LIBRARY sync summary missing export handoff");
if (librarySyncSummary.recoveryHandoffs < 1) fail("LIBRARY sync summary missing recovery handoff");
if (librarySyncSummary.searchReady < 1) fail("LIBRARY sync summary missing search-ready handoff");
if (librarySyncSummary.backupReady < 2) fail("LIBRARY sync summary missing backup-ready handoffs");
if (librarySyncSummary.violations.length !== 0) fail("LIBRARY sync summary should not report seed violations");
const brokenLibraryData = recordTools.cloneData(data);
brokenLibraryData.librarySyncHandoffs = brokenLibraryData.librarySyncHandoffs.map((item) => item.id === "library-sync-operating-ledger" ? { ...item, targetSystem: "PUBLIC", visibility: "controlled-customer", customerVisible: true } : item);
const brokenLibrarySummary = recordTools.summarizeLibrarySyncState(brokenLibraryData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenLibrarySummary.status !== "blocked" || brokenLibrarySummary.violations.length < 2) fail("LIBRARY sync summary should block public/customer-visible handoff records");

const calendarProviderSummary = recordTools.summarizeCalendarProviderState(data, { now: "2026-06-01T12:00:00+09:00" });
if (calendarProviderSummary.handoffCount < 3) fail("calendar provider summary missing handoff count");
if (calendarProviderSummary.providerReady < 2) fail("calendar provider summary missing provider readiness handoffs");
if (calendarProviderSummary.invitationReady < 1) fail("calendar provider summary missing invitation readiness handoff");
if (calendarProviderSummary.noLiveSend !== data.calendarProviderHandoffs.length) fail("calendar provider summary should prove no-live-send on every handoff");
if (calendarProviderSummary.violations.length !== 0) fail("calendar provider summary should not report seed violations");
const brokenCalendarProviderData = recordTools.cloneData(data);
brokenCalendarProviderData.calendarProviderHandoffs = brokenCalendarProviderData.calendarProviderHandoffs.map((item) => item.id === "calendar-provider-google-readiness" ? { ...item, customerVisible: true, liveSyncEnabled: true, sendsInvitations: true } : item);
const brokenCalendarProviderSummary = recordTools.summarizeCalendarProviderState(brokenCalendarProviderData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenCalendarProviderSummary.status !== "blocked" || brokenCalendarProviderSummary.violations.length < 2) fail("calendar provider summary should block live/customer-visible provider handoffs");

const notificationProviderSeedSummary = recordTools.summarizeNotificationProviderState(data, { now: "2026-06-01T12:00:00+09:00" });
if (notificationProviderSeedSummary.handoffCount < 3) fail("notification provider summary missing handoff count");
if (notificationProviderSeedSummary.providerReady < 2) fail("notification provider summary missing provider readiness handoffs");
if (notificationProviderSeedSummary.templateReady < 3) fail("notification provider summary missing template-ready handoffs");
if (notificationProviderSeedSummary.consentReady < 3) fail("notification provider summary missing consent-ready handoffs");
if (notificationProviderSeedSummary.noLiveSend !== data.notificationProviderHandoffs.length) fail("notification provider summary should prove no-live-send on every handoff");
if (notificationProviderSeedSummary.violations.length !== 0) fail("notification provider summary should not report seed violations");
const brokenNotificationProviderData = recordTools.cloneData(data);
brokenNotificationProviderData.notificationProviderHandoffs = brokenNotificationProviderData.notificationProviderHandoffs.map((item) => item.id === "notification-provider-email-readiness" ? { ...item, customerVisible: true, liveSendEnabled: true, externalProviderWrite: true, storesCredentials: true, webhookEnabled: true } : item);
const brokenNotificationProviderSummary = recordTools.summarizeNotificationProviderState(brokenNotificationProviderData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenNotificationProviderSummary.status !== "blocked" || brokenNotificationProviderSummary.violations.length < 2) fail("notification provider summary should block live/customer-visible provider handoffs");

const paymentProviderSeedSummary = recordTools.summarizePaymentProviderState(data, { now: "2026-06-01T12:00:00+09:00" });
if (paymentProviderSeedSummary.handoffCount < 3) fail("payment provider summary missing handoff count");
if (paymentProviderSeedSummary.providerReady < 1) fail("payment provider summary missing provider readiness handoff");
if (paymentProviderSeedSummary.invoiceReady < 2) fail("payment provider summary missing invoice-ready handoffs");
if (paymentProviderSeedSummary.checkoutReady < 1) fail("payment provider summary missing checkout-ready handoff");
if (paymentProviderSeedSummary.eligibilityReady < 2) fail("payment provider summary missing eligibility-ready handoffs");
if (paymentProviderSeedSummary.noLivePayment !== data.paymentProviderHandoffs.length) fail("payment provider summary should prove no-live-payment on every handoff");
if (paymentProviderSeedSummary.violations.length !== 0) fail("payment provider summary should not report seed violations");
const brokenPaymentProviderData = recordTools.cloneData(data);
brokenPaymentProviderData.paymentProviderHandoffs = brokenPaymentProviderData.paymentProviderHandoffs.map((item) => item.id === "payment-provider-checkout-readiness" ? { ...item, customerVisible: true, livePaymentEnabled: true, externalProviderWrite: true, storesCredentials: true, webhookEnabled: true, capturesPayment: true } : item);
const brokenPaymentProviderSummary = recordTools.summarizePaymentProviderState(brokenPaymentProviderData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenPaymentProviderSummary.status !== "blocked" || brokenPaymentProviderSummary.violations.length < 2) fail("payment provider summary should block live/customer-visible provider handoffs");

const authSessionSeedSummary = recordTools.summarizeAuthSessionRoleState(data, { now: "2026-06-01T12:00:00+09:00" });
if (authSessionSeedSummary.handoffCount < 4) fail("auth/session role summary missing handoff count");
if (authSessionSeedSummary.publicReady < 1) fail("auth/session role summary missing public intake readiness");
if (authSessionSeedSummary.customerReady < 1) fail("auth/session role summary missing customer status readiness");
if (authSessionSeedSummary.internalDenied < 2) fail("auth/session role summary missing internal raw denial readiness");
if (authSessionSeedSummary.noLiveAuth !== data.authSessionRoleHandoffs.length) fail("auth/session role summary should prove no-live-auth on every handoff");
if (authSessionSeedSummary.violations.length !== 0) fail("auth/session role summary should not report seed violations");
const brokenAuthSessionData = recordTools.cloneData(data);
brokenAuthSessionData.authSessionRoleHandoffs = brokenAuthSessionData.authSessionRoleHandoffs.map((item) => item.id === "auth-monitor-denial-readiness" ? { ...item, publicExposure: "controlled-public", visibility: "controlled-public", customerVisible: true, customerSafe: true, productionAuthEnabled: true, identityProviderWrite: true, storesCredentials: true, storesTokens: true, oauthClientConfigured: true, externalSessionEnabled: true } : item);
const brokenAuthSessionSummary = recordTools.summarizeAuthSessionRoleState(brokenAuthSessionData, { now: "2026-06-01T12:00:00+09:00" });
if (brokenAuthSessionSummary.status !== "blocked" || brokenAuthSessionSummary.violations.length < 2) fail("auth/session role summary should block live/public raw monitor auth handoffs");

const gatewayTransition = recordTools.transitionAccessGatewayRecords(data, {
  gatewayId: "gateway-public-intake",
  action: "verify",
  note: "Verifier rechecked the public intake gateway without opening raw admin or monitor exposure."
}, { now: "2026-06-01T12:04:00+09:00" });
if (gatewayTransition.data.receipts.filter((item) => item.kind === "access-gateway").length !== data.receipts.filter((item) => item.kind === "access-gateway").length + 1) {
  fail("access gateway transition should add an access-gateway receipt");
}
if (gatewayTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("access gateway transition should add a monitor health check");
if (gatewayTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("access gateway transition must not create customer-visible notification events");
if (gatewayTransition.records.healthCheck.customerVisible !== false) fail("access gateway health check must remain internal");

const librarySyncTransition = recordTools.transitionLibrarySyncHandoffRecords(data, {
  handoffId: "library-sync-operating-ledger",
  action: "mark-ready",
  note: "Verifier marked the EPOCH ledger handoff ready without touching live LIBRARY storage."
}, { now: "2026-06-01T12:06:00+09:00" });
if (librarySyncTransition.records.handoff.handoffStatus !== "ready-for-library") fail("LIBRARY sync transition did not mark ready-for-library");
if (librarySyncTransition.data.receipts.filter((item) => item.kind === "library-sync-handoff").length !== data.receipts.filter((item) => item.kind === "library-sync-handoff").length + 1) {
  fail("LIBRARY sync transition should add a library-sync-handoff receipt");
}
if (librarySyncTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("LIBRARY sync transition should add a monitor health check");
if (librarySyncTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("LIBRARY sync transition must not create customer-visible notification events");
if (librarySyncTransition.records.healthCheck.customerVisible !== false) fail("LIBRARY sync health check must remain internal");

const calendarProviderTransition = recordTools.transitionCalendarProviderHandoffRecords(data, {
  handoffId: "calendar-provider-invitation-readiness",
  action: "invite-ready",
  note: "Verifier marked invitation preview ready without sending a provider invite."
}, { now: "2026-06-01T12:07:00+09:00" });
if (calendarProviderTransition.records.handoff.handoffStatus !== "operator-preview-ready") fail("calendar provider transition did not mark operator preview ready");
if (calendarProviderTransition.data.receipts.filter((item) => item.kind === "calendar-provider-handoff").length !== data.receipts.filter((item) => item.kind === "calendar-provider-handoff").length + 1) {
  fail("calendar provider transition should add a calendar-provider-handoff receipt");
}
if (calendarProviderTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("calendar provider transition should add a monitor health check");
if (calendarProviderTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("calendar provider transition must not create customer-visible notification events");
if (calendarProviderTransition.records.healthCheck.customerVisible !== false) fail("calendar provider health check must remain internal");
if (calendarProviderTransition.records.handoff.liveSyncEnabled || calendarProviderTransition.records.handoff.sendsInvitations || calendarProviderTransition.records.handoff.externalProviderWrite) {
  fail("calendar provider transition must not enable live sync, provider writes, or invitation sending");
}

const notificationProviderTransition = recordTools.transitionNotificationProviderHandoffRecords(data, {
  handoffId: "notification-template-consent-readiness",
  action: "consent-ready",
  note: "Verifier marked notification consent readiness without enabling live delivery."
}, { now: "2026-06-01T12:08:00+09:00" });
if (notificationProviderTransition.records.handoff.handoffStatus !== "consent-review-ready") fail("notification provider transition did not mark consent review ready");
if (notificationProviderTransition.data.receipts.filter((item) => item.kind === "notification-provider-handoff").length !== data.receipts.filter((item) => item.kind === "notification-provider-handoff").length + 1) {
  fail("notification provider transition should add a notification-provider-handoff receipt");
}
if (notificationProviderTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("notification provider transition should add a monitor health check");
if (notificationProviderTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("notification provider transition must not create customer-visible notification events");
if (notificationProviderTransition.records.healthCheck.customerVisible !== false) fail("notification provider health check must remain internal");
if (notificationProviderTransition.records.handoff.liveSendEnabled || notificationProviderTransition.records.handoff.externalProviderWrite || notificationProviderTransition.records.handoff.storesCredentials || notificationProviderTransition.records.handoff.webhookEnabled) {
  fail("notification provider transition must not enable live sending, provider writes, credentials, or webhooks");
}

const paymentProviderTransition = recordTools.transitionPaymentProviderHandoffRecords(data, {
  handoffId: "payment-provider-checkout-readiness",
  action: "checkout-ready",
  note: "Verifier marked checkout readiness without creating a live payment session."
}, { now: "2026-06-01T12:09:00+09:00" });
if (paymentProviderTransition.records.handoff.handoffStatus !== "checkout-review-ready") fail("payment provider transition did not mark checkout review ready");
if (paymentProviderTransition.data.receipts.filter((item) => item.kind === "payment-provider-handoff").length !== data.receipts.filter((item) => item.kind === "payment-provider-handoff").length + 1) {
  fail("payment provider transition should add a payment-provider-handoff receipt");
}
if (paymentProviderTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("payment provider transition should add a monitor health check");
if (paymentProviderTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("payment provider transition must not create customer-visible notification events");
if (paymentProviderTransition.records.healthCheck.customerVisible !== false) fail("payment provider health check must remain internal");
if (paymentProviderTransition.records.handoff.livePaymentEnabled || paymentProviderTransition.records.handoff.externalProviderWrite || paymentProviderTransition.records.handoff.storesCredentials || paymentProviderTransition.records.handoff.webhookEnabled || paymentProviderTransition.records.handoff.capturesPayment) {
  fail("payment provider transition must not enable live checkout, provider writes, credentials, webhooks, or capture");
}

const authSessionTransition = recordTools.transitionAuthSessionRoleHandoffRecords(data, {
  handoffId: "auth-monitor-denial-readiness",
  action: "deny-raw",
  note: "Verifier reasserted raw monitor denial without enabling a live identity provider."
}, { now: "2026-06-01T12:10:00+09:00" });
if (authSessionTransition.records.handoff.handoffStatus !== "raw-surface-denied") fail("auth/session role transition did not deny raw surface");
if (authSessionTransition.data.receipts.filter((item) => item.kind === "auth-session-role-handoff").length !== data.receipts.filter((item) => item.kind === "auth-session-role-handoff").length + 1) {
  fail("auth/session role transition should add an auth-session-role-handoff receipt");
}
if (authSessionTransition.data.monitorHealthChecks.length !== data.monitorHealthChecks.length + 1) fail("auth/session role transition should add a monitor health check");
if (authSessionTransition.data.notificationEvents.length !== data.notificationEvents.length) fail("auth/session role transition must not create customer-visible notification events");
if (authSessionTransition.records.healthCheck.customerVisible !== false) fail("auth/session role health check must remain internal");
if (authSessionTransition.records.handoff.productionAuthEnabled || authSessionTransition.records.handoff.identityProviderWrite || authSessionTransition.records.handoff.storesCredentials || authSessionTransition.records.handoff.storesTokens || authSessionTransition.records.handoff.oauthClientConfigured || authSessionTransition.records.handoff.externalSessionEnabled) {
  fail("auth/session role transition must not enable live auth, provider writes, credentials, tokens, OAuth clients, or external sessions");
}

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

const marketingConversionSummary = recordTools.summarizeMarketingConversionState(data);
if (marketingConversionSummary.eventCount !== data.marketingConversionEvents.length) fail("marketing conversion summary total is wrong");
if (marketingConversionSummary.readyEvents !== data.marketingConversionEvents.length) fail("marketing conversion summary missing ready KPI events");
if (marketingConversionSummary.noLiveTracking !== data.marketingConversionEvents.length) fail("marketing conversion summary no-live-tracking count is wrong");
if (marketingConversionSummary.providerDeferred !== data.marketingConversionEvents.length) fail("marketing conversion summary provider-neutral count is wrong");
if (marketingConversionSummary.jpEvents < 3) fail("marketing conversion summary missing Japan KPI events");
if (marketingConversionSummary.globalEvents < 1) fail("marketing conversion summary missing global KPI event");
if (marketingConversionSummary.highIntentEvents < 3) fail("marketing conversion summary missing high-intent KPI events");
if (marketingConversionSummary.under19GuardedEvents < 1) fail("marketing conversion summary missing under-19 guarded KPI event");
if (marketingConversionSummary.potentialValueJpy <= 0) fail("marketing conversion summary missing potential JPY value");
if (marketingConversionSummary.violations.length !== 0) fail("marketing conversion summary should not report seed violations");

const malformedConversionData = recordTools.cloneData(data);
malformedConversionData.marketingConversionEvents[0] = {
  ...malformedConversionData.marketingConversionEvents[0],
  livePixelEnabled: true,
  externalAdApiWrite: true,
  invasiveTracking: true,
  storesPersonalData: true,
  productionAnalyticsCredential: true,
  webhookEnabled: true,
  crossSiteIdentifier: true,
  readinessChecks: []
};
const malformedConversionSummary = recordTools.summarizeMarketingConversionState(malformedConversionData);
if (malformedConversionSummary.status !== "blocked" || malformedConversionSummary.violations.length < 2) fail("marketing conversion summary did not flag live tracking/provider violations");

const conversionCreateResult = recordTools.createMarketingConversionEventRecords(data, {
  campaignRouteId: "campaign-services-crm-database",
  eventType: "consult_booking",
  conversionValueJpy: 180000,
  note: "Verifier created a local CRM audit conversion KPI without live tracking."
}, { now: "2026-06-01T12:06:00+09:00" });
if (conversionCreateResult.data.marketingConversionEvents.length !== data.marketingConversionEvents.length + 1) fail("marketing conversion create did not add an event");
if (conversionCreateResult.records.event.livePixelEnabled || conversionCreateResult.records.event.externalAdApiWrite || conversionCreateResult.records.event.invasiveTracking || conversionCreateResult.records.event.productionAnalyticsCredential || conversionCreateResult.records.event.webhookEnabled) {
  fail("marketing conversion create enabled live tracking, provider writes, credentials, or webhooks");
}
if (conversionCreateResult.records.receipt.kind !== "marketing-conversion") fail("marketing conversion create missing receipt kind");

const conversionTransitionResult = recordTools.transitionMarketingConversionEventRecords(data, {
  eventId: "conversion-ja-diagnostic-submit",
  action: "record-conversion",
  note: "Verifier recorded a local diagnostic conversion without live pixels, external ad writes, credentials, webhooks, or invasive tracking."
}, { now: "2026-06-01T12:07:00+09:00" });
if (conversionTransitionResult.records.event.status !== "converted") fail("marketing conversion transition did not record converted status");
if (conversionTransitionResult.records.event.conversionStage !== "converted") fail("marketing conversion transition did not update conversion stage");
if (conversionTransitionResult.records.receipt.kind !== "marketing-conversion") fail("marketing conversion transition missing receipt kind");
if (conversionTransitionResult.records.healthCheck.target !== "monitor-marketing-conversions") fail("marketing conversion transition missing monitor target");
if (conversionTransitionResult.records.healthCheck.effect !== "marketing-conversion-readiness") fail("marketing conversion transition missing monitor effect");
if (conversionTransitionResult.records.healthCheck.customerVisible !== false) fail("marketing conversion health check must remain internal");
if (conversionTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("marketing conversion transition created a customer-visible notification event");
if (conversionTransitionResult.records.event.livePixelEnabled || conversionTransitionResult.records.event.externalAdApiWrite || conversionTransitionResult.records.event.invasiveTracking || conversionTransitionResult.records.event.storesPersonalData || conversionTransitionResult.records.event.productionAnalyticsCredential || conversionTransitionResult.records.event.webhookEnabled || conversionTransitionResult.records.event.crossSiteIdentifier) {
  fail("marketing conversion transition enabled live tracking or external write safeguards");
}

const providerAdapterSummary = recordTools.summarizeProviderAdapterSelectionState(data);
if (providerAdapterSummary.candidateCount !== data.providerAdapterCandidates.length) fail("provider adapter summary total is wrong");
if (providerAdapterSummary.readyCandidates !== data.providerAdapterCandidates.length) fail("provider adapter summary missing ready candidates");
if (providerAdapterSummary.sandboxOnly !== data.providerAdapterCandidates.length) fail("provider adapter summary missing sandbox-only candidates");
if (providerAdapterSummary.noLiveProvider !== data.providerAdapterCandidates.length) fail("provider adapter summary no-live-provider count is wrong");
if (providerAdapterSummary.noSecrets !== data.providerAdapterCandidates.length) fail("provider adapter summary no-secrets count is wrong");
if (providerAdapterSummary.highRiskCandidates < 3) fail("provider adapter summary missing high-risk candidates");
if (providerAdapterSummary.legalReviewRequired < 3) fail("provider adapter summary missing legal-review candidates");
if (providerAdapterSummary.privacyReviewRequired < 6) fail("provider adapter summary missing privacy-review candidates");
if (providerAdapterSummary.violations.length !== 0) fail("provider adapter summary should not report seed violations");

const malformedProviderAdapterData = recordTools.cloneData(data);
malformedProviderAdapterData.providerAdapterCandidates[0] = {
  ...malformedProviderAdapterData.providerAdapterCandidates[0],
  liveApiCalls: true,
  productionEnabled: true,
  secretsPresent: true,
  credentialsStored: true,
  oauthConfigured: true,
  webhookEnabled: true,
  externalProviderWrite: true,
  customerVisible: true,
  readinessChecks: []
};
const malformedProviderAdapterSummary = recordTools.summarizeProviderAdapterSelectionState(malformedProviderAdapterData);
if (malformedProviderAdapterSummary.status !== "blocked" || malformedProviderAdapterSummary.violations.length < 3) fail("provider adapter summary did not flag live provider/secret violations");

const providerAdapterCreateResult = recordTools.createProviderAdapterCandidateRecords(data, {
  providerFamily: "analytics-advertising",
  targetProvider: "sandbox conversion test adapter",
  readinessChecks: ["no-live-pixel", "no-external-ad-api-write", "no-invasive-tracking"],
  goCriteria: ["Sandbox-only evaluation"],
  blockers: ["No production conversion writes"],
  note: "Verifier created a provider adapter candidate without live provider behavior."
}, { now: "2026-06-01T12:11:00+09:00" });
if (providerAdapterCreateResult.data.providerAdapterCandidates.length !== data.providerAdapterCandidates.length + 1) fail("provider adapter create did not add a candidate");
if (providerAdapterCreateResult.records.candidate.liveApiCalls || providerAdapterCreateResult.records.candidate.secretsPresent || providerAdapterCreateResult.records.candidate.oauthConfigured || providerAdapterCreateResult.records.candidate.webhookEnabled || providerAdapterCreateResult.records.candidate.externalProviderWrite) {
  fail("provider adapter create enabled live API, secrets, OAuth, webhooks, or provider writes");
}
if (providerAdapterCreateResult.records.receipt.kind !== "provider-adapter-selection") fail("provider adapter create missing receipt kind");

const providerAdapterTransitionResult = recordTools.transitionProviderAdapterCandidateRecords(data, {
  candidateId: "provider-adapter-payment-checkout",
  action: "approve-sandbox-only",
  note: "Verifier approved sandbox-only checkout review without live API calls, secrets, OAuth, webhooks, provider writes, or payment capture."
}, { now: "2026-06-01T12:12:00+09:00" });
if (providerAdapterTransitionResult.records.candidate.status !== "approved") fail("provider adapter transition did not approve sandbox-only status");
if (providerAdapterTransitionResult.records.candidate.goNoGoState !== "approved-sandbox-only") fail("provider adapter transition did not set approved-sandbox-only state");
if (providerAdapterTransitionResult.records.receipt.kind !== "provider-adapter-selection") fail("provider adapter transition missing receipt kind");
if (providerAdapterTransitionResult.records.healthCheck.target !== "monitor-provider-adapters") fail("provider adapter transition missing monitor target");
if (providerAdapterTransitionResult.records.healthCheck.effect !== "provider-adapter-selection-readiness") fail("provider adapter transition missing monitor effect");
if (providerAdapterTransitionResult.records.healthCheck.customerVisible !== false) fail("provider adapter health check must remain internal");
if (providerAdapterTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("provider adapter transition created a customer-visible notification event");
if (providerAdapterTransitionResult.records.candidate.liveApiCalls || providerAdapterTransitionResult.records.candidate.productionEnabled || providerAdapterTransitionResult.records.candidate.secretsPresent || providerAdapterTransitionResult.records.candidate.credentialsStored || providerAdapterTransitionResult.records.candidate.oauthConfigured || providerAdapterTransitionResult.records.candidate.webhookEnabled || providerAdapterTransitionResult.records.candidate.externalProviderWrite) {
  fail("provider adapter transition enabled live provider or secret safeguards");
}

const marketingAnalyticsSummary = recordTools.summarizeMarketingAnalyticsAdapterPrototypeState(data);
if (marketingAnalyticsSummary.prototypeCount !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary total is wrong");
if (marketingAnalyticsSummary.payloadReady < 1) fail("marketing analytics prototype summary missing payload-ready prototype");
if (marketingAnalyticsSummary.sandboxOnly !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary missing sandbox-only prototypes");
if (marketingAnalyticsSummary.localOnly !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary missing local-only prototypes");
if (marketingAnalyticsSummary.noLiveTracking !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary no-live-tracking count is wrong");
if (marketingAnalyticsSummary.noCredentials !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary no-credentials count is wrong");
if (marketingAnalyticsSummary.noPersonalData !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary no-personal-data count is wrong");
if (marketingAnalyticsSummary.noCustomerVisibleAnalytics !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary no-customer-visible count is wrong");
if (marketingAnalyticsSummary.privacyConsentReady !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary privacy/consent count is wrong");
if (marketingAnalyticsSummary.under19ConsentGated !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary under-19 consent count is wrong");
if (marketingAnalyticsSummary.candidateLinked !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary candidate link count is wrong");
if (marketingAnalyticsSummary.eventLinked !== data.marketingAnalyticsAdapterPrototypes.length) fail("marketing analytics prototype summary event link count is wrong");
if (marketingAnalyticsSummary.violations.length !== 0) fail("marketing analytics prototype summary should not report seed violations");

const malformedMarketingAnalyticsData = recordTools.cloneData(data);
malformedMarketingAnalyticsData.marketingAnalyticsAdapterPrototypes[0] = {
  ...malformedMarketingAnalyticsData.marketingAnalyticsAdapterPrototypes[0],
  livePixelEnabled: true,
  externalAdApiWrite: true,
  liveApiCalls: true,
  externalProviderWrite: true,
  productionEnabled: true,
  invasiveTracking: true,
  storesPersonalData: true,
  productionAnalyticsCredential: true,
  secretsPresent: true,
  credentialsStored: true,
  storesCredentials: true,
  oauthConfigured: true,
  webhookEnabled: true,
  crossSiteIdentifier: true,
  thirdPartyCookieEnabled: true,
  fingerprintingEnabled: true,
  crossDeviceIdentityEnabled: true,
  customerVisible: true,
  publicProofSurface: true,
  legalReviewRequired: false,
  privacyReviewRequired: false,
  consentBoundaryRequired: false,
  under19ConsentGated: false,
  noPaidActionBeforeConsent: false,
  readinessChecks: [],
  payloadPreview: []
};
const malformedMarketingAnalyticsSummary = recordTools.summarizeMarketingAnalyticsAdapterPrototypeState(malformedMarketingAnalyticsData);
if (malformedMarketingAnalyticsSummary.status !== "blocked" || malformedMarketingAnalyticsSummary.violations.length < 5) fail("marketing analytics prototype summary did not flag live tracking/provider/privacy violations");

const marketingAnalyticsCreateResult = recordTools.createMarketingAnalyticsAdapterPrototypeRecords(data, {
  providerCandidateId: "provider-adapter-analytics-ads",
  sourceEventIds: ["conversion-ja-diagnostic-submit", "conversion-under19-compatibility-request"],
  note: "Verifier created a local analytics conversion payload preview without live pixels, ad API writes, credentials, webhooks, provider writes, personal-data storage, or customer-visible analytics."
}, { now: "2026-06-01T12:12:30+09:00" });
if (marketingAnalyticsCreateResult.data.marketingAnalyticsAdapterPrototypes.length !== data.marketingAnalyticsAdapterPrototypes.length + 1) fail("marketing analytics prototype create did not add a prototype");
if (marketingAnalyticsCreateResult.records.prototype.livePixelEnabled || marketingAnalyticsCreateResult.records.prototype.externalAdApiWrite || marketingAnalyticsCreateResult.records.prototype.liveApiCalls || marketingAnalyticsCreateResult.records.prototype.externalProviderWrite || marketingAnalyticsCreateResult.records.prototype.productionEnabled || marketingAnalyticsCreateResult.records.prototype.invasiveTracking || marketingAnalyticsCreateResult.records.prototype.storesPersonalData || marketingAnalyticsCreateResult.records.prototype.productionAnalyticsCredential || marketingAnalyticsCreateResult.records.prototype.secretsPresent || marketingAnalyticsCreateResult.records.prototype.credentialsStored || marketingAnalyticsCreateResult.records.prototype.storesCredentials || marketingAnalyticsCreateResult.records.prototype.oauthConfigured || marketingAnalyticsCreateResult.records.prototype.webhookEnabled || marketingAnalyticsCreateResult.records.prototype.crossSiteIdentifier || marketingAnalyticsCreateResult.records.prototype.thirdPartyCookieEnabled || marketingAnalyticsCreateResult.records.prototype.fingerprintingEnabled || marketingAnalyticsCreateResult.records.prototype.crossDeviceIdentityEnabled || marketingAnalyticsCreateResult.records.prototype.customerVisible || marketingAnalyticsCreateResult.records.prototype.publicProofSurface) {
  fail("marketing analytics prototype create enabled live provider behavior, tracking, secrets, identity, or customer-visible safeguards");
}
if (!marketingAnalyticsCreateResult.records.prototype.payloadPreview.length) fail("marketing analytics prototype create did not generate a payload preview");
if (!marketingAnalyticsCreateResult.records.prototype.payloadPreview.some((item) => item.audienceTier === "under19" && item.guardianConsentRequired === true && item.noPaidActionBeforeConsent === true)) fail("marketing analytics prototype create did not preserve under-19 consent-gated preview");
if (marketingAnalyticsCreateResult.records.receipt.kind !== "marketing-analytics-adapter-prototype") fail("marketing analytics prototype create missing receipt kind");
if (marketingAnalyticsCreateResult.records.healthCheck.target !== "monitor-marketing-analytics-prototype") fail("marketing analytics prototype create missing monitor target");
if (marketingAnalyticsCreateResult.records.healthCheck.effect !== "marketing-analytics-sandbox-proof") fail("marketing analytics prototype create missing monitor effect");
if (marketingAnalyticsCreateResult.data.notificationEvents.length !== data.notificationEvents.length) fail("marketing analytics prototype create created a customer-visible notification event");

const marketingAnalyticsTransitionResult = recordTools.transitionMarketingAnalyticsAdapterPrototypeRecords(data, {
  prototypeId: "marketing-analytics-sandbox-conversion-preview",
  action: "approve-sandbox",
  note: "Verifier approved sandbox analytics payload proof without live pixels, ad API writes, analytics credentials, webhooks, provider writes, invasive tracking, personal-data storage, cross-site identifiers, customer-visible analytics, or under-19 paid action before consent."
}, { now: "2026-06-01T12:12:45+09:00" });
if (marketingAnalyticsTransitionResult.records.prototype.status !== "approved") fail("marketing analytics prototype transition did not approve sandbox status");
if (marketingAnalyticsTransitionResult.records.prototype.prototypeStatus !== "sandbox-approved") fail("marketing analytics prototype transition did not set sandbox-approved state");
if (marketingAnalyticsTransitionResult.records.receipt.kind !== "marketing-analytics-adapter-prototype") fail("marketing analytics prototype transition missing receipt kind");
if (marketingAnalyticsTransitionResult.records.healthCheck.effect !== "marketing-analytics-sandbox-proof") fail("marketing analytics prototype transition missing monitor effect");
if (marketingAnalyticsTransitionResult.records.healthCheck.customerVisible !== false) fail("marketing analytics prototype health check must remain internal");
if (marketingAnalyticsTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("marketing analytics prototype transition created a customer-visible notification event");
if (marketingAnalyticsTransitionResult.records.prototype.livePixelEnabled || marketingAnalyticsTransitionResult.records.prototype.externalAdApiWrite || marketingAnalyticsTransitionResult.records.prototype.liveApiCalls || marketingAnalyticsTransitionResult.records.prototype.externalProviderWrite || marketingAnalyticsTransitionResult.records.prototype.productionEnabled || marketingAnalyticsTransitionResult.records.prototype.invasiveTracking || marketingAnalyticsTransitionResult.records.prototype.storesPersonalData || marketingAnalyticsTransitionResult.records.prototype.productionAnalyticsCredential || marketingAnalyticsTransitionResult.records.prototype.secretsPresent || marketingAnalyticsTransitionResult.records.prototype.credentialsStored || marketingAnalyticsTransitionResult.records.prototype.storesCredentials || marketingAnalyticsTransitionResult.records.prototype.oauthConfigured || marketingAnalyticsTransitionResult.records.prototype.webhookEnabled || marketingAnalyticsTransitionResult.records.prototype.crossSiteIdentifier || marketingAnalyticsTransitionResult.records.prototype.thirdPartyCookieEnabled || marketingAnalyticsTransitionResult.records.prototype.fingerprintingEnabled || marketingAnalyticsTransitionResult.records.prototype.crossDeviceIdentityEnabled || marketingAnalyticsTransitionResult.records.prototype.customerVisible || marketingAnalyticsTransitionResult.records.prototype.publicProofSurface || !marketingAnalyticsTransitionResult.records.prototype.under19ConsentGated || !marketingAnalyticsTransitionResult.records.prototype.noPaidActionBeforeConsent) {
  fail("marketing analytics prototype transition enabled live provider, tracking, secret, customer-visible, or under-19 safeguards");
}

const calendarAdapterSummary = recordTools.summarizeCalendarAdapterPrototypeState(data);
if (calendarAdapterSummary.prototypeCount !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary total is wrong");
if (calendarAdapterSummary.payloadReady < 1) fail("calendar adapter summary missing payload-ready prototype");
if (calendarAdapterSummary.sandboxOnly !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary missing sandbox-only prototypes");
if (calendarAdapterSummary.localOnly !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary missing local-only prototypes");
if (calendarAdapterSummary.noLiveProvider !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary no-live-provider count is wrong");
if (calendarAdapterSummary.noSecrets !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary no-secrets count is wrong");
if (calendarAdapterSummary.noInvitationSend !== data.calendarAdapterPrototypes.length) fail("calendar adapter summary no-invitation-send count is wrong");
if (calendarAdapterSummary.violations.length !== 0) fail("calendar adapter summary should not report seed violations");

const malformedCalendarAdapterData = recordTools.cloneData(data);
malformedCalendarAdapterData.calendarAdapterPrototypes[0] = {
  ...malformedCalendarAdapterData.calendarAdapterPrototypes[0],
  liveApiCalls: true,
  liveSyncEnabled: true,
  sendsInvitations: true,
  externalProviderWrite: true,
  secretsPresent: true,
  credentialsStored: true,
  oauthConfigured: true,
  webhookEnabled: true,
  customerVisible: true,
  readinessChecks: [],
  payloadPreview: []
};
const malformedCalendarAdapterSummary = recordTools.summarizeCalendarAdapterPrototypeState(malformedCalendarAdapterData);
if (malformedCalendarAdapterSummary.status !== "blocked" || malformedCalendarAdapterSummary.violations.length < 3) fail("calendar adapter summary did not flag live provider/secret violations");

const calendarAdapterCreateResult = recordTools.createCalendarAdapterPrototypeRecords(data, {
  providerCandidateId: "provider-adapter-calendar-google",
  note: "Verifier created a local calendar payload preview without live provider behavior."
}, { now: "2026-06-01T12:13:00+09:00" });
if (calendarAdapterCreateResult.data.calendarAdapterPrototypes.length !== data.calendarAdapterPrototypes.length + 1) fail("calendar adapter create did not add a prototype");
if (calendarAdapterCreateResult.records.prototype.liveApiCalls || calendarAdapterCreateResult.records.prototype.liveSyncEnabled || calendarAdapterCreateResult.records.prototype.sendsInvitations || calendarAdapterCreateResult.records.prototype.externalProviderWrite || calendarAdapterCreateResult.records.prototype.secretsPresent || calendarAdapterCreateResult.records.prototype.oauthConfigured || calendarAdapterCreateResult.records.prototype.webhookEnabled) {
  fail("calendar adapter create enabled live provider behavior, secrets, OAuth, or webhooks");
}
if (!calendarAdapterCreateResult.records.prototype.payloadPreview.length) fail("calendar adapter create did not generate a payload preview");
if (calendarAdapterCreateResult.records.receipt.kind !== "calendar-adapter-prototype") fail("calendar adapter create missing receipt kind");
if (calendarAdapterCreateResult.records.healthCheck.target !== "monitor-calendar-adapter") fail("calendar adapter create missing monitor target");
if (calendarAdapterCreateResult.data.notificationEvents.length !== data.notificationEvents.length) fail("calendar adapter create created a customer-visible notification event");

const calendarAdapterTransitionResult = recordTools.transitionCalendarAdapterPrototypeRecords(data, {
  prototypeId: "calendar-adapter-google-sandbox-export",
  action: "approve-sandbox",
  note: "Verifier approved sandbox calendar payload proof without live API calls, OAuth, secrets, webhooks, provider writes, or invitations."
}, { now: "2026-06-01T12:14:00+09:00" });
if (calendarAdapterTransitionResult.records.prototype.status !== "approved") fail("calendar adapter transition did not approve sandbox status");
if (calendarAdapterTransitionResult.records.prototype.prototypeStatus !== "sandbox-approved") fail("calendar adapter transition did not set sandbox-approved state");
if (calendarAdapterTransitionResult.records.receipt.kind !== "calendar-adapter-prototype") fail("calendar adapter transition missing receipt kind");
if (calendarAdapterTransitionResult.records.healthCheck.effect !== "calendar-adapter-sandbox-proof") fail("calendar adapter transition missing monitor effect");
if (calendarAdapterTransitionResult.records.healthCheck.customerVisible !== false) fail("calendar adapter health check must remain internal");
if (calendarAdapterTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("calendar adapter transition created a customer-visible notification event");
if (calendarAdapterTransitionResult.records.prototype.liveApiCalls || calendarAdapterTransitionResult.records.prototype.liveSyncEnabled || calendarAdapterTransitionResult.records.prototype.sendsInvitations || calendarAdapterTransitionResult.records.prototype.externalProviderWrite || calendarAdapterTransitionResult.records.prototype.productionEnabled || calendarAdapterTransitionResult.records.prototype.secretsPresent || calendarAdapterTransitionResult.records.prototype.credentialsStored || calendarAdapterTransitionResult.records.prototype.oauthConfigured || calendarAdapterTransitionResult.records.prototype.webhookEnabled) {
  fail("calendar adapter transition enabled live provider or secret safeguards");
}

const notificationPrototypeSummary = recordTools.summarizeNotificationProviderPrototypeState(data);
if (notificationPrototypeSummary.prototypeCount !== data.notificationProviderPrototypes.length) fail("notification prototype summary total is wrong");
if (notificationPrototypeSummary.payloadReady < 1) fail("notification prototype summary missing payload-ready prototype");
if (notificationPrototypeSummary.sandboxOnly !== data.notificationProviderPrototypes.length) fail("notification prototype summary missing sandbox-only prototypes");
if (notificationPrototypeSummary.localOnly !== data.notificationProviderPrototypes.length) fail("notification prototype summary missing local-only prototypes");
if (notificationPrototypeSummary.noLiveSend !== data.notificationProviderPrototypes.length) fail("notification prototype summary no-live-send count is wrong");
if (notificationPrototypeSummary.noSecrets !== data.notificationProviderPrototypes.length) fail("notification prototype summary no-secrets count is wrong");
if (notificationPrototypeSummary.noCustomerVisibleSend !== data.notificationProviderPrototypes.length) fail("notification prototype summary no-customer-visible-send count is wrong");
if (notificationPrototypeSummary.violations.length !== 0) fail("notification prototype summary should not report seed violations");

const malformedNotificationPrototypeData = recordTools.cloneData(data);
malformedNotificationPrototypeData.notificationProviderPrototypes[0] = {
  ...malformedNotificationPrototypeData.notificationProviderPrototypes[0],
  liveSendEnabled: true,
  liveEmailSend: true,
  liveLineSend: true,
  liveSmsSend: true,
  liveNexusSend: true,
  externalProviderWrite: true,
  secretsPresent: true,
  credentialsStored: true,
  storesCredentials: true,
  oauthConfigured: true,
  webhookEnabled: true,
  customerVisible: true,
  readinessChecks: [],
  payloadPreview: []
};
const malformedNotificationPrototypeSummary = recordTools.summarizeNotificationProviderPrototypeState(malformedNotificationPrototypeData);
if (malformedNotificationPrototypeSummary.status !== "blocked" || malformedNotificationPrototypeSummary.violations.length < 3) fail("notification prototype summary did not flag live provider/secret violations");

const notificationPrototypeCreateResult = recordTools.createNotificationProviderPrototypeRecords(data, {
  providerCandidateId: "provider-adapter-notification-line-sms",
  sourceHandoffId: "notification-template-consent-readiness",
  note: "Verifier created a local notification payload preview without live provider behavior."
}, { now: "2026-06-01T12:15:00+09:00" });
if (notificationPrototypeCreateResult.data.notificationProviderPrototypes.length !== data.notificationProviderPrototypes.length + 1) fail("notification prototype create did not add a prototype");
if (notificationPrototypeCreateResult.records.prototype.liveSendEnabled || notificationPrototypeCreateResult.records.prototype.liveEmailSend || notificationPrototypeCreateResult.records.prototype.liveLineSend || notificationPrototypeCreateResult.records.prototype.liveSmsSend || notificationPrototypeCreateResult.records.prototype.liveNexusSend || notificationPrototypeCreateResult.records.prototype.externalProviderWrite || notificationPrototypeCreateResult.records.prototype.productionEnabled || notificationPrototypeCreateResult.records.prototype.secretsPresent || notificationPrototypeCreateResult.records.prototype.credentialsStored || notificationPrototypeCreateResult.records.prototype.storesCredentials || notificationPrototypeCreateResult.records.prototype.oauthConfigured || notificationPrototypeCreateResult.records.prototype.webhookEnabled) {
  fail("notification prototype create enabled live provider behavior, secrets, OAuth, or webhooks");
}
if (!notificationPrototypeCreateResult.records.prototype.payloadPreview.length) fail("notification prototype create did not generate a payload preview");
if (notificationPrototypeCreateResult.records.receipt.kind !== "notification-provider-prototype") fail("notification prototype create missing receipt kind");
if (notificationPrototypeCreateResult.records.healthCheck.target !== "monitor-notification-prototype") fail("notification prototype create missing monitor target");
if (notificationPrototypeCreateResult.data.notificationEvents.length !== data.notificationEvents.length) fail("notification prototype create created a customer-visible notification event");

const notificationPrototypeTransitionResult = recordTools.transitionNotificationProviderPrototypeRecords(data, {
  prototypeId: "notification-provider-sandbox-message-preview",
  action: "approve-sandbox",
  note: "Verifier approved sandbox notification payload proof without live email, LINE, SMS, NEXUS, OAuth, secrets, webhooks, provider writes, or customer-visible sends."
}, { now: "2026-06-01T12:16:00+09:00" });
if (notificationPrototypeTransitionResult.records.prototype.status !== "approved") fail("notification prototype transition did not approve sandbox status");
if (notificationPrototypeTransitionResult.records.prototype.prototypeStatus !== "sandbox-approved") fail("notification prototype transition did not set sandbox-approved state");
if (notificationPrototypeTransitionResult.records.receipt.kind !== "notification-provider-prototype") fail("notification prototype transition missing receipt kind");
if (notificationPrototypeTransitionResult.records.healthCheck.effect !== "notification-provider-sandbox-proof") fail("notification prototype transition missing monitor effect");
if (notificationPrototypeTransitionResult.records.healthCheck.customerVisible !== false) fail("notification prototype health check must remain internal");
if (notificationPrototypeTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("notification prototype transition created a customer-visible notification event");
if (notificationPrototypeTransitionResult.records.prototype.liveSendEnabled || notificationPrototypeTransitionResult.records.prototype.liveEmailSend || notificationPrototypeTransitionResult.records.prototype.liveLineSend || notificationPrototypeTransitionResult.records.prototype.liveSmsSend || notificationPrototypeTransitionResult.records.prototype.liveNexusSend || notificationPrototypeTransitionResult.records.prototype.externalProviderWrite || notificationPrototypeTransitionResult.records.prototype.productionEnabled || notificationPrototypeTransitionResult.records.prototype.secretsPresent || notificationPrototypeTransitionResult.records.prototype.credentialsStored || notificationPrototypeTransitionResult.records.prototype.storesCredentials || notificationPrototypeTransitionResult.records.prototype.oauthConfigured || notificationPrototypeTransitionResult.records.prototype.webhookEnabled) {
  fail("notification prototype transition enabled live provider or secret safeguards");
}

const paymentPrototypeSummary = recordTools.summarizePaymentProviderPrototypeState(data);
if (paymentPrototypeSummary.prototypeCount !== data.paymentProviderPrototypes.length) fail("payment prototype summary total is wrong");
if (paymentPrototypeSummary.payloadReady < 1) fail("payment prototype summary missing payload-ready prototype");
if (paymentPrototypeSummary.sandboxOnly !== data.paymentProviderPrototypes.length) fail("payment prototype summary missing sandbox-only prototypes");
if (paymentPrototypeSummary.localOnly !== data.paymentProviderPrototypes.length) fail("payment prototype summary missing local-only prototypes");
if (paymentPrototypeSummary.noLivePayment !== data.paymentProviderPrototypes.length) fail("payment prototype summary no-live-payment count is wrong");
if (paymentPrototypeSummary.noSecrets !== data.paymentProviderPrototypes.length) fail("payment prototype summary no-secrets count is wrong");
if (paymentPrototypeSummary.noCustomerVisiblePayment !== data.paymentProviderPrototypes.length) fail("payment prototype summary no-customer-visible-payment count is wrong");
if (paymentPrototypeSummary.noPaymentCapture !== data.paymentProviderPrototypes.length) fail("payment prototype summary no-payment-capture count is wrong");
if (paymentPrototypeSummary.legalTaxPrivacyReady !== data.paymentProviderPrototypes.length) fail("payment prototype summary legal/tax/privacy count is wrong");
if (paymentPrototypeSummary.under19Guarded !== data.paymentProviderPrototypes.length) fail("payment prototype summary under-19 guard count is wrong");
if (paymentPrototypeSummary.violations.length !== 0) fail("payment prototype summary should not report seed violations");

const malformedPaymentPrototypeData = recordTools.cloneData(data);
malformedPaymentPrototypeData.paymentProviderPrototypes[0] = {
  ...malformedPaymentPrototypeData.paymentProviderPrototypes[0],
  livePaymentEnabled: true,
  liveCheckoutEnabled: true,
  liveCaptureEnabled: true,
  liveRefundEnabled: true,
  invoiceSendEnabled: true,
  checkoutSessionCreated: true,
  paymentLinkCreated: true,
  capturesPayment: true,
  externalProviderWrite: true,
  secretsPresent: true,
  credentialsStored: true,
  storesCredentials: true,
  oauthConfigured: true,
  webhookEnabled: true,
  customerVisible: true,
  legalReviewRequired: false,
  taxReviewRequired: false,
  privacyReviewRequired: false,
  under19Guarded: false,
  readinessChecks: [],
  payloadPreview: []
};
const malformedPaymentPrototypeSummary = recordTools.summarizePaymentProviderPrototypeState(malformedPaymentPrototypeData);
if (malformedPaymentPrototypeSummary.status !== "blocked" || malformedPaymentPrototypeSummary.violations.length < 4) fail("payment prototype summary did not flag live provider/secret/legal violations");

const paymentPrototypeCreateResult = recordTools.createPaymentProviderPrototypeRecords(data, {
  providerCandidateId: "provider-adapter-payment-checkout",
  sourceHandoffId: "payment-provider-checkout-readiness",
  note: "Verifier created a local payment payload preview without live provider behavior."
}, { now: "2026-06-01T12:17:00+09:00" });
if (paymentPrototypeCreateResult.data.paymentProviderPrototypes.length !== data.paymentProviderPrototypes.length + 1) fail("payment prototype create did not add a prototype");
if (paymentPrototypeCreateResult.records.prototype.livePaymentEnabled || paymentPrototypeCreateResult.records.prototype.liveCheckoutEnabled || paymentPrototypeCreateResult.records.prototype.liveCaptureEnabled || paymentPrototypeCreateResult.records.prototype.liveRefundEnabled || paymentPrototypeCreateResult.records.prototype.invoiceSendEnabled || paymentPrototypeCreateResult.records.prototype.checkoutSessionCreated || paymentPrototypeCreateResult.records.prototype.paymentLinkCreated || paymentPrototypeCreateResult.records.prototype.capturesPayment || paymentPrototypeCreateResult.records.prototype.externalProviderWrite || paymentPrototypeCreateResult.records.prototype.productionEnabled || paymentPrototypeCreateResult.records.prototype.secretsPresent || paymentPrototypeCreateResult.records.prototype.credentialsStored || paymentPrototypeCreateResult.records.prototype.storesCredentials || paymentPrototypeCreateResult.records.prototype.oauthConfigured || paymentPrototypeCreateResult.records.prototype.webhookEnabled) {
  fail("payment prototype create enabled live provider behavior, secrets, OAuth, or webhooks");
}
if (!paymentPrototypeCreateResult.records.prototype.payloadPreview.length) fail("payment prototype create did not generate a payload preview");
if (paymentPrototypeCreateResult.records.receipt.kind !== "payment-provider-prototype") fail("payment prototype create missing receipt kind");
if (paymentPrototypeCreateResult.records.healthCheck.target !== "monitor-payment-prototype") fail("payment prototype create missing monitor target");
if (paymentPrototypeCreateResult.data.notificationEvents.length !== data.notificationEvents.length) fail("payment prototype create created a customer-visible notification event");

const paymentPrototypeTransitionResult = recordTools.transitionPaymentProviderPrototypeRecords(data, {
  prototypeId: "payment-provider-sandbox-checkout-preview",
  action: "approve-sandbox",
  note: "Verifier approved sandbox payment payload proof without live checkout, invoice sending, capture, refunds, OAuth, secrets, webhooks, provider writes, or customer-visible payment requests."
}, { now: "2026-06-01T12:18:00+09:00" });
if (paymentPrototypeTransitionResult.records.prototype.status !== "approved") fail("payment prototype transition did not approve sandbox status");
if (paymentPrototypeTransitionResult.records.prototype.prototypeStatus !== "sandbox-approved") fail("payment prototype transition did not set sandbox-approved state");
if (paymentPrototypeTransitionResult.records.receipt.kind !== "payment-provider-prototype") fail("payment prototype transition missing receipt kind");
if (paymentPrototypeTransitionResult.records.healthCheck.effect !== "payment-provider-sandbox-proof") fail("payment prototype transition missing monitor effect");
if (paymentPrototypeTransitionResult.records.healthCheck.customerVisible !== false) fail("payment prototype health check must remain internal");
if (paymentPrototypeTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("payment prototype transition created a customer-visible notification event");
if (paymentPrototypeTransitionResult.records.prototype.livePaymentEnabled || paymentPrototypeTransitionResult.records.prototype.liveCheckoutEnabled || paymentPrototypeTransitionResult.records.prototype.liveCaptureEnabled || paymentPrototypeTransitionResult.records.prototype.liveRefundEnabled || paymentPrototypeTransitionResult.records.prototype.invoiceSendEnabled || paymentPrototypeTransitionResult.records.prototype.checkoutSessionCreated || paymentPrototypeTransitionResult.records.prototype.paymentLinkCreated || paymentPrototypeTransitionResult.records.prototype.capturesPayment || paymentPrototypeTransitionResult.records.prototype.externalProviderWrite || paymentPrototypeTransitionResult.records.prototype.productionEnabled || paymentPrototypeTransitionResult.records.prototype.secretsPresent || paymentPrototypeTransitionResult.records.prototype.credentialsStored || paymentPrototypeTransitionResult.records.prototype.storesCredentials || paymentPrototypeTransitionResult.records.prototype.oauthConfigured || paymentPrototypeTransitionResult.records.prototype.webhookEnabled || paymentPrototypeTransitionResult.records.prototype.customerVisible) {
  fail("payment prototype transition enabled live provider or secret safeguards");
}

const authPrototypeSummary = recordTools.summarizeAuthProviderPrototypeState(data);
if (authPrototypeSummary.prototypeCount !== data.authProviderPrototypes.length) fail("auth prototype summary total is wrong");
if (authPrototypeSummary.payloadReady < 1) fail("auth prototype summary missing payload-ready prototype");
if (authPrototypeSummary.sandboxOnly !== data.authProviderPrototypes.length) fail("auth prototype summary missing sandbox-only prototypes");
if (authPrototypeSummary.localOnly !== data.authProviderPrototypes.length) fail("auth prototype summary missing local-only prototypes");
if (authPrototypeSummary.noLiveAuth !== data.authProviderPrototypes.length) fail("auth prototype summary no-live-auth count is wrong");
if (authPrototypeSummary.noSecrets !== data.authProviderPrototypes.length) fail("auth prototype summary no-secrets count is wrong");
if (authPrototypeSummary.noCredentialStorage !== data.authProviderPrototypes.length) fail("auth prototype summary no-credential-storage count is wrong");
if (authPrototypeSummary.noTokenStorage !== data.authProviderPrototypes.length) fail("auth prototype summary no-token-storage count is wrong");
if (authPrototypeSummary.noExternalSession !== data.authProviderPrototypes.length) fail("auth prototype summary no-external-session count is wrong");
if (authPrototypeSummary.noCustomerVisibleAuth !== data.authProviderPrototypes.length) fail("auth prototype summary no-customer-visible-auth count is wrong");
if (authPrototypeSummary.rawAdminDenied !== data.authProviderPrototypes.length) fail("auth prototype summary raw-admin denial count is wrong");
if (authPrototypeSummary.rawMonitorDenied !== data.authProviderPrototypes.length) fail("auth prototype summary raw-monitor denial count is wrong");
if (authPrototypeSummary.violations.length !== 0) fail("auth prototype summary should not report seed violations");

const malformedAuthPrototypeData = recordTools.cloneData(data);
malformedAuthPrototypeData.authProviderPrototypes[0] = {
  ...malformedAuthPrototypeData.authProviderPrototypes[0],
  liveAuthEnabled: true,
  liveLoginEnabled: true,
  productionAuthEnabled: true,
  identityProviderWrite: true,
  externalProviderWrite: true,
  externalSessionEnabled: true,
  oauthClientConfigured: true,
  oauthConfigured: true,
  secretsPresent: true,
  credentialsStored: true,
  storesCredentials: true,
  storesTokens: true,
  tokenStorageEnabled: true,
  refreshTokenStorageEnabled: true,
  webhookEnabled: true,
  customerVisible: true,
  rawAdminExposure: true,
  rawMonitorExposure: true,
  readinessChecks: [],
  payloadPreview: []
};
const malformedAuthPrototypeSummary = recordTools.summarizeAuthProviderPrototypeState(malformedAuthPrototypeData);
if (malformedAuthPrototypeSummary.status !== "blocked" || malformedAuthPrototypeSummary.violations.length < 4) fail("auth prototype summary did not flag live auth/secret/raw-exposure violations");

const authPrototypeCreateResult = recordTools.createAuthProviderPrototypeRecords(data, {
  providerCandidateId: "provider-adapter-auth-session",
  note: "Verifier created a local auth/session access payload preview without live identity-provider behavior."
}, { now: "2026-06-01T12:19:00+09:00" });
if (authPrototypeCreateResult.data.authProviderPrototypes.length !== data.authProviderPrototypes.length + 1) fail("auth prototype create did not add a prototype");
if (authPrototypeCreateResult.records.prototype.liveAuthEnabled || authPrototypeCreateResult.records.prototype.liveLoginEnabled || authPrototypeCreateResult.records.prototype.productionAuthEnabled || authPrototypeCreateResult.records.prototype.identityProviderWrite || authPrototypeCreateResult.records.prototype.externalProviderWrite || authPrototypeCreateResult.records.prototype.externalSessionEnabled || authPrototypeCreateResult.records.prototype.oauthClientConfigured || authPrototypeCreateResult.records.prototype.oauthConfigured || authPrototypeCreateResult.records.prototype.secretsPresent || authPrototypeCreateResult.records.prototype.credentialsStored || authPrototypeCreateResult.records.prototype.storesCredentials || authPrototypeCreateResult.records.prototype.storesTokens || authPrototypeCreateResult.records.prototype.tokenStorageEnabled || authPrototypeCreateResult.records.prototype.refreshTokenStorageEnabled || authPrototypeCreateResult.records.prototype.webhookEnabled) {
  fail("auth prototype create enabled live auth provider behavior, secrets, OAuth, tokens, refresh-token storage, or webhooks");
}
if (!authPrototypeCreateResult.records.prototype.payloadPreview.length) fail("auth prototype create did not generate a payload preview");
if (!authPrototypeCreateResult.records.prototype.payloadPreview.some((item) => item.surface === "monitor" && item.publicExposure === "denied")) fail("auth prototype create did not preserve raw monitor denial preview");
if (authPrototypeCreateResult.records.receipt.kind !== "auth-provider-prototype") fail("auth prototype create missing receipt kind");
if (authPrototypeCreateResult.records.healthCheck.target !== "monitor-auth-prototype") fail("auth prototype create missing monitor target");
if (authPrototypeCreateResult.data.notificationEvents.length !== data.notificationEvents.length) fail("auth prototype create created a customer-visible notification event");

const authPrototypeTransitionResult = recordTools.transitionAuthProviderPrototypeRecords(data, {
  prototypeId: "auth-provider-sandbox-access-preview",
  action: "approve-sandbox",
  note: "Verifier approved sandbox auth access proof without production login, OAuth, secrets, credentials, tokens, webhooks, provider writes, external sessions, or customer-visible auth behavior."
}, { now: "2026-06-01T12:20:00+09:00" });
if (authPrototypeTransitionResult.records.prototype.status !== "approved") fail("auth prototype transition did not approve sandbox status");
if (authPrototypeTransitionResult.records.prototype.prototypeStatus !== "sandbox-approved") fail("auth prototype transition did not set sandbox-approved state");
if (authPrototypeTransitionResult.records.receipt.kind !== "auth-provider-prototype") fail("auth prototype transition missing receipt kind");
if (authPrototypeTransitionResult.records.healthCheck.effect !== "auth-provider-sandbox-proof") fail("auth prototype transition missing monitor effect");
if (authPrototypeTransitionResult.records.healthCheck.customerVisible !== false) fail("auth prototype health check must remain internal");
if (authPrototypeTransitionResult.data.notificationEvents.length !== data.notificationEvents.length) fail("auth prototype transition created a customer-visible notification event");
if (authPrototypeTransitionResult.records.prototype.liveAuthEnabled || authPrototypeTransitionResult.records.prototype.liveLoginEnabled || authPrototypeTransitionResult.records.prototype.productionAuthEnabled || authPrototypeTransitionResult.records.prototype.identityProviderWrite || authPrototypeTransitionResult.records.prototype.externalProviderWrite || authPrototypeTransitionResult.records.prototype.externalSessionEnabled || authPrototypeTransitionResult.records.prototype.oauthClientConfigured || authPrototypeTransitionResult.records.prototype.oauthConfigured || authPrototypeTransitionResult.records.prototype.secretsPresent || authPrototypeTransitionResult.records.prototype.credentialsStored || authPrototypeTransitionResult.records.prototype.storesCredentials || authPrototypeTransitionResult.records.prototype.storesTokens || authPrototypeTransitionResult.records.prototype.tokenStorageEnabled || authPrototypeTransitionResult.records.prototype.refreshTokenStorageEnabled || authPrototypeTransitionResult.records.prototype.webhookEnabled || authPrototypeTransitionResult.records.prototype.customerVisible || authPrototypeTransitionResult.records.prototype.rawAdminExposure || authPrototypeTransitionResult.records.prototype.rawMonitorExposure) {
  fail("auth prototype transition enabled live provider, token, secret, customer-visible, or raw-exposure safeguards");
}

const accountHistorySummary = recordTools.summarizeCustomerAccountHistoryState(data);
if (accountHistorySummary.historyCount !== data.customers.length) fail("account history summary should cover every customer");
if (accountHistorySummary.timelineEvents < data.customerAccountHistories.length) fail("account history summary missing timeline events");
if (accountHistorySummary.customerVisibleEvents < 1) fail("account history summary missing customer-safe visible events");
if (accountHistorySummary.receiptLinked < 1) fail("account history summary missing receipt-linked records");
if (accountHistorySummary.localOnly !== data.customers.length) fail("account history summary should remain local-only");
if (accountHistorySummary.violations.length !== 0) fail("account history summary should not report seed violations");

const malformedAccountHistoryData = recordTools.cloneData(data);
malformedAccountHistoryData.customerAccountHistories[0] = {
  ...malformedAccountHistoryData.customerAccountHistories[0],
  visibility: "public",
  customerSafe: false,
  localOnly: false,
  liveProviderWrite: true,
  externalNotification: true,
  productionEnabled: true,
  statusTimeline: []
};
const malformedAccountHistorySummary = recordTools.summarizeCustomerAccountHistoryState(malformedAccountHistoryData);
if (malformedAccountHistorySummary.status !== "blocked" || malformedAccountHistorySummary.violations.length < 3) fail("account history summary did not flag public/live-provider violations");

const accountHistoryRefreshResult = recordTools.createCustomerAccountHistoryRecords(data, {
  customerId: "student-001",
  note: "Verifier refreshed controlled customer-safe account history without external sends."
}, { now: "2026-06-01T12:15:00+09:00" });
if (accountHistoryRefreshResult.data.customerAccountHistories.length !== data.customerAccountHistories.length) fail("account history refresh should replace the customer history record");
if (accountHistoryRefreshResult.data.receipts.length !== data.receipts.length + 1) fail("account history refresh did not create a receipt");
if (accountHistoryRefreshResult.data.notificationEvents.length !== data.notificationEvents.length) fail("account history refresh created a customer-visible notification event");
if (accountHistoryRefreshResult.records.history.liveProviderWrite || accountHistoryRefreshResult.records.history.externalNotification || accountHistoryRefreshResult.records.history.productionEnabled || !accountHistoryRefreshResult.records.history.localOnly) {
  fail("account history refresh enabled live provider behavior");
}
if (accountHistoryRefreshResult.records.receipt.kind !== "customer-account-history") fail("account history refresh missing receipt kind");

const checklist = read("../docs/first-commercial-slice-checklist.md");
for (const phrase of [
  "Public professional offer page",
  "Internal schedule/admin view",
  "Student/customer status view",
  "EPOCH MONITOR status page",
  "from intake through returned feedback",
  "Curriculum framework",
  "Package gameplan",
  "Campaign route",
  "Controlled public/customer access gateway record",
  "LIBRARY ledger sync/recovery handoff record",
  "Calendar provider handoff and invitation-readiness record",
  "Auth/session role handoffs",
  "Marketing conversion KPI events",
  "Provider adapter candidates",
  "Sandbox marketing analytics adapter prototype record",
  "Sandbox calendar adapter prototypes",
  "Sandbox auth provider prototypes",
  "Durable customer account history"
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
  "copy-policy violations",
  "marketingConversionEvents",
  "conversion KPI readiness",
  "no-live-tracking count"
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
  "accessGateways",
  "EPOCH MONITOR",
  "duplicateUi",
  "local-first",
  "live API integration"
]) {
  if (!routePlacementContract.includes(phrase)) fail(`SYNAPSE route placement contract missing phrase: ${phrase}`);
}

const accessGatewayContract = read("../docs/controlled-public-customer-access-gateway.md");
for (const phrase of [
  "Controlled Public And Customer Access Gateway",
  "accessGateways",
  "gateway-public-intake",
  "gateway-customer-status",
  "gateway-raw-admin",
  "gateway-raw-monitor",
  "summarizeAccessGatewayState",
  "transitionAccessGatewayRecords"
]) {
  if (!accessGatewayContract.includes(phrase)) fail(`access gateway contract missing phrase: ${phrase}`);
}

const librarySyncContract = read("../docs/library-ledger-sync-recovery-contract.md");
for (const phrase of [
  "LIBRARY Ledger Sync And Recovery Contract",
  "librarySyncHandoffs",
  "summarizeLibrarySyncState",
  "transitionLibrarySyncHandoffRecords",
  "library-sync-handoff",
  "customer-visible notification events"
]) {
  if (!librarySyncContract.includes(phrase)) fail(`LIBRARY sync contract missing phrase: ${phrase}`);
}

const calendarProviderContract = read("../docs/calendar-provider-handoff-invitation-contract.md");
for (const phrase of [
  "Calendar Provider Handoff And Invitation-Readiness Contract",
  "calendarProviderHandoffs",
  "summarizeCalendarProviderState",
  "transitionCalendarProviderHandoffRecords",
  "calendar-provider-handoff",
  "live provider writes",
  "customer-visible notification events"
]) {
  if (!calendarProviderContract.includes(phrase)) fail(`calendar provider contract missing phrase: ${phrase}`);
}

const notificationProviderContract = read("../docs/notification-provider-handoff-template-consent-contract.md");
for (const phrase of [
  "Notification Provider Handoff And Template Consent Contract",
  "notificationProviderHandoffs",
  "templatePolicy",
  "consentPolicy",
  "transitionNotificationProviderHandoffRecords",
  "notification-provider-handoff",
  "live provider send",
  "customer-visible notification event"
]) {
  if (!notificationProviderContract.includes(phrase)) fail(`notification provider contract missing phrase: ${phrase}`);
}

const quotePaymentContract = read("../docs/quote-payment-readiness-contract.md");
for (const phrase of [
  "Quote And Payment-Readiness Contract",
  "local-first",
  "payment-ready",
  "payment-blocked",
  "Under-19",
  "No live checkout"
]) {
  if (!quotePaymentContract.includes(phrase)) fail(`quote/payment contract missing phrase: ${phrase}`);
}

const paymentProviderContract = read("../docs/payment-provider-handoff-invoice-checkout-contract.md");
for (const phrase of [
  "Payment Provider Handoff And Invoice Checkout Contract",
  "paymentProviderHandoffs",
  "invoicePolicy",
  "checkoutPolicy",
  "eligibilityPolicy",
  "transitionPaymentProviderHandoffRecords",
  "payment-provider-handoff",
  "live checkout",
  "no live payment"
]) {
  if (!paymentProviderContract.includes(phrase)) fail(`payment provider contract missing phrase: ${phrase}`);
}

const authSessionRoleContract = read("../docs/auth-session-role-readiness-contract.md");
for (const phrase of [
  "Auth Session Role Readiness Contract",
  "authSessionRoleHandoffs",
  "productionAuthEnabled: false",
  "storesTokens: false",
  "Auth Session Role Handoffs",
  "identity-provider writes",
  "no-live-auth"
]) {
  if (!authSessionRoleContract.includes(phrase)) fail(`auth/session role contract missing phrase: ${phrase}`);
}

const marketingConversionContract = read("../docs/marketing-conversion-analytics-readiness-contract.md");
for (const phrase of [
  "Marketing Conversion Analytics Readiness Contract",
  "marketingConversionEvents",
  "SCAFFOLD/HERMES direction",
  "livePixelEnabled: false",
  "externalAdApiWrite: false",
  "Marketing Conversion KPIs",
  "monitor-marketing-conversions",
  "no-live-pixel",
  "no-external-ad-api-write",
  "provider-neutral ledger"
]) {
  if (!marketingConversionContract.includes(phrase)) fail(`marketing conversion contract missing phrase: ${phrase}`);
}

const providerAdapterContract = read("../docs/provider-adapter-selection-readiness-contract.md");
for (const phrase of [
  "Provider Adapter Selection Readiness Contract",
  "providerAdapterCandidates",
  "Provider Adapter Go/No-Go",
  "sandboxOnly: true",
  "liveApiCalls: false",
  "no-live-api",
  "no-secrets",
  "no-oauth-client",
  "no-provider-writes",
  "monitor-provider-adapters",
  "provider-adapter-selection"
]) {
  if (!providerAdapterContract.includes(phrase)) fail(`provider adapter contract missing phrase: ${phrase}`);
}

const marketingAnalyticsPrototypeContract = read("../docs/sandbox-marketing-analytics-adapter-prototype-contract.md");
for (const phrase of [
  "Sandbox Marketing Analytics Adapter Prototype Contract",
  "marketingAnalyticsAdapterPrototypes",
  "monitor-marketing-analytics-prototype",
  "transitionMarketingAnalyticsAdapterPrototypeRecords",
  "marketing-analytics-adapter-prototype",
  "sandboxOnly: true",
  "localOnly: true",
  "livePixelEnabled: false",
  "externalAdApiWrite: false",
  "productionAnalyticsCredential: false",
  "crossSiteIdentifier: false",
  "thirdPartyCookieEnabled: false",
  "fingerprintingEnabled: false",
  "crossDeviceIdentityEnabled: false",
  "customerVisible: false",
  "no-paid-action-before-consent"
]) {
  if (!marketingAnalyticsPrototypeContract.includes(phrase)) fail(`sandbox marketing analytics adapter contract missing phrase: ${phrase}`);
}

const calendarAdapterContract = read("../docs/sandbox-calendar-adapter-prototype-contract.md");
for (const phrase of [
  "Sandbox Calendar Adapter Prototype Contract",
  "calendarAdapterPrototypes",
  "monitor-calendar-adapter",
  "transitionCalendarAdapterPrototypeRecords",
  "calendar-adapter-prototype",
  "sandboxOnly: true",
  "localOnly: true",
  "liveApiCalls: false",
  "oauthConfigured: false",
  "no-live-sync",
  "no-invitation-send"
]) {
  if (!calendarAdapterContract.includes(phrase)) fail(`sandbox calendar adapter contract missing phrase: ${phrase}`);
}

const notificationPrototypeContract = read("../docs/sandbox-notification-provider-prototype-contract.md");
for (const phrase of [
  "Sandbox Notification Provider Prototype Contract",
  "notificationProviderPrototypes",
  "monitor-notification-prototype",
  "transitionNotificationProviderPrototypeRecords",
  "notification-provider-prototype",
  "sandboxOnly: true",
  "localOnly: true",
  "liveSendEnabled: false",
  "oauthConfigured: false",
  "no-live-send",
  "no-customer-visible-send"
]) {
  if (!notificationPrototypeContract.includes(phrase)) fail(`sandbox notification provider contract missing phrase: ${phrase}`);
}

const paymentPrototypeContract = read("../docs/sandbox-payment-provider-prototype-contract.md");
for (const phrase of [
  "Sandbox Payment Provider Prototype Contract",
  "paymentProviderPrototypes",
  "monitor-payment-prototype",
  "transitionPaymentProviderPrototypeRecords",
  "payment-provider-prototype",
  "sandboxOnly: true",
  "localOnly: true",
  "livePaymentEnabled: false",
  "liveCheckoutEnabled: false",
  "capturesPayment: false",
  "oauthConfigured: false",
  "legalReviewRequired: true",
  "taxReviewRequired: true",
  "under19Guarded: true",
  "no-live-payment",
  "no-payment-capture",
  "no-customer-visible-payment-request"
]) {
  if (!paymentPrototypeContract.includes(phrase)) fail(`sandbox payment provider contract missing phrase: ${phrase}`);
}

const authPrototypeContract = read("../docs/sandbox-auth-provider-prototype-contract.md");
for (const phrase of [
  "Sandbox Auth Provider Prototype Contract",
  "authProviderPrototypes",
  "monitor-auth-prototype",
  "transitionAuthProviderPrototypeRecords",
  "auth-provider-prototype",
  "sandboxOnly: true",
  "localOnly: true",
  "productionAuthEnabled: false",
  "storesTokens: false",
  "refreshTokenStorageEnabled: false",
  "rawAdminExposure: false",
  "rawMonitorExposure: false",
  "no-live-auth",
  "raw admin denial",
  "raw monitor denial"
]) {
  if (!authPrototypeContract.includes(phrase)) fail(`sandbox auth provider contract missing phrase: ${phrase}`);
}

const accountHistoryContract = read("../docs/customer-account-history-contract.md");
for (const phrase of [
  "Customer Account History Contract",
  "customerAccountHistories",
  "monitor-account-history",
  "createCustomerAccountHistoryRecords",
  "summarizeCustomerAccountHistoryState",
  "controlled-customer-status-only",
  "localOnly: true",
  "liveProviderWrite: false",
  "externalNotification: false",
  "Customer Account History"
]) {
  if (!accountHistoryContract.includes(phrase)) fail(`account history contract missing phrase: ${phrase}`);
}

const reminderContract = read("../docs/reminder-recurrence-availability-contract.md");
for (const phrase of [
  "Reminder Recurrence And Availability Contract",
  "reminderRules",
  "recurrenceCandidates",
  "availabilityWindows",
  "Customer-safe visibility",
  "does not create external calendar events"
]) {
  if (!reminderContract.includes(phrase)) fail(`reminder/recurrence/availability contract missing phrase: ${phrase}`);
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

const notificationProviderSummary = recordTools.summarizeNotificationProviderState(outboxResult.data, { notifications: outboxSummary });
if (notificationProviderSummary.handoffCount !== outboxResult.data.notificationProviderHandoffs.length) fail("notification provider summary did not count handoffs");
if (notificationProviderSummary.providerReady < 2) fail("notification provider summary missing provider readiness handoffs");
if (notificationProviderSummary.templateReady < 3) fail("notification provider summary missing customer-safe template readiness");
if (notificationProviderSummary.consentReady < 3) fail("notification provider summary missing consent readiness");
if (notificationProviderSummary.noLiveSend !== outboxResult.data.notificationProviderHandoffs.length) fail("notification provider summary no-live-send count is wrong");
const providerCreateResult = recordTools.createNotificationProviderHandoffRecords(outboxResult.data, {
  title: "Customer Update Provider Template Review",
  targetProvider: "provider-neutral review adapter",
  providerKind: "review",
  syncMode: "template-consent-readiness",
  readinessChecks: ["customer-safe-template", "consent-policy-defined", "operator-approval-required", "no-live-send"],
  note: "Verifier created a provider-neutral notification handoff without live sending."
}, {
  now: "2026-06-01T03:02:00.000Z"
});
if (providerCreateResult.data.notificationProviderHandoffs.length !== outboxResult.data.notificationProviderHandoffs.length + 1) fail("notification provider handoff create did not add a record");
if (providerCreateResult.records.handoff.liveSendEnabled || providerCreateResult.records.handoff.externalProviderWrite || providerCreateResult.records.handoff.storesCredentials || providerCreateResult.records.handoff.webhookEnabled) {
  fail("notification provider create enabled live send, provider write, credentials, or webhooks");
}
const providerReadyResult = recordTools.transitionNotificationProviderHandoffRecords(providerCreateResult.data, {
  handoffId: providerCreateResult.records.handoff.id,
  action: "consent-ready",
  note: "Consent policy is defined; live provider sending remains disabled."
}, {
  now: "2026-06-01T03:03:00.000Z"
});
if (providerReadyResult.records.handoff.status !== "queued") fail("notification provider consent-ready did not keep handoff queued");
if (!providerReadyResult.records.handoff.readinessChecks.includes("consent-policy-defined")) fail("notification provider consent-ready missing consent readiness check");
if (providerReadyResult.records.receipt.kind !== "notification-provider-handoff") fail("notification provider transition missing receipt kind");
if (providerReadyResult.records.healthCheck.target !== "monitor-notification-provider") fail("notification provider transition missing monitor target");
if (providerReadyResult.data.notificationEvents.length !== providerCreateResult.data.notificationEvents.length) fail("notification provider handoff created a customer-visible notification event");
const malformedProviderData = recordTools.cloneData(providerReadyResult.data);
malformedProviderData.notificationProviderHandoffs.push({
  id: "bad-notification-provider-live-send",
  title: "Bad Live Notification Provider",
  targetProvider: "live email provider",
  providerKind: "email",
  syncMode: "template-consent-readiness",
  status: "complete",
  handoffStatus: "live",
  visibility: "public",
  customerVisible: true,
  liveSendEnabled: true,
  externalProviderWrite: true,
  storesCredentials: true,
  webhookEnabled: true,
  readinessChecks: []
});
const malformedProviderSummary = recordTools.summarizeNotificationProviderState(malformedProviderData);
if (!malformedProviderSummary.violations.length) fail("notification provider summary did not flag malformed live provider handoff");

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

const quoteResult = recordTools.createQuoteEstimateRecords(intakeResult.data, {
  opportunityId: intakeResult.records.opportunity.id,
  amountJpy: 65000,
  title: "Under-19 compatibility estimate",
  nextActionAt: "2026-06-03T18:00",
  note: "Guardian compatibility quote created."
}, {
  now: "2026-06-01T02:55:00.000Z"
});
if (quoteResult.data.quotes.length !== intakeResult.data.quotes.length + 1) fail("quote estimate did not create a quote record");
if (quoteResult.data.receipts.length !== intakeResult.data.receipts.length + 1) fail("quote estimate did not create a receipt");
if (quoteResult.records.quote.status !== "draft") fail("quote estimate should start draft");
if (!quoteResult.records.quote.under19 || !quoteResult.records.quote.guardianConsentRequired) fail("under-19 quote did not set guardian consent payment block");
if (quoteResult.records.quote.customerVisible) fail("draft quote should not be customer-visible");
if (quoteResult.records.receipt.kind !== "quote-estimate-created") fail("quote estimate missing created receipt");
const quoteSummary = recordTools.summarizeQuoteState(quoteResult.data);
if (quoteSummary.total < 1 || quoteSummary.under19Blocked < 1) fail("quote summary missing under-19 blocked quote");

const presentedQuoteResult = recordTools.transitionQuoteEstimateRecords(quoteResult.data, {
  quoteId: quoteResult.records.quote.id,
  action: "present",
  note: "Estimate presented to guardian."
}, {
  now: "2026-06-01T02:56:00.000Z"
});
if (presentedQuoteResult.records.quote.status !== "presented") fail("quote present did not set presented status");
if (!presentedQuoteResult.records.quote.customerVisible) fail("presented quote should be customer-visible");
if (presentedQuoteResult.records.receipt.kind !== "quote-presented") fail("quote present missing receipt kind");

const approvedQuoteResult = recordTools.transitionQuoteEstimateRecords(presentedQuoteResult.data, {
  quoteId: quoteResult.records.quote.id,
  action: "approve",
  note: "Guardian approved the estimate."
}, {
  now: "2026-06-01T02:57:00.000Z"
});
if (approvedQuoteResult.records.quote.approvalStatus !== "approved") fail("quote approve did not set approval status");
if (approvedQuoteResult.records.receipt.kind !== "quote-approved") fail("quote approve missing receipt kind");

const blockedPaymentQuoteResult = recordTools.transitionQuoteEstimateRecords(approvedQuoteResult.data, {
  quoteId: quoteResult.records.quote.id,
  action: "mark-payment-ready",
  note: "Payment readiness attempted before consent evidence."
}, {
  now: "2026-06-01T02:58:00.000Z"
});
if (blockedPaymentQuoteResult.records.quote.status !== "payment-blocked") fail("under-19 quote did not block payment readiness without consent");
if (blockedPaymentQuoteResult.records.receipt.kind !== "quote-payment-blocked") fail("under-19 payment block missing receipt kind");
if (recordTools.summarizeQuoteState(blockedPaymentQuoteResult.data).paymentBlocked < 1) fail("quote summary missing payment-blocked count");

const paymentReadyQuoteResult = recordTools.transitionQuoteEstimateRecords(blockedPaymentQuoteResult.data, {
  quoteId: quoteResult.records.quote.id,
  action: "mark-payment-ready",
  guardianConsentRecorded: "true",
  note: "Guardian consent recorded; quote is payment-ready."
}, {
  now: "2026-06-01T02:59:00.000Z"
});
if (paymentReadyQuoteResult.records.quote.status !== "payment-ready") fail("quote did not become payment-ready after consent");
if (paymentReadyQuoteResult.records.quote.guardianConsentRequired) fail("payment-ready quote still requires guardian consent");
if (paymentReadyQuoteResult.records.receipt.kind !== "quote-payment-ready") fail("quote payment-ready missing receipt kind");
const quoteMonitorReport = recordTools.buildMonitorReport(paymentReadyQuoteResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (quoteMonitorReport.summary.quotes < 1) fail("monitor summary missing quote count");
if (quoteMonitorReport.summary.paymentReadyQuotes < 1) fail("monitor summary missing payment-ready quote count");
if (!quoteMonitorReport.queue.some((item) => item.kind === "quote")) fail("monitor queue missing quote records");

const paidRecordedQuoteResult = recordTools.transitionQuoteEstimateRecords(paymentReadyQuoteResult.data, {
  quoteId: quoteResult.records.quote.id,
  action: "record-payment",
  note: "Manual payment evidence recorded; no live processor used."
}, {
  now: "2026-06-01T03:00:00.000Z"
});
if (paidRecordedQuoteResult.records.quote.status !== "paid-recorded") fail("quote payment record did not set paid-recorded status");
if (paidRecordedQuoteResult.records.quote.receiptIds.length < 6) fail("quote did not retain receipt trail");
if (paidRecordedQuoteResult.records.quote.quoteHistory.length < 6) fail("quote did not retain quote history");
if (paidRecordedQuoteResult.records.receipt.kind !== "quote-payment-recorded") fail("quote payment record missing receipt kind");

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
const handoffGatewaySummary = recordTools.summarizeAccessGatewayState(handoffResult.data, { now: "2026-06-01T12:00:00+09:00", routePlacement: routePlacementSummary });
if (handoffGatewaySummary.status !== "ready") fail("access gateway summary should remain ready with handoff data");

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

const reminderResult = recordTools.createReminderRuleRecords(scheduleResult.data, {
  sourceKind: "session",
  sourceId: scheduleResult.records.session.id,
  customerId: scheduleResult.records.session.customerId,
  title: "Confirm diagnostic session",
  reminderAt: "2026-06-05T18:30",
  leadMinutes: 60,
  channel: "operator-dashboard",
  customerVisible: "false"
}, {
  now: "2026-06-01T03:02:00.000Z"
});
if (reminderResult.data.reminderRules.length !== scheduleResult.data.reminderRules.length + 1) fail("reminder rule did not create a record");
if (reminderResult.records.reminder.status !== "planned") fail("reminder rule should start planned");
if (reminderResult.records.receipt.kind !== "reminder-rule-created") fail("reminder rule missing created receipt");
const snoozedReminderResult = recordTools.transitionReminderRuleRecords(reminderResult.data, {
  reminderId: reminderResult.records.reminder.id,
  action: "snooze",
  nextActionAt: "2026-06-05T18:45",
  note: "Move reminder closer to the session."
}, {
  now: "2026-06-01T03:03:00.000Z"
});
if (snoozedReminderResult.records.reminder.status !== "snoozed") fail("reminder snooze did not set snoozed status");
if (snoozedReminderResult.records.reminder.reminderAt !== "2026-06-05T18:45:00+09:00") fail("reminder snooze did not update reminderAt");
const completedReminderResult = recordTools.transitionReminderRuleRecords(snoozedReminderResult.data, {
  reminderId: reminderResult.records.reminder.id,
  action: "complete",
  note: "Reminder acknowledged by operator."
}, {
  now: "2026-06-01T03:04:00.000Z"
});
if (completedReminderResult.records.reminder.status !== "complete") fail("reminder complete did not set complete status");
if (completedReminderResult.records.reminder.receiptIds.length < 3) fail("reminder did not retain receipt trail");

const recurrenceResult = recordTools.createRecurrenceCandidateRecords(completedReminderResult.data, {
  sourceKind: "engagement",
  sourceId: acceptResult.records.engagement.id,
  customerId: acceptResult.records.engagement.customerId,
  title: "Weekly writing review candidate",
  cadence: "weekly",
  nextCandidateAt: "2026-06-12T19:30",
  customerVisible: "false"
}, {
  now: "2026-06-01T03:05:00.000Z"
});
if (recurrenceResult.records.recurrence.status !== "proposed") fail("recurrence candidate should start proposed");
if (recurrenceResult.records.recurrence.autoCreateSessions) fail("recurrence candidate should not auto-create sessions");
const approvedRecurrenceResult = recordTools.transitionRecurrenceCandidateRecords(recurrenceResult.data, {
  recurrenceId: recurrenceResult.records.recurrence.id,
  action: "approve",
  note: "Cadence is viable for this engagement."
}, {
  now: "2026-06-01T03:06:00.000Z"
});
if (approvedRecurrenceResult.records.recurrence.status !== "approved") fail("recurrence approval did not set approved status");
if (approvedRecurrenceResult.data.sessions.length !== recurrenceResult.data.sessions.length) fail("recurrence approval should not auto-create sessions");

const availabilityResult = recordTools.createAvailabilityWindowRecords(approvedRecurrenceResult.data, {
  owner: "Jack",
  title: "Evening review capacity",
  startAt: "2026-06-06T19:00",
  endAt: "2026-06-06T21:00",
  capacity: 2,
  serviceLane: "education",
  customerVisible: "false"
}, {
  now: "2026-06-01T03:07:00.000Z"
});
if (availabilityResult.records.availability.status !== "available") fail("availability window should start available");
if (availabilityResult.records.receipt.kind !== "availability-window-created") fail("availability window missing created receipt");
const blockedAvailabilityResult = recordTools.transitionAvailabilityWindowRecords(availabilityResult.data, {
  availabilityId: availabilityResult.records.availability.id,
  action: "block",
  note: "Window reserved for existing student work."
}, {
  now: "2026-06-01T03:08:00.000Z"
});
if (blockedAvailabilityResult.records.availability.status !== "blocked") fail("availability block did not set blocked status");
const reopenedAvailabilityResult = recordTools.transitionAvailabilityWindowRecords(blockedAvailabilityResult.data, {
  availabilityId: availabilityResult.records.availability.id,
  action: "reopen",
  note: "Window reopened after conflict cleared."
}, {
  now: "2026-06-01T03:09:00.000Z"
});
if (reopenedAvailabilityResult.records.availability.status !== "available") fail("availability reopen did not set available status");
const scheduleControlSummary = recordTools.summarizeScheduleControlState(reopenedAvailabilityResult.data);
if (scheduleControlSummary.reminders < 1 || scheduleControlSummary.approvedRecurrence < 1 || scheduleControlSummary.availabilityWindows < 1 || scheduleControlSummary.availableWindows < 1) fail("schedule control summary missing reminder, recurrence, or availability window");
const scheduleControlMonitor = recordTools.buildMonitorReport(reopenedAvailabilityResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (scheduleControlMonitor.summary.reminderRules < 1) fail("monitor summary missing reminder rules");
if (scheduleControlMonitor.summary.recurrenceCandidates < 1) fail("monitor summary missing recurrence candidates");
if (scheduleControlMonitor.summary.availabilityWindows < 1) fail("monitor summary missing availability windows");
if (!scheduleControlMonitor.queue.some((item) => item.kind === "recurrence candidate")) fail("monitor queue missing recurrence candidate");

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
if (!monitorReport.marketingConversion) fail("monitor report missing marketing conversion state");
if (!monitorReport.providerAdapters) fail("monitor report missing provider adapter state");
if (!monitorReport.marketingAnalytics) fail("monitor report missing sandbox marketing analytics adapter state");
if (!monitorReport.calendarAdapter) fail("monitor report missing sandbox calendar adapter state");
if (!monitorReport.notificationPrototype) fail("monitor report missing sandbox notification provider state");
if (!monitorReport.accountHistory) fail("monitor report missing account history state");
if (!monitorReport.calendar) fail("monitor report missing calendar export state");
if (!monitorReport.persistence) fail("monitor report missing persistence state");
if (!monitorReport.scope) fail("monitor report missing scope state");
if (!monitorReport.memory) fail("monitor report missing memory state");
if (!monitorReport.access) fail("monitor report missing access state");
if (!monitorReport.accessGateways) fail("monitor report missing access gateway state");
if (!monitorReport.librarySync) fail("monitor report missing LIBRARY sync state");
if (!monitorReport.calendarProvider) fail("monitor report missing calendar provider state");
if (!monitorReport.notificationProvider) fail("monitor report missing notification provider state");
if (!monitorReport.paymentProvider) fail("monitor report missing payment provider state");
if (!monitorReport.paymentPrototype) fail("monitor report missing sandbox payment provider state");
if (!monitorReport.authSession) fail("monitor report missing auth/session role state");
if (!monitorReport.authPrototype) fail("monitor report missing sandbox auth provider state");
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
if (monitorReport.summary.marketingConversionEvents !== data.marketingConversionEvents.length) fail("monitor summary marketing conversion KPI count is wrong");
if (monitorReport.summary.marketingConversionReady !== data.marketingConversionEvents.length) fail("monitor summary missing ready marketing conversion KPIs");
if (monitorReport.summary.marketingConversionNoLiveTracking !== data.marketingConversionEvents.length) fail("monitor summary missing no-live-tracking conversion KPIs");
if (monitorReport.summary.marketingConversionPotentialValueJpy <= 0) fail("monitor summary missing marketing conversion potential value");
if (monitorReport.summary.marketingConversionViolations !== 0) fail("monitor summary should not report marketing conversion violations for the seed slice");
if (monitorReport.summary.providerAdapterCandidates !== data.providerAdapterCandidates.length) fail("monitor summary provider adapter count is wrong");
if (monitorReport.summary.providerAdapterReady !== data.providerAdapterCandidates.length) fail("monitor summary missing ready provider adapters");
if (monitorReport.summary.providerAdapterSandboxOnly !== data.providerAdapterCandidates.length) fail("monitor summary missing sandbox-only provider adapters");
if (monitorReport.summary.providerAdapterNoLiveProvider !== data.providerAdapterCandidates.length) fail("monitor summary missing no-live-provider adapters");
if (monitorReport.summary.providerAdapterNoSecrets !== data.providerAdapterCandidates.length) fail("monitor summary missing no-secrets provider adapters");
if (monitorReport.summary.providerAdapterViolations !== 0) fail("monitor summary should not report provider adapter violations for the seed slice");
if (monitorReport.summary.marketingAnalyticsAdapterPrototypes !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary marketing analytics adapter prototype count is wrong");
if (monitorReport.summary.marketingAnalyticsPayloadReady < 1) fail("monitor summary missing payload-ready marketing analytics adapter prototype");
if (monitorReport.summary.marketingAnalyticsSandboxOnly !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing sandbox-only marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsLocalOnly !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing local-only marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsNoLiveTracking !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing no-live-tracking marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsNoCredentials !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing no-credentials marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsNoPersonalData !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing no-personal-data marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsNoCustomerVisibleAnalytics !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing no-customer-visible analytics prototypes");
if (monitorReport.summary.marketingAnalyticsPrivacyConsentReady !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing privacy/consent-ready marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsUnder19ConsentGated !== data.marketingAnalyticsAdapterPrototypes.length) fail("monitor summary missing under-19 consent-gated marketing analytics prototypes");
if (monitorReport.summary.marketingAnalyticsViolations !== 0) fail("monitor summary should not report marketing analytics prototype violations for the seed slice");
if (monitorReport.summary.calendarAdapterPrototypes !== data.calendarAdapterPrototypes.length) fail("monitor summary calendar adapter prototype count is wrong");
if (monitorReport.summary.calendarAdapterPayloadReady < 1) fail("monitor summary missing payload-ready calendar adapter prototype");
if (monitorReport.summary.calendarAdapterSandboxOnly !== data.calendarAdapterPrototypes.length) fail("monitor summary missing sandbox-only calendar adapter prototypes");
if (monitorReport.summary.calendarAdapterLocalOnly !== data.calendarAdapterPrototypes.length) fail("monitor summary missing local-only calendar adapter prototypes");
if (monitorReport.summary.calendarAdapterNoLiveProvider !== data.calendarAdapterPrototypes.length) fail("monitor summary missing no-live calendar adapter prototypes");
if (monitorReport.summary.calendarAdapterNoSecrets !== data.calendarAdapterPrototypes.length) fail("monitor summary missing no-secrets calendar adapter prototypes");
if (monitorReport.summary.calendarAdapterNoInvitationSend !== data.calendarAdapterPrototypes.length) fail("monitor summary missing no-invitation-send calendar adapter prototypes");
if (monitorReport.summary.calendarAdapterViolations !== 0) fail("monitor summary should not report calendar adapter violations for the seed slice");
if (monitorReport.summary.notificationProviderPrototypes !== data.notificationProviderPrototypes.length) fail("monitor summary notification provider prototype count is wrong");
if (monitorReport.summary.notificationPrototypePayloadReady < 1) fail("monitor summary missing payload-ready notification provider prototype");
if (monitorReport.summary.notificationPrototypeSandboxOnly !== data.notificationProviderPrototypes.length) fail("monitor summary missing sandbox-only notification provider prototypes");
if (monitorReport.summary.notificationPrototypeLocalOnly !== data.notificationProviderPrototypes.length) fail("monitor summary missing local-only notification provider prototypes");
if (monitorReport.summary.notificationPrototypeNoLiveSend !== data.notificationProviderPrototypes.length) fail("monitor summary missing no-live-send notification provider prototypes");
if (monitorReport.summary.notificationPrototypeNoSecrets !== data.notificationProviderPrototypes.length) fail("monitor summary missing no-secrets notification provider prototypes");
if (monitorReport.summary.notificationPrototypeNoCustomerVisibleSend !== data.notificationProviderPrototypes.length) fail("monitor summary missing no-customer-visible-send notification provider prototypes");
if (monitorReport.summary.notificationPrototypeViolations !== 0) fail("monitor summary should not report notification prototype violations for the seed slice");
if (monitorReport.summary.accountHistories !== returnResult.data.customers.length) fail("monitor summary account history count is wrong");
if (monitorReport.summary.accountHistoryEvents < returnResult.data.customerAccountHistories.length) fail("monitor summary missing account history events");
if (monitorReport.summary.accountHistoryCustomerVisible < 1) fail("monitor summary missing customer-visible account history events");
if (monitorReport.summary.accountHistoryLocalOnly !== returnResult.data.customers.length) fail("monitor summary account history local-only posture is wrong");
if (monitorReport.summary.accountHistoryViolations !== 0) fail("monitor summary should not report account history violations for the seed slice");
if (monitorReport.summary.copyComplianceViolations !== 0) fail("monitor summary should not report campaign copy violations");
if (monitorReport.summary.rescheduledScheduleEntries < 1) fail("monitor summary missing rescheduled schedule lifecycle count");
if (monitorReport.summary.canceledScheduleEntries < 1) fail("monitor summary missing canceled schedule lifecycle count");
if (!monitorReport.summary.dirtyLocalState) fail("monitor summary should flag dirty local state before export");
if (monitorReport.summary.awaitingReview < 1) fail("monitor summary missing awaiting-review count");
if (monitorReport.summary.staleMemoryNotes < 1) fail("monitor summary missing stale memory notes");
if (monitorReport.summary.safeAccessViolations !== 0) fail("monitor summary should not report safe-access violations for the seed slice");
if (monitorReport.summary.accessGatewayRoutes < 4) fail("monitor summary missing access gateway route count");
if (monitorReport.summary.controlledPublicGateways < 1) fail("monitor summary missing controlled public gateway count");
if (monitorReport.summary.controlledCustomerGateways < 1) fail("monitor summary missing controlled customer gateway count");
if (monitorReport.summary.deniedRawGateways < 2) fail("monitor summary missing raw denial gateway count");
if (monitorReport.summary.accessGatewayViolations !== 0) fail("monitor summary should not report access gateway violations for the seed slice");
if (monitorReport.summary.librarySyncHandoffs < 2) fail("monitor summary missing LIBRARY sync handoff count");
if (monitorReport.summary.libraryExportHandoffs < 1) fail("monitor summary missing LIBRARY export handoff count");
if (monitorReport.summary.libraryRecoveryHandoffs < 1) fail("monitor summary missing LIBRARY recovery handoff count");
if (monitorReport.summary.librarySyncViolations !== 0) fail("monitor summary should not report LIBRARY sync violations for the seed slice");
if (monitorReport.summary.calendarProviderHandoffs < 3) fail("monitor summary missing calendar provider handoff count");
if (monitorReport.summary.calendarProviderReady < 2) fail("monitor summary missing provider readiness handoff count");
if (monitorReport.summary.calendarInvitationReady < 1) fail("monitor summary missing invitation-readiness handoff count");
if (monitorReport.summary.calendarProviderViolations !== 0) fail("monitor summary should not report calendar provider violations for the seed slice");
if (monitorReport.summary.notificationProviderHandoffs < 3) fail("monitor summary missing notification provider handoff count");
if (monitorReport.summary.notificationProviderReady < 2) fail("monitor summary missing notification provider readiness handoff count");
if (monitorReport.summary.notificationTemplateReady < 3) fail("monitor summary missing notification template readiness handoff count");
if (monitorReport.summary.notificationConsentReady < 3) fail("monitor summary missing notification consent readiness handoff count");
if (monitorReport.summary.notificationProviderViolations !== 0) fail("monitor summary should not report notification provider violations for the seed slice");
if (monitorReport.summary.paymentProviderHandoffs < 3) fail("monitor summary missing payment provider handoff count");
if (monitorReport.summary.paymentProviderReady < 1) fail("monitor summary missing payment provider readiness handoff count");
if (monitorReport.summary.paymentInvoiceReady < 2) fail("monitor summary missing payment invoice readiness handoff count");
if (monitorReport.summary.paymentCheckoutReady < 1) fail("monitor summary missing payment checkout readiness handoff count");
if (monitorReport.summary.paymentEligibilityReady < 2) fail("monitor summary missing payment eligibility readiness handoff count");
if (monitorReport.summary.paymentProviderViolations !== 0) fail("monitor summary should not report payment provider violations for the seed slice");
if (monitorReport.summary.paymentProviderPrototypes !== data.paymentProviderPrototypes.length) fail("monitor summary payment provider prototype count is wrong");
if (monitorReport.summary.paymentPrototypePayloadReady < 1) fail("monitor summary missing payload-ready payment provider prototype");
if (monitorReport.summary.paymentPrototypeSandboxOnly !== data.paymentProviderPrototypes.length) fail("monitor summary missing sandbox-only payment provider prototypes");
if (monitorReport.summary.paymentPrototypeLocalOnly !== data.paymentProviderPrototypes.length) fail("monitor summary missing local-only payment provider prototypes");
if (monitorReport.summary.paymentPrototypeNoLivePayment !== data.paymentProviderPrototypes.length) fail("monitor summary missing no-live-payment provider prototypes");
if (monitorReport.summary.paymentPrototypeNoSecrets !== data.paymentProviderPrototypes.length) fail("monitor summary missing no-secrets payment provider prototypes");
if (monitorReport.summary.paymentPrototypeNoCustomerVisiblePayment !== data.paymentProviderPrototypes.length) fail("monitor summary missing no-customer-visible-payment provider prototypes");
if (monitorReport.summary.paymentPrototypeNoPaymentCapture !== data.paymentProviderPrototypes.length) fail("monitor summary missing no-payment-capture provider prototypes");
if (monitorReport.summary.paymentPrototypeLegalTaxPrivacyReady !== data.paymentProviderPrototypes.length) fail("monitor summary missing legal/tax/privacy payment provider prototypes");
if (monitorReport.summary.paymentPrototypeUnder19Guarded !== data.paymentProviderPrototypes.length) fail("monitor summary missing under-19 guarded payment provider prototypes");
if (monitorReport.summary.paymentPrototypeViolations !== 0) fail("monitor summary should not report payment prototype violations for the seed slice");
if (monitorReport.summary.authProviderPrototypes !== data.authProviderPrototypes.length) fail("monitor summary auth provider prototype count is wrong");
if (monitorReport.summary.authPrototypePayloadReady < 1) fail("monitor summary missing payload-ready auth provider prototype");
if (monitorReport.summary.authPrototypeSandboxOnly !== data.authProviderPrototypes.length) fail("monitor summary missing sandbox-only auth provider prototypes");
if (monitorReport.summary.authPrototypeLocalOnly !== data.authProviderPrototypes.length) fail("monitor summary missing local-only auth provider prototypes");
if (monitorReport.summary.authPrototypeNoLiveAuth !== data.authProviderPrototypes.length) fail("monitor summary missing no-live-auth provider prototypes");
if (monitorReport.summary.authPrototypeNoSecrets !== data.authProviderPrototypes.length) fail("monitor summary missing no-secrets auth provider prototypes");
if (monitorReport.summary.authPrototypeNoCredentialStorage !== data.authProviderPrototypes.length) fail("monitor summary missing no-credential-storage auth provider prototypes");
if (monitorReport.summary.authPrototypeNoTokenStorage !== data.authProviderPrototypes.length) fail("monitor summary missing no-token-storage auth provider prototypes");
if (monitorReport.summary.authPrototypeNoExternalSession !== data.authProviderPrototypes.length) fail("monitor summary missing no-external-session auth provider prototypes");
if (monitorReport.summary.authPrototypeNoCustomerVisibleAuth !== data.authProviderPrototypes.length) fail("monitor summary missing no-customer-visible-auth provider prototypes");
if (monitorReport.summary.authPrototypeRawAdminDenied !== data.authProviderPrototypes.length) fail("monitor summary missing raw-admin denied auth provider prototypes");
if (monitorReport.summary.authPrototypeRawMonitorDenied !== data.authProviderPrototypes.length) fail("monitor summary missing raw-monitor denied auth provider prototypes");
if (monitorReport.summary.authPrototypeViolations !== 0) fail("monitor summary should not report auth prototype violations for the seed slice");
if (monitorReport.summary.authSessionRoleHandoffs < 4) fail("monitor summary missing auth/session role handoff count");
if (monitorReport.summary.authPublicReady < 1) fail("monitor summary missing public auth readiness count");
if (monitorReport.summary.authCustomerReady < 1) fail("monitor summary missing customer auth readiness count");
if (monitorReport.summary.authInternalDenied < 2) fail("monitor summary missing internal auth denial count");
if (monitorReport.summary.authSessionRoleViolations !== 0) fail("monitor summary should not report auth/session role violations for the seed slice");
if (monitorReport.summary.monitorHealthChecks < 2) fail("monitor summary missing monitor health checks");
if (monitorReport.summary.monitorActionReceipts < 2) fail("monitor summary missing monitor action receipts");
if (monitorReport.summary.operatorActions < 3) fail("monitor summary missing operator actions");
if (!monitorReport.timeline.some((item) => item.kind === "campaign route")) fail("monitor timeline missing campaign routes");
if (!monitorReport.timeline.some((item) => item.kind === "marketing conversion")) fail("monitor timeline missing marketing conversion KPIs");
if (!monitorReport.timeline.some((item) => item.kind === "provider adapter")) fail("monitor timeline missing provider adapter candidates");
if (!monitorReport.timeline.some((item) => item.kind === "calendar adapter")) fail("monitor timeline missing sandbox calendar adapter prototypes");
if (!monitorReport.timeline.some((item) => item.kind === "notification prototype")) fail("monitor timeline missing sandbox notification provider prototypes");
if (!monitorReport.timeline.some((item) => item.kind === "payment prototype")) fail("monitor timeline missing sandbox payment provider prototypes");
if (!monitorReport.timeline.some((item) => item.kind === "auth prototype")) fail("monitor timeline missing sandbox auth provider prototypes");
if (!monitorReport.timeline.some((item) => item.kind === "access gateway")) fail("monitor timeline missing access gateways");
if (!monitorReport.timeline.some((item) => item.kind === "library sync")) fail("monitor timeline missing LIBRARY sync handoffs");
if (!monitorReport.timeline.some((item) => item.kind === "calendar provider")) fail("monitor timeline missing calendar provider handoffs");
if (!monitorReport.timeline.some((item) => item.kind === "notification provider")) fail("monitor timeline missing notification provider handoffs");
if (!monitorReport.timeline.some((item) => item.kind === "payment provider")) fail("monitor timeline missing payment provider handoffs");
if (!monitorReport.timeline.some((item) => item.kind === "auth/session role")) fail("monitor timeline missing auth/session role handoffs");
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

const quoteCalendarExport = recordTools.createCalendarExport(paymentReadyQuoteResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (!quoteCalendarExport.entries.some((entry) => entry.sourceKind === "quote" && entry.timeKind === "quote-validity-window")) fail("calendar export missing quote validity window");

const scheduleControlCalendarExport = recordTools.createCalendarExport(reopenedAvailabilityResult.data, { now: "2026-06-01T12:00:00+09:00" });
if (!scheduleControlCalendarExport.entries.some((entry) => entry.sourceKind === "reminder-rule" && entry.timeKind === "reminder-window")) fail("calendar export missing reminder window");
if (!scheduleControlCalendarExport.entries.some((entry) => entry.sourceKind === "recurrence-candidate" && entry.timeKind === "recurrence-review-window")) fail("calendar export missing recurrence candidate window");
if (!scheduleControlCalendarExport.entries.some((entry) => entry.sourceKind === "availability-window" && entry.timeKind === "availability-window")) fail("calendar export missing availability window");

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
if (exportedLedger.counts.accessGateways !== returnResult.data.accessGateways.length) fail("ledger export access gateway count is wrong");
if (exportedLedger.counts.librarySyncHandoffs !== returnResult.data.librarySyncHandoffs.length) fail("ledger export LIBRARY sync handoff count is wrong");
if (exportedLedger.counts.calendarProviderHandoffs !== returnResult.data.calendarProviderHandoffs.length) fail("ledger export calendar provider handoff count is wrong");
if (exportedLedger.counts.notificationProviderHandoffs !== returnResult.data.notificationProviderHandoffs.length) fail("ledger export notification provider handoff count is wrong");
if (exportedLedger.counts.paymentProviderHandoffs !== returnResult.data.paymentProviderHandoffs.length) fail("ledger export payment provider handoff count is wrong");
if (exportedLedger.counts.marketingConversionEvents !== returnResult.data.marketingConversionEvents.length) fail("ledger export marketing conversion count is wrong");
if (exportedLedger.counts.providerAdapterCandidates !== returnResult.data.providerAdapterCandidates.length) fail("ledger export provider adapter count is wrong");
if (exportedLedger.counts.marketingAnalyticsAdapterPrototypes !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger export marketing analytics adapter prototype count is wrong");
if (exportedLedger.counts.calendarAdapterPrototypes !== returnResult.data.calendarAdapterPrototypes.length) fail("ledger export calendar adapter prototype count is wrong");
if (exportedLedger.counts.notificationProviderPrototypes !== returnResult.data.notificationProviderPrototypes.length) fail("ledger export notification provider prototype count is wrong");
if (exportedLedger.counts.paymentProviderPrototypes !== returnResult.data.paymentProviderPrototypes.length) fail("ledger export payment provider prototype count is wrong");
if (exportedLedger.counts.authProviderPrototypes !== returnResult.data.authProviderPrototypes.length) fail("ledger export auth provider prototype count is wrong");
if (exportedLedger.counts.customerAccountHistories !== exportedLedger.data.customerAccountHistories.length) fail("ledger export account history count is wrong");
if (!exportedLedger.monitor || exportedLedger.monitor.timeline < 1) fail("ledger export missing monitor summary");
if (exportedLedger.monitor.persistenceRevision !== exportedLedger.persistence.revision) fail("ledger monitor summary missing persistence revision");
if (!exportedLedger.calendarExport || exportedLedger.calendarExport.entries.length !== calendarExport.entries.length) fail("ledger export missing calendar export entries");
if (!exportedLedger.routePlacement || exportedLedger.routePlacement.summary.routeCount !== exportedLedger.data.routePlacements.length) fail("ledger export missing route placement summary");
if (!exportedLedger.accessGateway || exportedLedger.accessGateway.gatewayCount !== exportedLedger.data.accessGateways.length) fail("ledger export missing access gateway summary");
if (!exportedLedger.librarySync || exportedLedger.librarySync.handoffCount !== exportedLedger.data.librarySyncHandoffs.length) fail("ledger export missing LIBRARY sync summary");
if (!exportedLedger.calendarProvider || exportedLedger.calendarProvider.handoffCount !== exportedLedger.data.calendarProviderHandoffs.length) fail("ledger export missing calendar provider summary");
if (!exportedLedger.notificationProvider || exportedLedger.notificationProvider.handoffCount !== exportedLedger.data.notificationProviderHandoffs.length) fail("ledger export missing notification provider summary");
if (!exportedLedger.paymentProvider || exportedLedger.paymentProvider.handoffCount !== exportedLedger.data.paymentProviderHandoffs.length) fail("ledger export missing payment provider summary");
if (!exportedLedger.authSession || exportedLedger.authSession.handoffCount !== exportedLedger.data.authSessionRoleHandoffs.length) fail("ledger export missing auth/session role summary");
if (!exportedLedger.marketingConversion || exportedLedger.marketingConversion.eventCount !== exportedLedger.data.marketingConversionEvents.length) fail("ledger export missing marketing conversion summary");
if (!exportedLedger.providerAdapters || exportedLedger.providerAdapters.candidateCount !== exportedLedger.data.providerAdapterCandidates.length) fail("ledger export missing provider adapter summary");
if (!exportedLedger.marketingAnalytics || exportedLedger.marketingAnalytics.prototypeCount !== exportedLedger.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger export missing marketing analytics prototype summary");
if (!exportedLedger.calendarAdapter || exportedLedger.calendarAdapter.prototypeCount !== exportedLedger.data.calendarAdapterPrototypes.length) fail("ledger export missing calendar adapter summary");
if (!exportedLedger.notificationPrototype || exportedLedger.notificationPrototype.prototypeCount !== exportedLedger.data.notificationProviderPrototypes.length) fail("ledger export missing notification prototype summary");
if (!exportedLedger.paymentPrototype || exportedLedger.paymentPrototype.prototypeCount !== exportedLedger.data.paymentProviderPrototypes.length) fail("ledger export missing payment prototype summary");
if (!exportedLedger.authPrototype || exportedLedger.authPrototype.prototypeCount !== exportedLedger.data.authProviderPrototypes.length) fail("ledger export missing auth prototype summary");
if (!exportedLedger.accountHistory || exportedLedger.accountHistory.historyCount !== exportedLedger.data.customers.length) fail("ledger export missing account history summary");
if (exportedLedger.counts.routePlacements !== returnResult.data.routePlacements.length) fail("ledger export route placement count is wrong");
if (exportedLedger.counts.curriculumFrameworks !== returnResult.data.curriculumFrameworks.length) fail("ledger export curriculum framework count is wrong");
if (exportedLedger.counts.packageGameplans !== returnResult.data.packageGameplans.length) fail("ledger export package gameplan count is wrong");
if (exportedLedger.counts.campaignRoutes !== returnResult.data.campaignRoutes.length) fail("ledger export campaign route count is wrong");
if (exportedLedger.monitor.campaignRoutes !== returnResult.data.campaignRoutes.length) fail("ledger monitor summary missing campaign routes");
if (exportedLedger.monitor.accessGatewayRoutes !== returnResult.data.accessGateways.length) fail("ledger monitor summary missing access gateway routes");
if (exportedLedger.monitor.librarySyncHandoffs !== returnResult.data.librarySyncHandoffs.length) fail("ledger monitor summary missing LIBRARY sync handoff routes");
if (exportedLedger.monitor.calendarProviderHandoffs !== returnResult.data.calendarProviderHandoffs.length) fail("ledger monitor summary missing calendar provider handoffs");
if (exportedLedger.monitor.notificationProviderHandoffs !== returnResult.data.notificationProviderHandoffs.length) fail("ledger monitor summary missing notification provider handoffs");
if (exportedLedger.monitor.notificationProviderReady < 2) fail("ledger monitor summary missing notification provider readiness");
if (exportedLedger.monitor.notificationTemplateReady < 3) fail("ledger monitor summary missing notification template readiness");
if (exportedLedger.monitor.notificationConsentReady < 3) fail("ledger monitor summary missing notification consent readiness");
if (exportedLedger.monitor.paymentProviderHandoffs !== returnResult.data.paymentProviderHandoffs.length) fail("ledger monitor summary missing payment provider handoffs");
if (exportedLedger.monitor.paymentProviderReady < 1) fail("ledger monitor summary missing payment provider readiness");
if (exportedLedger.monitor.paymentInvoiceReady < 2) fail("ledger monitor summary missing payment invoice readiness");
if (exportedLedger.monitor.paymentCheckoutReady < 1) fail("ledger monitor summary missing payment checkout readiness");
if (exportedLedger.monitor.authSessionRoleHandoffs !== returnResult.data.authSessionRoleHandoffs.length) fail("ledger monitor summary missing auth/session role handoffs");
if (exportedLedger.monitor.authPublicReady < 1) fail("ledger monitor summary missing public auth readiness");
if (exportedLedger.monitor.authCustomerReady < 1) fail("ledger monitor summary missing customer auth readiness");
if (exportedLedger.monitor.authInternalDenied < 2) fail("ledger monitor summary missing internal auth denial readiness");
if (exportedLedger.monitor.marketingConversionEvents !== returnResult.data.marketingConversionEvents.length) fail("ledger monitor summary missing marketing conversion KPIs");
if (exportedLedger.monitor.marketingConversionNoLiveTracking !== returnResult.data.marketingConversionEvents.length) fail("ledger monitor summary missing marketing conversion no-live-tracking posture");
if (exportedLedger.monitor.providerAdapterCandidates !== returnResult.data.providerAdapterCandidates.length) fail("ledger monitor summary missing provider adapter candidates");
if (exportedLedger.monitor.providerAdapterNoLiveProvider !== returnResult.data.providerAdapterCandidates.length) fail("ledger monitor summary missing provider adapter no-live-provider posture");
if (exportedLedger.monitor.marketingAnalyticsAdapterPrototypes !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger monitor summary missing marketing analytics adapter prototypes");
if (exportedLedger.monitor.marketingAnalyticsNoLiveTracking !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger monitor summary missing marketing analytics no-live-tracking posture");
if (exportedLedger.monitor.marketingAnalyticsNoPersonalData !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger monitor summary missing marketing analytics no-personal-data posture");
if (exportedLedger.monitor.marketingAnalyticsUnder19ConsentGated !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger monitor summary missing marketing analytics under-19 consent posture");
if (exportedLedger.monitor.calendarAdapterPrototypes !== returnResult.data.calendarAdapterPrototypes.length) fail("ledger monitor summary missing calendar adapter prototypes");
if (exportedLedger.monitor.calendarAdapterNoLiveProvider !== returnResult.data.calendarAdapterPrototypes.length) fail("ledger monitor summary missing calendar adapter no-live-provider posture");
if (exportedLedger.monitor.calendarAdapterNoInvitationSend !== returnResult.data.calendarAdapterPrototypes.length) fail("ledger monitor summary missing calendar adapter no-invitation-send posture");
if (exportedLedger.monitor.notificationProviderPrototypes !== returnResult.data.notificationProviderPrototypes.length) fail("ledger monitor summary missing notification provider prototypes");
if (exportedLedger.monitor.notificationPrototypeNoLiveSend !== returnResult.data.notificationProviderPrototypes.length) fail("ledger monitor summary missing notification prototype no-live-send posture");
if (exportedLedger.monitor.notificationPrototypeNoCustomerVisibleSend !== returnResult.data.notificationProviderPrototypes.length) fail("ledger monitor summary missing notification prototype no-customer-visible-send posture");
if (exportedLedger.monitor.paymentProviderPrototypes !== returnResult.data.paymentProviderPrototypes.length) fail("ledger monitor summary missing payment provider prototypes");
if (exportedLedger.monitor.paymentPrototypeNoLivePayment !== returnResult.data.paymentProviderPrototypes.length) fail("ledger monitor summary missing payment prototype no-live-payment posture");
if (exportedLedger.monitor.paymentPrototypeNoCustomerVisiblePayment !== returnResult.data.paymentProviderPrototypes.length) fail("ledger monitor summary missing payment prototype no-customer-visible-payment posture");
if (exportedLedger.monitor.paymentPrototypeNoPaymentCapture !== returnResult.data.paymentProviderPrototypes.length) fail("ledger monitor summary missing payment prototype no-capture posture");
if (exportedLedger.monitor.paymentPrototypeUnder19Guarded !== returnResult.data.paymentProviderPrototypes.length) fail("ledger monitor summary missing payment prototype under-19 guard posture");
if (exportedLedger.monitor.authProviderPrototypes !== returnResult.data.authProviderPrototypes.length) fail("ledger monitor summary missing auth provider prototypes");
if (exportedLedger.monitor.authPrototypeNoLiveAuth !== returnResult.data.authProviderPrototypes.length) fail("ledger monitor summary missing auth prototype no-live-auth posture");
if (exportedLedger.monitor.authPrototypeNoTokenStorage !== returnResult.data.authProviderPrototypes.length) fail("ledger monitor summary missing auth prototype no-token-storage posture");
if (exportedLedger.monitor.authPrototypeRawAdminDenied !== returnResult.data.authProviderPrototypes.length) fail("ledger monitor summary missing auth prototype raw-admin denial posture");
if (exportedLedger.monitor.authPrototypeRawMonitorDenied !== returnResult.data.authProviderPrototypes.length) fail("ledger monitor summary missing auth prototype raw-monitor denial posture");
if (exportedLedger.monitor.accountHistories !== exportedLedger.data.customers.length) fail("ledger monitor summary missing account histories");
if (exportedLedger.monitor.accountHistoryLocalOnly !== exportedLedger.data.customers.length) fail("ledger monitor summary missing account history local-only posture");
if (exportedLedger.monitor.accountHistoryViolations !== 0) fail("ledger monitor summary should not report account history violations");
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
if (outboxLedger.notificationProvider.noLiveSend !== retryDeliveryResult.data.notificationProviderHandoffs.length) fail("ledger notification provider summary lost no-live-send readiness");

const notificationProviderLedger = recordTools.createOperatingLedger(notificationProviderTransition.data, { now: "2026-06-01T04:43:30.000Z" });
if (notificationProviderLedger.counts.notificationProviderHandoffs !== notificationProviderTransition.data.notificationProviderHandoffs.length) fail("ledger export notification provider transition count is wrong");
if (notificationProviderLedger.notificationProvider.consentReady < 3) fail("ledger export missing notification provider consent readiness after transition");
if (notificationProviderLedger.monitor.notificationProviderViolations !== 0) fail("ledger monitor summary should not report notification provider violations after transition");

const paymentProviderLedger = recordTools.createOperatingLedger(paymentProviderTransition.data, { now: "2026-06-01T04:43:45.000Z" });
if (paymentProviderLedger.counts.paymentProviderHandoffs !== paymentProviderTransition.data.paymentProviderHandoffs.length) fail("ledger export payment provider transition count is wrong");
if (paymentProviderLedger.paymentProvider.checkoutReady < 1) fail("ledger export missing payment provider checkout readiness after transition");
if (paymentProviderLedger.paymentProvider.noLivePayment !== paymentProviderTransition.data.paymentProviderHandoffs.length) fail("ledger payment provider summary lost no-live-payment readiness");
if (paymentProviderLedger.monitor.paymentProviderViolations !== 0) fail("ledger monitor summary should not report payment provider violations after transition");

const authSessionLedger = recordTools.createOperatingLedger(authSessionTransition.data, { now: "2026-06-01T04:43:50.000Z" });
if (authSessionLedger.counts.authSessionRoleHandoffs !== authSessionTransition.data.authSessionRoleHandoffs.length) fail("ledger export auth/session role transition count is wrong");
if (authSessionLedger.authSession.internalDenied < 2) fail("ledger export missing auth/session internal denial after transition");
if (authSessionLedger.authSession.noLiveAuth !== authSessionTransition.data.authSessionRoleHandoffs.length) fail("ledger auth/session summary lost no-live-auth readiness");
if (authSessionLedger.monitor.authSessionRoleViolations !== 0) fail("ledger monitor summary should not report auth/session role violations after transition");

const marketingConversionLedger = recordTools.createOperatingLedger(conversionTransitionResult.data, { now: "2026-06-01T04:43:55.000Z" });
if (marketingConversionLedger.counts.marketingConversionEvents !== conversionTransitionResult.data.marketingConversionEvents.length) fail("ledger export marketing conversion transition count is wrong");
if (marketingConversionLedger.marketingConversion.recordedEvents < 1) fail("ledger export missing recorded marketing conversion after transition");
if (marketingConversionLedger.marketingConversion.noLiveTracking !== conversionTransitionResult.data.marketingConversionEvents.length) fail("ledger marketing conversion summary lost no-live-tracking posture");
if (marketingConversionLedger.monitor.marketingConversionViolations !== 0) fail("ledger monitor summary should not report marketing conversion violations after transition");

const providerAdapterLedger = recordTools.createOperatingLedger(providerAdapterTransitionResult.data, { now: "2026-06-01T04:43:58.000Z" });
if (providerAdapterLedger.counts.providerAdapterCandidates !== providerAdapterTransitionResult.data.providerAdapterCandidates.length) fail("ledger export provider adapter transition count is wrong");
if (providerAdapterLedger.providerAdapters.approvedSandboxOnly < 1) fail("ledger export missing provider adapter sandbox approval after transition");
if (providerAdapterLedger.providerAdapters.noLiveProvider !== providerAdapterTransitionResult.data.providerAdapterCandidates.length) fail("ledger provider adapter summary lost no-live-provider posture");
if (providerAdapterLedger.monitor.providerAdapterViolations !== 0) fail("ledger monitor summary should not report provider adapter violations after transition");

const marketingAnalyticsLedger = recordTools.createOperatingLedger(marketingAnalyticsTransitionResult.data, { now: "2026-06-01T04:43:58.500Z" });
if (marketingAnalyticsLedger.counts.marketingAnalyticsAdapterPrototypes !== marketingAnalyticsTransitionResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger export marketing analytics prototype transition count is wrong");
if (marketingAnalyticsLedger.marketingAnalytics.payloadReady < 1) fail("ledger export missing marketing analytics payload readiness after transition");
if (marketingAnalyticsLedger.marketingAnalytics.noLiveTracking !== marketingAnalyticsTransitionResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger marketing analytics summary lost no-live-tracking posture");
if (marketingAnalyticsLedger.marketingAnalytics.noPersonalData !== marketingAnalyticsTransitionResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger marketing analytics summary lost no-personal-data posture");
if (marketingAnalyticsLedger.marketingAnalytics.under19ConsentGated !== marketingAnalyticsTransitionResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger marketing analytics summary lost under-19 consent posture");
if (marketingAnalyticsLedger.monitor.marketingAnalyticsViolations !== 0) fail("ledger monitor summary should not report marketing analytics prototype violations after transition");

const calendarAdapterLedger = recordTools.createOperatingLedger(calendarAdapterTransitionResult.data, { now: "2026-06-01T04:43:59.000Z" });
if (calendarAdapterLedger.counts.calendarAdapterPrototypes !== calendarAdapterTransitionResult.data.calendarAdapterPrototypes.length) fail("ledger export calendar adapter transition count is wrong");
if (calendarAdapterLedger.calendarAdapter.payloadReady < 1) fail("ledger export missing calendar adapter payload readiness after transition");
if (calendarAdapterLedger.calendarAdapter.noLiveProvider !== calendarAdapterTransitionResult.data.calendarAdapterPrototypes.length) fail("ledger calendar adapter summary lost no-live-provider posture");
if (calendarAdapterLedger.calendarAdapter.noInvitationSend !== calendarAdapterTransitionResult.data.calendarAdapterPrototypes.length) fail("ledger calendar adapter summary lost no-invitation-send posture");
if (calendarAdapterLedger.monitor.calendarAdapterViolations !== 0) fail("ledger monitor summary should not report calendar adapter violations after transition");

const notificationPrototypeLedger = recordTools.createOperatingLedger(notificationPrototypeTransitionResult.data, { now: "2026-06-01T04:43:59.250Z" });
if (notificationPrototypeLedger.counts.notificationProviderPrototypes !== notificationPrototypeTransitionResult.data.notificationProviderPrototypes.length) fail("ledger export notification prototype transition count is wrong");
if (notificationPrototypeLedger.notificationPrototype.payloadReady < 1) fail("ledger export missing notification prototype payload readiness after transition");
if (notificationPrototypeLedger.notificationPrototype.noLiveSend !== notificationPrototypeTransitionResult.data.notificationProviderPrototypes.length) fail("ledger notification prototype summary lost no-live-send posture");
if (notificationPrototypeLedger.notificationPrototype.noCustomerVisibleSend !== notificationPrototypeTransitionResult.data.notificationProviderPrototypes.length) fail("ledger notification prototype summary lost no-customer-visible-send posture");
if (notificationPrototypeLedger.monitor.notificationPrototypeViolations !== 0) fail("ledger monitor summary should not report notification prototype violations after transition");

const paymentPrototypeLedger = recordTools.createOperatingLedger(paymentPrototypeTransitionResult.data, { now: "2026-06-01T04:43:59.500Z" });
if (paymentPrototypeLedger.counts.paymentProviderPrototypes !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger export payment prototype transition count is wrong");
if (paymentPrototypeLedger.paymentPrototype.payloadReady < 1) fail("ledger export missing payment prototype payload readiness after transition");
if (paymentPrototypeLedger.paymentPrototype.noLivePayment !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger payment prototype summary lost no-live-payment posture");
if (paymentPrototypeLedger.paymentPrototype.noCustomerVisiblePayment !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger payment prototype summary lost no-customer-visible-payment posture");
if (paymentPrototypeLedger.paymentPrototype.noPaymentCapture !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger payment prototype summary lost no-capture posture");
if (paymentPrototypeLedger.paymentPrototype.under19Guarded !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger payment prototype summary lost under-19 guard posture");
if (paymentPrototypeLedger.monitor.paymentPrototypeViolations !== 0) fail("ledger monitor summary should not report payment prototype violations after transition");

const authPrototypeLedger = recordTools.createOperatingLedger(authPrototypeTransitionResult.data, { now: "2026-06-01T04:43:59.750Z" });
if (authPrototypeLedger.counts.authProviderPrototypes !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger export auth prototype transition count is wrong");
if (authPrototypeLedger.authPrototype.payloadReady < 1) fail("ledger export missing auth prototype payload readiness after transition");
if (authPrototypeLedger.authPrototype.noLiveAuth !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger auth prototype summary lost no-live-auth posture");
if (authPrototypeLedger.authPrototype.noTokenStorage !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger auth prototype summary lost no-token-storage posture");
if (authPrototypeLedger.authPrototype.noCustomerVisibleAuth !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger auth prototype summary lost no-customer-visible-auth posture");
if (authPrototypeLedger.authPrototype.rawAdminDenied !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger auth prototype summary lost raw-admin denial posture");
if (authPrototypeLedger.authPrototype.rawMonitorDenied !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger auth prototype summary lost raw-monitor denial posture");
if (authPrototypeLedger.monitor.authPrototypeViolations !== 0) fail("ledger monitor summary should not report auth prototype violations after transition");

const accountHistoryLedger = recordTools.createOperatingLedger(accountHistoryRefreshResult.data, { now: "2026-06-01T04:43:59.500Z" });
if (accountHistoryLedger.counts.customerAccountHistories !== accountHistoryLedger.data.customers.length) fail("ledger export account history refresh count is wrong");
if (accountHistoryLedger.accountHistory.historyCount !== accountHistoryLedger.data.customers.length) fail("ledger export missing refreshed account history summary");
if (accountHistoryLedger.accountHistory.localOnly !== accountHistoryLedger.data.customers.length) fail("ledger account history summary lost local-only posture");
if (accountHistoryLedger.monitor.accountHistoryViolations !== 0) fail("ledger monitor summary should not report account history violations after refresh");

const quoteLedger = recordTools.createOperatingLedger(paymentReadyQuoteResult.data, { now: "2026-06-01T04:44:00.000Z" });
if (quoteLedger.counts.quotes !== paymentReadyQuoteResult.data.quotes.length) fail("ledger export quote count is wrong");
if (quoteLedger.monitor.paymentReadyQuotes < 1) fail("ledger monitor summary missing payment-ready quote count");

const scheduleControlLedger = recordTools.createOperatingLedger(reopenedAvailabilityResult.data, { now: "2026-06-01T04:45:00.000Z" });
if (scheduleControlLedger.counts.reminderRules !== reopenedAvailabilityResult.data.reminderRules.length) fail("ledger export reminder count is wrong");
if (scheduleControlLedger.counts.recurrenceCandidates !== reopenedAvailabilityResult.data.recurrenceCandidates.length) fail("ledger export recurrence count is wrong");
if (scheduleControlLedger.counts.availabilityWindows !== reopenedAvailabilityResult.data.availabilityWindows.length) fail("ledger export availability count is wrong");
if (scheduleControlLedger.monitor.availabilityWindows < 1) fail("ledger monitor summary missing availability windows");

const importedLedger = recordTools.importOperatingLedger(data, JSON.stringify(exportedLedger));
if (importedLedger.data.receipts.length !== returnResult.data.receipts.length) fail("ledger import did not preserve receipts");
if (importedLedger.data.monitorHealthChecks.length !== returnResult.data.monitorHealthChecks.length) fail("ledger import did not preserve monitor health checks");
if (importedLedger.data.notificationEvents.length !== returnResult.data.notificationEvents.length) fail("ledger import did not preserve update events");
if (importedLedger.data.routePlacements.length !== returnResult.data.routePlacements.length) fail("ledger import did not preserve route placements");
if (importedLedger.data.accessGateways.length !== returnResult.data.accessGateways.length) fail("ledger import did not preserve access gateways");
if (importedLedger.data.librarySyncHandoffs.length !== returnResult.data.librarySyncHandoffs.length) fail("ledger import did not preserve LIBRARY sync handoffs");
if (importedLedger.data.calendarProviderHandoffs.length !== returnResult.data.calendarProviderHandoffs.length) fail("ledger import did not preserve calendar provider handoffs");
if (importedLedger.data.notificationProviderHandoffs.length !== returnResult.data.notificationProviderHandoffs.length) fail("ledger import did not preserve notification provider handoffs");
if (importedLedger.data.paymentProviderHandoffs.length !== returnResult.data.paymentProviderHandoffs.length) fail("ledger import did not preserve payment provider handoffs");
if (importedLedger.data.authSessionRoleHandoffs.length !== returnResult.data.authSessionRoleHandoffs.length) fail("ledger import did not preserve auth/session role handoffs");
if (importedLedger.data.marketingConversionEvents.length !== returnResult.data.marketingConversionEvents.length) fail("ledger import did not preserve marketing conversion events");
if (importedLedger.data.providerAdapterCandidates.length !== returnResult.data.providerAdapterCandidates.length) fail("ledger import did not preserve provider adapter candidates");
if (importedLedger.data.marketingAnalyticsAdapterPrototypes.length !== returnResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger import did not preserve marketing analytics adapter prototypes");
if (importedLedger.data.calendarAdapterPrototypes.length !== returnResult.data.calendarAdapterPrototypes.length) fail("ledger import did not preserve calendar adapter prototypes");
if (importedLedger.data.notificationProviderPrototypes.length !== returnResult.data.notificationProviderPrototypes.length) fail("ledger import did not preserve notification provider prototypes");
if (importedLedger.data.paymentProviderPrototypes.length !== returnResult.data.paymentProviderPrototypes.length) fail("ledger import did not preserve payment provider prototypes");
if (importedLedger.data.authProviderPrototypes.length !== returnResult.data.authProviderPrototypes.length) fail("ledger import did not preserve auth provider prototypes");
if (importedLedger.data.customerAccountHistories.length !== exportedLedger.data.customerAccountHistories.length) fail("ledger import did not preserve account histories");
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

const importedNotificationProviderLedger = recordTools.importOperatingLedger(data, JSON.stringify(notificationProviderLedger));
if (importedNotificationProviderLedger.data.notificationProviderHandoffs.length !== notificationProviderTransition.data.notificationProviderHandoffs.length) fail("ledger import did not preserve notification provider handoffs");
if (!importedNotificationProviderLedger.data.notificationProviderHandoffs.some((item) => item.handoffStatus === "consent-review-ready")) fail("ledger import did not preserve notification provider transition status");
if (!importedNotificationProviderLedger.data.notificationProviderHandoffs.every((item) => item.liveSendEnabled === false && item.externalProviderWrite === false && item.storesCredentials === false && item.webhookEnabled === false)) {
  fail("ledger import changed notification provider no-live-send safeguards");
}

const importedPaymentProviderLedger = recordTools.importOperatingLedger(data, JSON.stringify(paymentProviderLedger));
if (importedPaymentProviderLedger.data.paymentProviderHandoffs.length !== paymentProviderTransition.data.paymentProviderHandoffs.length) fail("ledger import did not preserve payment provider handoffs");
if (!importedPaymentProviderLedger.data.paymentProviderHandoffs.some((item) => item.handoffStatus === "checkout-review-ready")) fail("ledger import did not preserve payment provider transition status");
if (!importedPaymentProviderLedger.data.paymentProviderHandoffs.every((item) => item.livePaymentEnabled === false && item.externalProviderWrite === false && item.storesCredentials === false && item.webhookEnabled === false && item.capturesPayment === false)) {
  fail("ledger import changed payment provider no-live-payment safeguards");
}

const importedAuthSessionLedger = recordTools.importOperatingLedger(data, JSON.stringify(authSessionLedger));
if (importedAuthSessionLedger.data.authSessionRoleHandoffs.length !== authSessionTransition.data.authSessionRoleHandoffs.length) fail("ledger import did not preserve auth/session role handoffs");
if (!importedAuthSessionLedger.data.authSessionRoleHandoffs.some((item) => item.handoffStatus === "raw-surface-denied")) fail("ledger import did not preserve auth/session role transition status");
if (!importedAuthSessionLedger.data.authSessionRoleHandoffs.every((item) => item.productionAuthEnabled === false && item.identityProviderWrite === false && item.storesCredentials === false && item.storesTokens === false && item.oauthClientConfigured === false && item.externalSessionEnabled === false)) {
  fail("ledger import changed auth/session no-live-auth safeguards");
}

const importedMarketingConversionLedger = recordTools.importOperatingLedger(data, JSON.stringify(marketingConversionLedger));
if (importedMarketingConversionLedger.data.marketingConversionEvents.length !== conversionTransitionResult.data.marketingConversionEvents.length) fail("ledger import did not preserve marketing conversion events");
if (!importedMarketingConversionLedger.data.marketingConversionEvents.some((item) => item.status === "converted")) fail("ledger import did not preserve converted marketing conversion status");
if (!importedMarketingConversionLedger.data.marketingConversionEvents.every((item) => item.livePixelEnabled === false && item.externalAdApiWrite === false && item.invasiveTracking === false && item.storesPersonalData === false && item.productionAnalyticsCredential === false && item.webhookEnabled === false && item.crossSiteIdentifier === false)) {
  fail("ledger import changed marketing conversion no-live-tracking safeguards");
}

const importedProviderAdapterLedger = recordTools.importOperatingLedger(data, JSON.stringify(providerAdapterLedger));
if (importedProviderAdapterLedger.data.providerAdapterCandidates.length !== providerAdapterTransitionResult.data.providerAdapterCandidates.length) fail("ledger import did not preserve provider adapter candidates");
if (!importedProviderAdapterLedger.data.providerAdapterCandidates.some((item) => item.goNoGoState === "approved-sandbox-only")) fail("ledger import did not preserve provider adapter sandbox approval");
if (!importedProviderAdapterLedger.data.providerAdapterCandidates.every((item) => item.liveApiCalls === false && item.productionEnabled === false && item.secretsPresent === false && item.credentialsStored === false && item.oauthConfigured === false && item.webhookEnabled === false && item.externalProviderWrite === false)) {
  fail("ledger import changed provider adapter no-live-provider safeguards");
}

const importedMarketingAnalyticsLedger = recordTools.importOperatingLedger(data, JSON.stringify(marketingAnalyticsLedger));
if (importedMarketingAnalyticsLedger.data.marketingAnalyticsAdapterPrototypes.length !== marketingAnalyticsTransitionResult.data.marketingAnalyticsAdapterPrototypes.length) fail("ledger import did not preserve marketing analytics adapter prototypes");
if (!importedMarketingAnalyticsLedger.data.marketingAnalyticsAdapterPrototypes.some((item) => item.prototypeStatus === "sandbox-approved")) fail("ledger import did not preserve marketing analytics prototype sandbox approval");
if (!importedMarketingAnalyticsLedger.data.marketingAnalyticsAdapterPrototypes.every((item) => item.livePixelEnabled === false && item.externalAdApiWrite === false && item.liveApiCalls === false && item.externalProviderWrite === false && item.productionEnabled === false && item.invasiveTracking === false && item.storesPersonalData === false && item.productionAnalyticsCredential === false && item.secretsPresent === false && item.credentialsStored === false && item.storesCredentials === false && item.oauthConfigured === false && item.webhookEnabled === false && item.crossSiteIdentifier === false && item.thirdPartyCookieEnabled === false && item.fingerprintingEnabled === false && item.crossDeviceIdentityEnabled === false && item.customerVisible === false && item.publicProofSurface === false && item.under19ConsentGated === true && item.noPaidActionBeforeConsent === true)) {
  fail("ledger import changed marketing analytics no-live-tracking or consent safeguards");
}

const importedCalendarAdapterLedger = recordTools.importOperatingLedger(data, JSON.stringify(calendarAdapterLedger));
if (importedCalendarAdapterLedger.data.calendarAdapterPrototypes.length !== calendarAdapterTransitionResult.data.calendarAdapterPrototypes.length) fail("ledger import did not preserve calendar adapter prototypes");
if (!importedCalendarAdapterLedger.data.calendarAdapterPrototypes.some((item) => item.prototypeStatus === "sandbox-approved")) fail("ledger import did not preserve calendar adapter sandbox approval");
if (!importedCalendarAdapterLedger.data.calendarAdapterPrototypes.every((item) => item.liveApiCalls === false && item.liveSyncEnabled === false && item.sendsInvitations === false && item.externalProviderWrite === false && item.productionEnabled === false && item.secretsPresent === false && item.credentialsStored === false && item.oauthConfigured === false && item.webhookEnabled === false)) {
  fail("ledger import changed calendar adapter no-live-provider safeguards");
}

const importedNotificationPrototypeLedger = recordTools.importOperatingLedger(data, JSON.stringify(notificationPrototypeLedger));
if (importedNotificationPrototypeLedger.data.notificationProviderPrototypes.length !== notificationPrototypeTransitionResult.data.notificationProviderPrototypes.length) fail("ledger import did not preserve notification provider prototypes");
if (!importedNotificationPrototypeLedger.data.notificationProviderPrototypes.some((item) => item.prototypeStatus === "sandbox-approved")) fail("ledger import did not preserve notification provider prototype sandbox approval");
if (!importedNotificationPrototypeLedger.data.notificationProviderPrototypes.every((item) => item.liveSendEnabled === false && item.liveEmailSend === false && item.liveLineSend === false && item.liveSmsSend === false && item.liveNexusSend === false && item.externalProviderWrite === false && item.productionEnabled === false && item.secretsPresent === false && item.credentialsStored === false && item.storesCredentials === false && item.oauthConfigured === false && item.webhookEnabled === false && item.customerVisible === false)) {
  fail("ledger import changed notification prototype no-live-send safeguards");
}

const importedPaymentPrototypeLedger = recordTools.importOperatingLedger(data, JSON.stringify(paymentPrototypeLedger));
if (importedPaymentPrototypeLedger.data.paymentProviderPrototypes.length !== paymentPrototypeTransitionResult.data.paymentProviderPrototypes.length) fail("ledger import did not preserve payment provider prototypes after transition");
if (!importedPaymentPrototypeLedger.data.paymentProviderPrototypes.some((item) => item.prototypeStatus === "sandbox-approved")) fail("ledger import did not preserve payment provider prototype sandbox approval");
if (!importedPaymentPrototypeLedger.data.paymentProviderPrototypes.every((item) => item.livePaymentEnabled === false && item.liveCheckoutEnabled === false && item.liveCaptureEnabled === false && item.liveRefundEnabled === false && item.invoiceSendEnabled === false && item.checkoutSessionCreated === false && item.paymentLinkCreated === false && item.capturesPayment === false && item.externalProviderWrite === false && item.productionEnabled === false && item.secretsPresent === false && item.credentialsStored === false && item.storesCredentials === false && item.oauthConfigured === false && item.webhookEnabled === false && item.customerVisible === false)) {
  fail("ledger import changed payment prototype no-live-payment safeguards");
}

const importedAuthPrototypeLedger = recordTools.importOperatingLedger(data, JSON.stringify(authPrototypeLedger));
if (importedAuthPrototypeLedger.data.authProviderPrototypes.length !== authPrototypeTransitionResult.data.authProviderPrototypes.length) fail("ledger import did not preserve auth provider prototypes after transition");
if (!importedAuthPrototypeLedger.data.authProviderPrototypes.some((item) => item.prototypeStatus === "sandbox-approved")) fail("ledger import did not preserve auth provider prototype sandbox approval");
if (!importedAuthPrototypeLedger.data.authProviderPrototypes.every((item) => item.liveAuthEnabled === false && item.liveLoginEnabled === false && item.productionAuthEnabled === false && item.identityProviderWrite === false && item.externalProviderWrite === false && item.externalSessionEnabled === false && item.oauthClientConfigured === false && item.oauthConfigured === false && item.secretsPresent === false && item.credentialsStored === false && item.storesCredentials === false && item.storesTokens === false && item.tokenStorageEnabled === false && item.refreshTokenStorageEnabled === false && item.webhookEnabled === false && item.customerVisible === false && item.rawAdminExposure === false && item.rawMonitorExposure === false)) {
  fail("ledger import changed auth prototype no-live-auth safeguards");
}

const importedAccountHistoryLedger = recordTools.importOperatingLedger(data, JSON.stringify(accountHistoryLedger));
if (importedAccountHistoryLedger.data.customerAccountHistories.length !== accountHistoryLedger.data.customerAccountHistories.length) fail("ledger import did not preserve account histories after refresh");
if (!importedAccountHistoryLedger.data.customerAccountHistories.every((item) => item.localOnly === true && item.customerSafe === true && item.liveProviderWrite === false && item.externalNotification === false && item.productionEnabled === false)) {
  fail("ledger import changed account history local-only safeguards");
}

const importedQuoteLedger = recordTools.importOperatingLedger(data, JSON.stringify(quoteLedger));
if (importedQuoteLedger.data.quotes.length !== paymentReadyQuoteResult.data.quotes.length) fail("ledger import did not preserve quote records");
if (!importedQuoteLedger.data.quotes.some((item) => item.status === "payment-ready")) fail("ledger import did not preserve payment-ready quote status");
if (!importedQuoteLedger.data.quotes.some((item) => Array.isArray(item.quoteHistory) && item.quoteHistory.length >= 5)) fail("ledger import did not preserve quote history");

const importedScheduleControlLedger = recordTools.importOperatingLedger(data, JSON.stringify(scheduleControlLedger));
if (importedScheduleControlLedger.data.reminderRules.length !== reopenedAvailabilityResult.data.reminderRules.length) fail("ledger import did not preserve reminder rules");
if (importedScheduleControlLedger.data.recurrenceCandidates.length !== reopenedAvailabilityResult.data.recurrenceCandidates.length) fail("ledger import did not preserve recurrence candidates");
if (importedScheduleControlLedger.data.availabilityWindows.length !== reopenedAvailabilityResult.data.availabilityWindows.length) fail("ledger import did not preserve availability windows");
if (!importedScheduleControlLedger.data.availabilityWindows.some((item) => Array.isArray(item.availabilityHistory) && item.availabilityHistory.length >= 3)) fail("ledger import did not preserve availability history");

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
