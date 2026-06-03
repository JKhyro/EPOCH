import {
  EPOCH_LEDGER_KEY,
  createAvailabilityConflictDecisionForHandoff,
  createAvailabilityCapacityReceiptForPromotion,
  createAvailabilityCapacitySnapshotForWindow,
  createAvailabilityHoldForAcceptance,
  createAvailabilityHoldReleaseForHold,
  createAvailabilityPromotionCandidateForWaitlist,
  createAvailabilityWaitlistEntryForRequest,
  createBookingOptimizationRunForRequest,
  createBookingOverloadWarningForWindow,
  createBookingConfirmationForHold,
  createBookingRecommendationCandidateForWindow,
  createBookingRecommendationReceiptForRun,
  createBookingReceiptForConfirmation,
  createDeadlineEscalationForExecution,
  createDeadlineExecutionForItem,
  createReminderDeadlineReceiptForEscalation,
  createReminderExecutionForRule,
  createRevisedAvailabilityExceptionForTiming,
  createRevisedAvailabilityExceptionReceiptForException,
  createScheduleEntryForRequest,
  createScheduleLifecycleActionRecord,
  createScheduleRequestRecord,
  createScheduleRequestAcceptanceForRequest,
  createScheduleStatusEventForConflict,
  createScheduleStatusEventForBooking,
  createRecurrenceConflictExceptionForInstance,
  createRecurringBookingInstanceForSeries,
  createRecurringBookingSeriesForRule,
  createRecurringSeriesReceiptForSeries,
  createTimingHandoffForRequest,
  createTimingReturnPayloadForDecision,
  createTimingReturnReceiptForPayload,
  initialEpochLedger,
  providerGateBlocksLiveCalls,
  providerGateReadyForToggle,
  projectRevisedRulepackConstraints,
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  revisedMonths,
  rankAvailabilityWindowsForRequest,
  scheduleLifecycleActionOptions,
  scheduleNeedLabel,
  scheduleNeedOptions,
  selectFullAvailabilityWindow,
  selectOpenAvailabilityWindow
} from "./epoch-data.js?v=epoch-revised-availability-exceptions";

const clone = (value) => JSON.parse(JSON.stringify(value));

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const sanitizeCustomerPortalText = (value) => typeof value === "string"
  ? value.replaceAll("MONITOR", "internal controls")
  : value;

const sanitizeCustomerVisiblePortalCopy = (ledger) => {
  for (const value of Object.values(ledger)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (!item || typeof item !== "object" || !item.customerVisible) continue;
      for (const key of ["summary", "customerSafeStatus", "detail"]) {
        item[key] = sanitizeCustomerPortalText(item[key]);
      }
    }
  }
  return ledger;
};

const mergeLedger = (stored) => {
  const base = clone(initialEpochLedger);
  if (!stored || typeof stored !== "object") return sanitizeCustomerVisiblePortalCopy(base);
  for (const key of [
    "scheduleEntries",
    "scheduleRequests",
    "timingHandoffs",
    "availabilityConflictDecisions",
    "scheduleRequestAcceptances",
    "availabilityHolds",
    "bookingConfirmations",
    "scheduleStatusEvents",
    "bookingReceipts",
    "timingReturnPayloads",
    "timingReturnReceipts",
    "availabilityWindows",
    "availabilityCapacitySnapshots",
    "availabilityWaitlistEntries",
    "availabilityHoldReleases",
    "availabilityPromotionCandidates",
    "availabilityCapacityReceipts",
    "bookingOptimizationRuns",
    "bookingRecommendationCandidates",
    "bookingOverloadWarnings",
    "bookingRecommendationReceipts",
    "deadlineItems",
    "reminderExecutions",
    "deadlineExecutions",
    "deadlineEscalations",
    "reminderDeadlineReceipts",
    "recurrenceCandidates",
    "recurringBookingSeries",
    "recurringBookingInstances",
    "recurrenceConflictExceptions",
    "revisedAvailabilityExceptions",
    "revisedAvailabilityExceptionReceipts",
    "recurringSeriesReceipts",
    "reminderRules",
    "providerReadinessGates",
    "providerStatusEvents",
    "calendarDisplayModes",
    "scheduleAuditRecords",
    "scheduleReceipts",
    "schedulerLogEntries",
    "calendarSearchQueries",
    "calendarSearchResults",
    "scheduleTemplates",
    "scheduleLifecycleActions",
    "portalTimeline",
    "receipts"
  ]) {
    if (Array.isArray(stored[key])) base[key] = stored[key];
  }
  if (stored.schedulingCoreReadiness && typeof stored.schedulingCoreReadiness === "object") {
    base.schedulingCoreReadiness = stored.schedulingCoreReadiness;
  }
  if (stored.revisedCalendarRulepack && typeof stored.revisedCalendarRulepack === "object") {
    base.revisedCalendarRulepack = stored.revisedCalendarRulepack;
  }
  if (stored.avaloniaShellReadiness && typeof stored.avaloniaShellReadiness === "object") {
    base.avaloniaShellReadiness = stored.avaloniaShellReadiness;
  }
  base.version = stored.version || base.version;
  base.generatedAt = stored.generatedAt || base.generatedAt;
  return sanitizeCustomerVisiblePortalCopy(base);
};

const loadLedger = () => {
  const storage = getStorage();
  if (!storage) return clone(initialEpochLedger);
  try {
    return mergeLedger(JSON.parse(storage.getItem(EPOCH_LEDGER_KEY)));
  } catch {
    return clone(initialEpochLedger);
  }
};

const saveLedger = (nextLedger) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_LEDGER_KEY, JSON.stringify(nextLedger));
};

const EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY = "epoch.webportal.customerScheduleStatusExports.v1";

const normalizeCustomerScheduleStatusExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true;
  if (!customerSafe) return null;

  return {
    statusId: String(item.statusId || item.id || "local-schedule-status"),
    requestId: String(item.requestId || "schedule request"),
    status: String(item.status || "local-schedule-status-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your schedule status is ready."),
    nextAction: String(item.nextAction || "Review the returned timing status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.CustomerSafeStatusExport")
  };
};

const normalizeCustomerScheduleStatusPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.statuses)
      ? payload.statuses
      : payload?.statusId
        ? [payload]
        : [];
  return records
    .map(normalizeCustomerScheduleStatusExport)
    .filter(Boolean);
};

const loadCustomerScheduleStatusExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeCustomerScheduleStatusPayload(JSON.parse(storage.getItem(EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveCustomerScheduleStatusExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_CUSTOMER_SCHEDULE_STATUS_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY = "epoch.webportal.scheduleLifecycleStatusExports.v1";

const normalizeScheduleLifecycleStatusExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true;
  if (!customerSafe) return null;

  return {
    statusId: String(item.statusId || item.id || "local-lifecycle-status"),
    actionId: String(item.actionId || "schedule lifecycle action"),
    requestId: String(item.requestId || "schedule request"),
    actionKind: String(item.actionKind || "lifecycle-action"),
    requestedWindow: String(item.requestedWindow || "Window to be confirmed"),
    status: String(item.status || "local-schedule-lifecycle-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your schedule change request is ready for review."),
    nextAction: String(item.nextAction || "Review the customer-safe schedule lifecycle status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.ScheduleLifecycleStatusExport")
  };
};

const normalizeScheduleLifecycleStatusPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.statuses)
      ? payload.statuses
      : payload?.statusId
        ? [payload]
        : [];
  return records
    .map(normalizeScheduleLifecycleStatusExport)
    .filter(Boolean);
};

const loadScheduleLifecycleStatusExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeScheduleLifecycleStatusPayload(JSON.parse(storage.getItem(EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveScheduleLifecycleStatusExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_SCHEDULE_LIFECYCLE_STATUS_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY = "epoch.webportal.revisedReminderDeadlineReceipts.v1";

const normalizeRevisedReminderDeadlineReceiptExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.notificationSendEnabled !== true &&
    item.providerCallsEnabled !== true &&
    item.monitorWorkflowExposed !== true &&
    item.workshopCalendarOwnership !== true;
  if (!customerSafe) return null;

  return {
    receiptId: String(item.receiptId || item.id || "revised-reminder-deadline-receipt"),
    requestId: String(item.requestId || "schedule request"),
    revisedTimingPayloadId: String(item.revisedTimingPayloadId || "revised timing payload"),
    kind: String(item.kind || "revised-reminder-deadline-execution"),
    status: String(item.status || "customer-safe-revised-deadline-status-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your reminder/deadline status is ready."),
    nextAction: String(item.nextAction || "Review the customer-safe revised reminder/deadline status."),
    createdAtUtc: String(item.createdAtUtc || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.RevisedReminderDeadlineReceipt")
  };
};

const normalizeRevisedReminderDeadlineReceiptPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.receipts)
      ? payload.receipts
      : payload?.receiptId
        ? [payload]
        : [];
  return records
    .map(normalizeRevisedReminderDeadlineReceiptExport)
    .filter(Boolean);
};

const loadRevisedReminderDeadlineReceiptExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeRevisedReminderDeadlineReceiptPayload(JSON.parse(storage.getItem(EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveRevisedReminderDeadlineReceiptExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_REVISED_REMINDER_DEADLINE_RECEIPT_EXPORT_KEY, JSON.stringify(records));
};

const EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY = "epoch.webportal.revisedAvailabilityExceptionReceipts.v1";

const normalizeRevisedAvailabilityExceptionReceiptExport = (item) => {
  if (!item || typeof item !== "object") return null;
  const customerSafe =
    item.customerSafe === true &&
    item.webportalExportReady === true &&
    item.notificationSendEnabled !== true &&
    item.providerCallsEnabled !== true &&
    item.providerGoLiveRequested !== true &&
    item.monitorWorkflowExposed !== true &&
    item.workshopCalendarOwnership !== true &&
    item.revisedConversionReady !== true;
  if (!customerSafe) return null;

  return {
    receiptId: String(item.receiptId || item.id || "revised-availability-exception-receipt"),
    exceptionId: String(item.exceptionId || "revised availability exception"),
    requestId: String(item.requestId || "schedule request"),
    revisedTimingPayloadId: String(item.revisedTimingPayloadId || "revised timing payload"),
    availabilityWindowId: String(item.availabilityWindowId || "availability window"),
    recurringSeriesId: String(item.recurringSeriesId || "recurring series"),
    recurringInstanceId: String(item.recurringInstanceId || "recurring instance"),
    kind: String(item.kind || "revised-availability-exception"),
    status: String(item.status || "customer-safe-revised-availability-exception-ready"),
    customerSafeMessage: String(item.customerSafeMessage || "Your recurring availability status is ready."),
    nextAction: String(item.nextAction || "Review the customer-safe revised availability exception."),
    createdAtUtc: String(item.createdAtUtc || item.generatedAt || ""),
    sourceSurface: String(item.sourceSurface || "EPOCH.App.RevisedAvailabilityExceptionReceipt")
  };
};

const normalizeRevisedAvailabilityExceptionReceiptPayload = (payload) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.receipts)
      ? payload.receipts
      : payload?.receiptId || payload?.id
        ? [payload]
        : [];
  return records
    .map(normalizeRevisedAvailabilityExceptionReceiptExport)
    .filter(Boolean);
};

const loadRevisedAvailabilityExceptionReceiptExports = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return normalizeRevisedAvailabilityExceptionReceiptPayload(JSON.parse(storage.getItem(EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY) || "[]"));
  } catch {
    return [];
  }
};

const saveRevisedAvailabilityExceptionReceiptExports = (records) => {
  const storage = getStorage();
  if (storage) storage.setItem(EPOCH_REVISED_AVAILABILITY_EXCEPTION_RECEIPT_EXPORT_KEY, JSON.stringify(records));
};

const state = {
  ledger: loadLedger()
};

const customerScheduleStatusExportState = {
  records: loadCustomerScheduleStatusExports()
};

const scheduleLifecycleStatusExportState = {
  records: loadScheduleLifecycleStatusExports()
};

const revisedReminderDeadlineReceiptExportState = {
  records: loadRevisedReminderDeadlineReceiptExports()
};

const revisedAvailabilityExceptionReceiptExportState = {
  records: loadRevisedAvailabilityExceptionReceiptExports()
};

const byId = (id) => document.getElementById(id);

const chip = (value) => `<span class="state-chip">${escapeHtml(value)}</span>`;

const renderStack = (targetId, items, renderItem, emptyText = "No records yet.") => {
  const target = byId(targetId);
  if (!target) return;
  target.innerHTML = items.length
    ? items.map(renderItem).join("")
    : `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
};

const setText = (id, value) => {
  const target = byId(id);
  if (target) target.textContent = value;
};

const renderNeedOptions = () => {
  const target = byId("schedule-need-select");
  if (!target) return;
  target.innerHTML = scheduleNeedOptions.map((option) => `
    <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>
  `).join("");
};

const renderLifecycleActionOptions = () => {
  const target = byId("schedule-lifecycle-action-select");
  if (!target) return;
  target.innerHTML = scheduleLifecycleActionOptions.map((option) => `
    <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>
  `).join("");
};

function renderStats() {
  const gates = state.ledger.providerReadinessGates;
  const blockedGateCount = gates.filter((gate) => providerGateBlocksLiveCalls(gate)).length;
  const openWindowCount = state.ledger.availabilityWindows.filter((window) => window.holds < window.capacity).length;
  setText("stat-schedule-requests", String(state.ledger.scheduleRequests.length));
  setText("stat-open-windows", String(openWindowCount));
  setText("stat-provider-blocks", String(blockedGateCount));
  setText("stat-live-state", gates.some((gate) => gate.liveProviderCallsEnabled) ? "Live enabled" : "Sandbox only");
  setText("stat-core-state", state.ledger.schedulingCoreReadiness?.scheduleEntryValidation || "pending");
  setText("stat-rulepack-state", revisedRulepackReady(state.ledger.revisedCalendarRulepack) ? "ready" : "held");
  setText("stat-accepted-requests", String((state.ledger.scheduleRequestAcceptances || []).length));
  setText("stat-active-holds", String((state.ledger.availabilityHolds || []).filter((hold) => hold.status !== "released").length));
  setText("stat-bookings", String((state.ledger.bookingConfirmations || []).length));
  setText("stat-booking-receipts", String((state.ledger.bookingReceipts || []).length));
  setText("stat-timing-handoffs", String((state.ledger.timingHandoffs || []).length));
  setText("stat-conflicts", String((state.ledger.availabilityConflictDecisions || []).filter((decision) => decision.status !== "clear").length));
  setText("stat-timing-returns", String((state.ledger.timingReturnPayloads || []).length));
  setText("stat-return-receipts", String((state.ledger.timingReturnReceipts || []).length));
  setText("stat-recurring-series", String((state.ledger.recurringBookingSeries || []).length));
  setText("stat-series-instances", String((state.ledger.recurringBookingInstances || []).length));
  setText("stat-series-exceptions", String((state.ledger.recurrenceConflictExceptions || []).length));
  setText("stat-revised-availability-exceptions", String((state.ledger.revisedAvailabilityExceptions || []).length));
  setText("stat-revised-availability-receipts", String((state.ledger.revisedAvailabilityExceptionReceipts || []).length));
  setText("stat-series-receipts", String((state.ledger.recurringSeriesReceipts || []).length));
  setText("stat-capacity-snapshots", String((state.ledger.availabilityCapacitySnapshots || []).length));
  setText("stat-waitlist", String((state.ledger.availabilityWaitlistEntries || []).filter((entry) => entry.status === "waitlisted").length));
  setText("stat-hold-releases", String((state.ledger.availabilityHoldReleases || []).length));
  setText("stat-promotions", String((state.ledger.availabilityPromotionCandidates || []).length));
  setText("stat-capacity-receipts", String((state.ledger.availabilityCapacityReceipts || []).length));
  setText("stat-optimization-runs", String((state.ledger.bookingOptimizationRuns || []).length));
  setText("stat-recommendations", String((state.ledger.bookingRecommendationCandidates || []).length));
  setText("stat-overload-warnings", String((state.ledger.bookingOverloadWarnings || []).length));
  setText("stat-recommendation-receipts", String((state.ledger.bookingRecommendationReceipts || []).length));
  setText("stat-reminder-executions", String((state.ledger.reminderExecutions || []).length));
  setText("stat-deadline-executions", String((state.ledger.deadlineExecutions || []).length));
  setText("stat-deadline-escalations", String((state.ledger.deadlineEscalations || []).length));
  setText("stat-reminder-deadline-receipts", String((state.ledger.reminderDeadlineReceipts || []).length));
  setText("stat-schedule-audits", String((state.ledger.scheduleAuditRecords || []).length));
  setText("stat-schedule-module-receipts", String((state.ledger.scheduleReceipts || []).length));
  setText("stat-scheduler-log", String((state.ledger.schedulerLogEntries || []).length));
  setText("stat-calendar-search", String((state.ledger.calendarSearchResults || []).length));
  setText("stat-schedule-templates", String((state.ledger.scheduleTemplates || []).length));
}

function renderScheduleQueue() {
  renderStack("schedule-queue", state.ledger.scheduleEntries, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <small>${escapeHtml(item.customerSafeStatus)}</small>
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.time)}</span>
      </div>
    </article>
  `);
}

function renderCalendarBoard() {
  const board = byId("calendar-board");
  if (!board) return;
  board.innerHTML = state.ledger.scheduleEntries.map((item, index) => `
    <article class="calendar-event event-${(index % 3) + 1}">
      <span>${escapeHtml(item.time)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.status)}</small>
    </article>
  `).join("");
}

function renderProductModules() {
  renderStack("calendar-display-mode-list", state.ledger.calendarDisplayModes || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("schedule-audit-list", state.ledger.scheduleAuditRecords || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.action)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.scheduleEntryId)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("schedule-receipts-list", state.ledger.scheduleReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.kind)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.linkedRecordId)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("scheduler-log-list", state.ledger.schedulerLogEntries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.eventKind)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.recordedAt)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("calendar-search-list", state.ledger.calendarSearchResults || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.displayLabel)}</strong>
      <span>${escapeHtml(item.recordKind)} - ${escapeHtml(item.recordId)}</span>
      <small>Customer-safe result: ${escapeHtml(item.customerVisible ? "yes" : "no")}</small>
    </article>
  `);

  renderStack("calendar-search-query-list", state.ledger.calendarSearchQueries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.query)}</strong>
      <span>${escapeHtml(item.role)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeOnly ? "customer-safe only" : "owner/admin search")}</small>
    </article>
  `);

  renderStack("schedule-template-list", state.ledger.scheduleTemplates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.templateKind)} - ${escapeHtml(item.defaultDurationLabel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-schedule-audit", (state.ledger.scheduleAuditRecords || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.action)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-schedule-receipts", (state.ledger.scheduleReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.kind)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-scheduler-log", (state.ledger.schedulerLogEntries || []).filter((item) => item.productLog && !item.monitorRunnerLog), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.eventKind)}</strong>
      <span>${escapeHtml(item.recordedAt)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-calendar-search", (state.ledger.calendarSearchResults || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.displayLabel)}</strong>
      <span>${escapeHtml(item.recordKind)}</span>
      <small>Limited to customer-safe calendar results.</small>
    </article>
  `);

  renderStack("portal-schedule-template", (state.ledger.scheduleTemplates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.defaultDurationLabel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("avalonia-shell-readiness", state.ledger.avaloniaShellReadiness ? [state.ledger.avaloniaShellReadiness] : [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.host)} App Host</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.nativeCore)}</span>
      <small>${escapeHtml(item.nextAction)}</small>
    </article>
  `);
}

function renderAvailability() {
  const renderWindow = (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.time)}</span>
      <small>${escapeHtml(item.capacity - item.holds)} open of ${escapeHtml(item.capacity)} · ${escapeHtml(item.status)}</small>
    </article>
  `;
  renderStack("availability-list", state.ledger.availabilityWindows, renderWindow);
  renderStack("portal-availability", state.ledger.availabilityWindows, renderWindow);

  renderStack("capacity-snapshot-list", state.ledger.availabilityCapacitySnapshots || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.holds)} of ${escapeHtml(item.capacity)} held</span>
      <small>${escapeHtml(item.waitlistCount)} waitlisted / ${escapeHtml(item.promotionCandidateCount)} promotions - ${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("waitlist-list", state.ledger.availabilityWaitlistEntries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.scheduleRequestId)}</strong>
      <span>${escapeHtml(item.status)} - priority ${escapeHtml(item.priority)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("hold-release-list", state.ledger.availabilityHoldReleases || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityHoldId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("promotion-candidate-list", state.ledger.availabilityPromotionCandidates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.waitlistEntryId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("capacity-receipt-list", state.ledger.availabilityCapacityReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("booking-optimization-list", state.ledger.bookingOptimizationRuns || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.scheduleRequestId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.candidateCount)} candidates</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("booking-recommendation-list", state.ledger.bookingRecommendationCandidates || [], (item) => `
    <article class="mini-row">
      <strong>#${escapeHtml(item.rank)} ${escapeHtml(item.label || item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - score ${escapeHtml(item.score)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("booking-overload-warning-list", state.ledger.bookingOverloadWarnings || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.loadRatioPercent)}% held</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("booking-recommendation-receipt-list", state.ledger.bookingRecommendationReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-booking-recommendations", (state.ledger.bookingRecommendationCandidates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.recommendationType === "best-fit" ? "Recommended window" : "Alternate window")}</strong>
      <span>${escapeHtml(item.recommendedWindow || item.availabilityWindowId)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-booking-overload-warnings", (state.ledger.bookingOverloadWarnings || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Availability warning</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-booking-recommendation-receipts", (state.ledger.bookingRecommendationReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-waitlist-status", (state.ledger.availabilityWaitlistEntries || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Waitlist priority ${escapeHtml(item.priority)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-capacity-status", (state.ledger.availabilityCapacitySnapshots || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-promotion-status", (state.ledger.availabilityPromotionCandidates || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Waitlist promotion</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);
}

function renderBookingWorkflow() {
  renderStack("timing-handoff-list", state.ledger.timingHandoffs || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.sourceProduct)} timing handoff</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("conflict-decision-list", state.ledger.availabilityConflictDecisions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.conflictType)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId || "no window")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("acceptance-list", state.ledger.scheduleRequestAcceptances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("hold-list", state.ledger.availabilityHolds || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.availabilityWindowId || "operator-selected window")}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.timezone)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("booking-confirmation-list", state.ledger.bookingConfirmations || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.requester)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.scheduleEntryId || "local entry pending")}</small>
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.confirmedWindow)}</span>
      </div>
    </article>
  `);

  renderStack("schedule-status-event-list", state.ledger.scheduleStatusEvents || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("booking-receipt-list", state.ledger.bookingReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("timing-return-list", state.ledger.timingReturnPayloads || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.returnType)} - ${escapeHtml(item.requester || item.scheduleRequestId)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.timingHandoffId)}</small>
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.requestedWindow || item.bookingConfirmationId || "reschedule")}</span>
      </div>
    </article>
  `);

  renderStack("timing-return-receipt-list", state.ledger.timingReturnReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-timing-handoff-status", state.ledger.timingHandoffs || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.sourceProduct)} timing</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-availability-decision", state.ledger.availabilityConflictDecisions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status === "clear" ? "Availability clear" : "New window needed")}</strong>
      <span>${escapeHtml(item.conflictType)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-acceptance-status", state.ledger.scheduleRequestAcceptances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-hold-status", state.ledger.availabilityHolds || [], (item) => `
    <article class="mini-row">
      <strong>Availability hold</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-booking-status", state.ledger.bookingConfirmations || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.confirmedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-schedule-status-events", state.ledger.scheduleStatusEvents || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-booking-receipts", state.ledger.bookingReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-timing-return-status", state.ledger.timingReturnPayloads || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.returnType)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-timing-return-receipts", state.ledger.timingReturnReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.generatedAt || "")}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);
}

function renderDeadlinesAndReminders() {
  renderStack("deadline-list", state.ledger.deadlineItems, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.due)}</span>
      <small>${escapeHtml(item.health || "unscored")} - ${escapeHtml(item.customerSafeStatus || item.state)}</small>
    </article>
  `);

  renderStack("reminder-execution-list", state.ledger.reminderExecutions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.reminderRuleId)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.channel)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("deadline-execution-list", state.ledger.deadlineExecutions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.deadlineItemId)}</strong>
      <span>${escapeHtml(item.health)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("deadline-escalation-list", state.ledger.deadlineEscalations || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.owner)}</strong>
      <span>Level ${escapeHtml(item.escalationLevel)} - ${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("reminder-deadline-receipt-list", state.ledger.reminderDeadlineReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("recurrence-candidate-list", state.ledger.recurrenceCandidates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)} - ${escapeHtml(item.calendarSystem)}</span>
      <small>${item.createsFutureEntries ? "future creation enabled" : "preview only"} - ${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("recurring-series-list", state.ledger.recurringBookingSeries || [], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.customerSafeStatus)}</p>
        <small>${escapeHtml(item.rrule)} - ${escapeHtml(item.calendarSystem)} - ${escapeHtml(item.timezone)}</small>
      </div>
      <div class="item-meta">
        ${chip(item.status)}
        <span>${escapeHtml(item.confirmedCount ?? 0)} confirmed / ${escapeHtml(item.exceptionCount ?? 0)} exceptions</span>
      </div>
    </article>
  `);

  renderStack("recurring-instance-list", state.ledger.recurringBookingInstances || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.seriesId)} #${escapeHtml(item.occurrenceIndex)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.startIso || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("recurrence-exception-list", state.ledger.recurrenceConflictExceptions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.conflictType)}</strong>
      <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestedWindow)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("revised-availability-exception-list", state.ledger.revisedAvailabilityExceptions || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.recurringSeriesId)} / ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("revised-availability-exception-receipt-list", state.ledger.revisedAvailabilityExceptionReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.kind)}</span>
      <small>${escapeHtml(item.customerSafeMessage || item.summary)}</small>
    </article>
  `);

  renderStack("recurring-series-receipt-list", state.ledger.recurringSeriesReceipts || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);

  renderStack("portal-recurring-series-status", state.ledger.recurringBookingSeries || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-recurring-instance-status", state.ledger.recurringBookingInstances || [], (item) => `
    <article class="mini-row">
      <strong>Occurrence ${escapeHtml(item.occurrenceIndex)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-recurring-exceptions", state.ledger.recurrenceConflictExceptions || [], (item) => `
    <article class="mini-row">
      <strong>New window needed</strong>
      <span>${escapeHtml(item.conflictType)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-revised-availability-exceptions", (state.ledger.revisedAvailabilityExceptions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Revised availability review</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-revised-availability-exception-receipts", (state.ledger.revisedAvailabilityExceptionReceipts || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.status)}</strong>
      <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.availabilityWindowId || "window pending")}</span>
      <small>${escapeHtml(item.customerSafeMessage || item.summary)}</small>
    </article>
  `);

  renderStack("reminder-rule-list", state.ledger.reminderRules, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)}</span>
      <small>${escapeHtml(item.customerSafeLabel)} · ${item.sandboxOnly ? "sandbox-only" : "review required"}</small>
    </article>
  `);
  renderStack("portal-reminder-execution-status", (state.ledger.reminderExecutions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Reminder status</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-deadline-execution-status", (state.ledger.deadlineExecutions || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.deadlineItemId)}</strong>
      <span>${escapeHtml(item.health)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("portal-deadline-escalation-status", (state.ledger.deadlineEscalations || []).filter((item) => item.customerVisible), (item) => `
    <article class="mini-row">
      <strong>Deadline follow-up</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);
}

function renderRevisedCalendar() {
  const monthGrid = byId("revised-calendar");
  if (monthGrid) {
    monthGrid.innerHTML = revisedMonths.map((month, index) => `
      <span>
        <strong>${String(index + 1).padStart(2, "0")}</strong>
        ${escapeHtml(month)}
      </span>
    `).join("");
  }

  const rulepack = state.ledger.revisedCalendarRulepack || {};
  const projection = projectRevisedRulepackConstraints(rulepack);
  const blocked = revisedRulepackBlocksConversion(rulepack);
  const missing = Array.isArray(rulepack.missingApprovals) ? rulepack.missingApprovals : [];
  renderStack("revised-rulepack-status", [rulepack], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.id || "rulepack")}</strong>
        <p>${escapeHtml(item.customerSafeStatus || "Rulepack status unavailable.")}</p>
        <small>${missing.slice(0, 5).map(escapeHtml).join(", ")}${missing.length > 5 ? "..." : ""}</small>
      </div>
      <div class="item-meta">
        ${chip(blocked ? "conversion held" : "conversion ready")}
        <span>${escapeHtml(item.versionId || "no version")}</span>
      </div>
    </article>
  `);

  renderStack("revised-constraint-projection", [projection], (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.calendarSystem)}</strong>
        <p>${escapeHtml(item.yearOpeningDayPolicy)} ${escapeHtml(item.leapDayPolicy)}</p>
        <small>${escapeHtml(item.anchorMethod)}; source: ${escapeHtml(item.anchorSource)}</small>
        <small>${escapeHtml(item.intercalaryPolicy)}</small>
      </div>
      <div class="item-meta">
        ${chip(item.customerSafe ? "customer-safe constraints" : "constraints blocked")}
        <span>${escapeHtml(item.conversionGateReason)}</span>
      </div>
    </article>
  `);

  renderStack("portal-revised-status", [rulepack], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.calendarSystem || "revised calendar")}</strong>
      <span>${blocked ? "conversion inactive" : "conversion ready"}</span>
      <small>${escapeHtml(item.customerSafeStatus || "")}</small>
    </article>
  `);

  renderStack("portal-revised-constraints", [projection], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.monthCount)} x ${escapeHtml(item.daysPerMonth)}</strong>
      <span>${escapeHtml(item.commonIntercalaryDayCount)} common / ${escapeHtml(item.leapIntercalaryDayCount)} leap day(s) outside months</span>
      <small>${escapeHtml(item.conversionGateReason)}</small>
    </article>
  `);
}

function renderCoreReadiness() {
  const core = state.ledger.schedulingCoreReadiness || {};
  const checks = [
    ["Schedule Entry", core.scheduleEntryValidation],
    ["Schedule Request", core.scheduleRequestValidation],
    ["Availability", core.availabilityValidation],
    ["Capacity", core.capacityValidation],
    ["Waitlist", core.waitlistValidation],
    ["Hold Release", core.holdReleaseValidation],
    ["Promotion", core.waitlistPromotionValidation],
    ["Optimization", core.availabilityOptimizationValidation],
    ["Recommendation", core.bookingRecommendationValidation],
    ["Overload Warning", core.overloadWarningValidation],
    ["Recommendation Proof", core.recommendationReceiptValidation],
    ["Deadline Health", core.deadlineHealthValidation],
    ["Reminder Execution", core.reminderExecutionValidation],
    ["Deadline Execution", core.deadlineExecutionValidation],
    ["Escalation", core.escalationValidation],
    ["Recurrence", core.recurrenceSandboxValidation],
    ["Revised Availability Exception", core.revisedAvailabilityExceptionValidation],
    ["Revised Availability Receipt", core.revisedAvailabilityExceptionReceiptValidation],
    ["Customer Status", core.customerSafeStatusValidation],
    ["Rulepack Gate", core.revisedRulepackGate],
    ["Live Provider", core.liveProviderPosture]
  ];
  renderStack("native-core-readiness", checks, ([label, value]) => `
    <article class="mini-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "pending")}</span>
      <small>${escapeHtml(core.nativeContract || "epoch_core")}</small>
    </article>
  `);
}

function renderProviderReadiness() {
  const renderGate = (gate) => {
    const ready = providerGateReadyForToggle(gate);
    const blocked = providerGateBlocksLiveCalls(gate);
    return `
      <article class="item-card">
        <div>
          <strong>${escapeHtml(gate.targetProvider)}</strong>
          <p>${escapeHtml(gate.customerSafeStatus)}</p>
          <small>${escapeHtml(gate.blocker || "No blocker recorded.")}</small>
        </div>
        <div class="item-meta">
          ${chip(ready ? "ready for approval" : gate.status)}
          <span>${blocked ? "live calls blocked" : "live calls allowed"}</span>
        </div>
      </article>
    `;
  };

  renderStack("provider-readiness-list", state.ledger.providerReadinessGates, renderGate);
  renderStack("portal-provider-status", state.ledger.providerReadinessGates, (gate) => `
    <article class="mini-row">
      <strong>${escapeHtml(gate.targetProvider)}</strong>
      <span>${providerGateBlocksLiveCalls(gate) ? "inactive" : "active"}</span>
      <small>${escapeHtml(gate.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("provider-check-list", state.ledger.providerStatusEvents, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.state)}</span>
      <small>${escapeHtml(item.detail)}</small>
    </article>
  `);
}

function renderPortalTimeline() {
  renderStack("portal-timeline", state.ledger.portalTimeline, (item) => `
    <article class="item-card">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      ${chip(item.state)}
    </article>
  `);

  renderStack("customer-status-list", state.ledger.scheduleRequests.slice(0, 5), (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.requester)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);
}

function renderCustomerScheduleStatusExports() {
  setText(
    "customer-schedule-status-export-summary",
    customerScheduleStatusExportState.records.length
      ? `${customerScheduleStatusExportState.records.length} App-exported schedule status record(s) loaded.`
      : "No App-exported schedule status records loaded."
  );

  renderStack(
    "portal-customer-schedule-status-export",
    customerScheduleStatusExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe App status exports loaded."
  );
}

function renderScheduleLifecycleActions() {
  renderStack(
    "portal-schedule-lifecycle-actions",
    (state.ledger.scheduleLifecycleActions || []).filter((item) => item.customerVisible),
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.actionKind)}</strong>
        <span>${escapeHtml(item.status)} - ${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeStatus)}</small>
        <small>${escapeHtml(item.requestedWindow)}</small>
      </article>
    `,
    "No customer-safe schedule lifecycle actions yet."
  );
}

function renderScheduleLifecycleStatusExports() {
  setText(
    "schedule-lifecycle-status-export-summary",
    scheduleLifecycleStatusExportState.records.length
      ? `${scheduleLifecycleStatusExportState.records.length} App-exported lifecycle status record(s) loaded.`
      : "No App-exported schedule lifecycle status records loaded."
  );

  renderStack(
    "portal-schedule-lifecycle-status-export",
    scheduleLifecycleStatusExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.actionKind)} / ${escapeHtml(item.requestId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe App lifecycle status exports loaded."
  );
}

function renderRevisedReminderDeadlineReceiptExports() {
  setText(
    "revised-reminder-deadline-receipt-summary",
    revisedReminderDeadlineReceiptExportState.records.length
      ? `${revisedReminderDeadlineReceiptExportState.records.length} App-exported revised reminder/deadline receipt(s) loaded.`
      : "No App-exported revised reminder/deadline receipts loaded."
  );

  renderStack(
    "portal-revised-reminder-deadline-receipts",
    revisedReminderDeadlineReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.kind)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe revised reminder/deadline receipt exports loaded."
  );
  renderStack(
    "app-revised-reminder-deadline-receipts",
    revisedReminderDeadlineReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.revisedTimingPayloadId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
      </article>
    `,
    "No App-exported revised reminder/deadline receipt records loaded."
  );
}

function renderRevisedAvailabilityExceptionReceiptExports() {
  setText(
    "revised-availability-exception-receipt-summary",
    revisedAvailabilityExceptionReceiptExportState.records.length
      ? `${revisedAvailabilityExceptionReceiptExportState.records.length} App-exported revised availability exception receipt(s) loaded.`
      : "No App-exported revised availability exception receipts loaded."
  );

  renderStack(
    "portal-revised-availability-exception-receipt-export",
    revisedAvailabilityExceptionReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.recurringSeriesId)} / ${escapeHtml(item.availabilityWindowId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
        <small>${escapeHtml(item.nextAction)}</small>
      </article>
    `,
    "No customer-safe revised availability exception receipt exports loaded."
  );
  renderStack(
    "app-revised-availability-exception-receipt-export",
    revisedAvailabilityExceptionReceiptExportState.records,
    (item) => `
      <article class="mini-row">
        <strong>${escapeHtml(item.status)}</strong>
        <span>${escapeHtml(item.requestId)} / ${escapeHtml(item.revisedTimingPayloadId)}</span>
        <small>${escapeHtml(item.customerSafeMessage)}</small>
      </article>
    `,
    "No App-exported revised availability exception receipt records loaded."
  );
}

function renderReceipts() {
  renderStack("receipt-list", state.ledger.receipts, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.status)}</span>
      <small>${escapeHtml(item.summary)}</small>
    </article>
  `);
}

function appendReceipt(summary, status = "ready") {
  state.ledger.receipts.unshift({
    id: `EPOCH-RECEIPT-${Date.now().toString(36)}`,
    status,
    summary
  });
}

function addTimeline(label, detail, timelineState = "queued") {
  state.ledger.portalTimeline.unshift({ label, detail, state: timelineState });
}

function handleGenerateRecurringSeries() {
  const existingActiveSeries = (state.ledger.recurringBookingSeries || []).find((series) => series.status !== "canceled");
  if (existingActiveSeries) {
    const confirmation = byId("series-confirmation");
    if (confirmation) confirmation.textContent = "A local recurring booking series is already generated.";
    return;
  }

  const candidate = (state.ledger.recurrenceCandidates || []).find((item) => item.createsFutureEntries && item.calendarSystem === "gregorian");
  const entry = (state.ledger.scheduleEntries || []).find((item) => item.id === candidate?.scheduleEntryId);
  if (!candidate || !entry) {
    const confirmation = byId("series-confirmation");
    if (confirmation) confirmation.textContent = "No approved Gregorian recurrence candidate is ready for local series generation.";
    return;
  }

  const series = createRecurringBookingSeriesForRule(candidate, entry);
  const openWindows = (state.ledger.availabilityWindows || []).filter((window) => Number(window.holds || 0) < Number(window.capacity || 0));
  const instances = Array.from({ length: series.instanceCount }, (_, index) => {
    const window = index === 2 ? null : openWindows[index % Math.max(openWindows.length, 1)] || null;
    return createRecurringBookingInstanceForSeries(series, index + 1, window, entry);
  });
  const exceptions = instances
    .filter((instance) => instance.status === "needs-reschedule")
    .map((instance) => {
      const exception = createRecurrenceConflictExceptionForInstance(instance, series);
      instance.conflictExceptionId = exception.id;
      return exception;
    });
  series.confirmedCount = instances.filter((instance) => instance.status === "confirmed").length;
  series.exceptionCount = exceptions.length;
  series.customerSafeStatus = exceptions.length
    ? "Recurring booking series is generated locally; one instance needs a new window."
    : "Recurring booking series is generated locally with all instances confirmed.";
  const receipt = createRecurringSeriesReceiptForSeries(series, instances, exceptions);
  const revisedAvailabilityExceptions = exceptions.map((exception) => {
    const instance = instances.find((item) => item.id === exception.instanceId) || null;
    const fallbackWindow = openWindows[0] || null;
    return createRevisedAvailabilityExceptionForTiming(
      state.ledger.revisedCalendarRulepack,
      series,
      instance,
      exception,
      fallbackWindow
    );
  });
  const revisedAvailabilityReceipts = revisedAvailabilityExceptions.map(createRevisedAvailabilityExceptionReceiptForException);

  state.ledger.recurringBookingSeries.unshift(series);
  state.ledger.recurringBookingInstances.unshift(...instances);
  state.ledger.recurrenceConflictExceptions.unshift(...exceptions);
  state.ledger.recurringSeriesReceipts.unshift(receipt);
  state.ledger.revisedAvailabilityExceptions ||= [];
  state.ledger.revisedAvailabilityExceptionReceipts ||= [];
  state.ledger.revisedAvailabilityExceptions.unshift(...revisedAvailabilityExceptions);
  state.ledger.revisedAvailabilityExceptionReceipts.unshift(...revisedAvailabilityReceipts);
  addTimeline("Recurring series generated", series.customerSafeStatus, series.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  const confirmation = byId("series-confirmation");
  if (confirmation) confirmation.textContent = series.customerSafeStatus;
  renderAll();
}

function handleGenerateBookingRecommendations() {
  const confirmation = byId("booking-recommendation-confirmation");
  const request = (state.ledger.scheduleRequests || []).find((item) =>
    ["queued", "waitlisted", "needs-reschedule"].includes(item.status)
  ) || (state.ledger.scheduleRequests || [])[0];
  const windows = state.ledger.availabilityWindows || [];

  if (!request || !windows.length) {
    if (confirmation) confirmation.textContent = "No local schedule request and availability windows are ready for recommendation.";
    return;
  }

  const run = createBookingOptimizationRunForRequest(request, windows);
  const rankedWindows = rankAvailabilityWindowsForRequest(windows);
  const candidates = rankedWindows
    .slice(0, 3)
    .map((window, index) => createBookingRecommendationCandidateForWindow(run, request, window, index + 1));
  const warningWindows = rankedWindows.filter((window) =>
    Number(window.capacity || 0) > 0 && Number(window.holds || 0) >= Number(window.capacity || 0)
  );
  const warnings = warningWindows.map((window) => createBookingOverloadWarningForWindow(run, window));
  const receipt = createBookingRecommendationReceiptForRun(run, candidates, warnings);

  state.ledger.bookingOptimizationRuns ||= [];
  state.ledger.bookingRecommendationCandidates ||= [];
  state.ledger.bookingOverloadWarnings ||= [];
  state.ledger.bookingRecommendationReceipts ||= [];

  run.candidateCount = candidates.length;
  run.overloadWarningCount = warnings.length;
  state.ledger.bookingOptimizationRuns.unshift(run);
  state.ledger.bookingRecommendationCandidates.unshift(...candidates);
  state.ledger.bookingOverloadWarnings.unshift(...warnings);
  state.ledger.bookingRecommendationReceipts.unshift(receipt);
  addTimeline("Booking recommendations generated", receipt.summary, receipt.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = receipt.summary;
  renderAll();
}

function handlePromoteWaitlist() {
  const waitlistEntry = (state.ledger.availabilityWaitlistEntries || []).find((entry) => entry.status === "waitlisted");
  const fullWindow = selectFullAvailabilityWindow(state.ledger.availabilityWindows || []);
  const releaseHold = (state.ledger.availabilityHolds || []).find((hold) => hold.status === "released" && (!fullWindow || hold.availabilityWindowId === fullWindow.id))
    || (state.ledger.availabilityHolds || []).find((hold) => hold.status === "held" && (!fullWindow || hold.availabilityWindowId === fullWindow.id));
  const confirmation = byId("waitlist-promotion-confirmation");

  if (!waitlistEntry || !fullWindow || !releaseHold) {
    if (confirmation) confirmation.textContent = "No local waitlist entry, full window, and releasable hold are ready for promotion.";
    return;
  }

  const release = createAvailabilityHoldReleaseForHold(releaseHold, fullWindow);
  const promotion = createAvailabilityPromotionCandidateForWaitlist(waitlistEntry, fullWindow, release);
  const receipt = createAvailabilityCapacityReceiptForPromotion(promotion, release, waitlistEntry);
  const snapshot = createAvailabilityCapacitySnapshotForWindow(
    fullWindow,
    state.ledger.availabilityWaitlistEntries,
    [release, ...(state.ledger.availabilityHoldReleases || [])],
    [promotion, ...(state.ledger.availabilityPromotionCandidates || [])]
  );

  releaseHold.status = "released";
  releaseHold.customerSafeStatus = release.customerSafeStatus;
  waitlistEntry.status = "promoted";
  waitlistEntry.customerSafeStatus = "Waitlist request was promoted into a local availability hold.";
  state.ledger.availabilityHoldReleases.unshift(release);
  state.ledger.availabilityPromotionCandidates.unshift(promotion);
  state.ledger.availabilityCapacitySnapshots.unshift(snapshot);
  state.ledger.availabilityCapacityReceipts.unshift(receipt);
  addTimeline("Waitlist promoted", promotion.customerSafeStatus, promotion.status);
  appendReceipt(receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = promotion.customerSafeStatus;
  renderAll();
}

function handleRunReminderDeadlinePass() {
  const reminderRule = (state.ledger.reminderRules || []).find((rule) => rule.sandboxOnly && rule.status !== "failed");
  const scheduleEntry = (state.ledger.scheduleEntries || []).find((entry) => entry.id === reminderRule?.scheduleEntryId);
  const deadlineItem = (state.ledger.deadlineItems || []).find((item) => item.health && item.health !== "on-track")
    || (state.ledger.deadlineItems || [])[0];
  const confirmation = byId("reminder-deadline-confirmation");

  if (!reminderRule || !deadlineItem) {
    if (confirmation) confirmation.textContent = "No local reminder rule and deadline item are ready for execution.";
    return;
  }

  const reminderExecution = createReminderExecutionForRule(reminderRule, scheduleEntry);
  const deadlineExecution = createDeadlineExecutionForItem(deadlineItem);
  const escalation = createDeadlineEscalationForExecution(deadlineExecution, reminderExecution);
  const receipt = createReminderDeadlineReceiptForEscalation(escalation, deadlineExecution, reminderExecution);

  state.ledger.reminderExecutions.unshift(reminderExecution);
  state.ledger.deadlineExecutions.unshift(deadlineExecution);
  state.ledger.deadlineEscalations.unshift(escalation);
  state.ledger.reminderDeadlineReceipts.unshift(receipt);
  state.ledger.receipts.unshift({
    id: receipt.id,
    status: receipt.status,
    summary: receipt.summary
  });
  addTimeline("Reminder deadline pass", receipt.summary, receipt.status);
  saveLedger(state.ledger);

  if (confirmation) confirmation.textContent = receipt.summary;
  renderAll();
}

function renderAll() {
  renderNeedOptions();
  renderLifecycleActionOptions();
  renderStats();
  renderScheduleQueue();
  renderCalendarBoard();
  renderProductModules();
  renderAvailability();
  renderBookingWorkflow();
  renderDeadlinesAndReminders();
  renderCoreReadiness();
  renderRevisedCalendar();
  renderProviderReadiness();
  renderPortalTimeline();
  renderCustomerScheduleStatusExports();
  renderScheduleLifecycleActions();
  renderScheduleLifecycleStatusExports();
  renderRevisedReminderDeadlineReceiptExports();
  renderRevisedAvailabilityExceptionReceiptExports();
  renderReceipts();
}

async function handleCustomerScheduleStatusImport(event) {
  event.preventDefault();
  const fileInput = byId("customer-schedule-status-file");
  const confirmation = byId("customer-schedule-status-export-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose customer-schedule-status.json first.";
    return;
  }

  try {
    const imported = normalizeCustomerScheduleStatusPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe Webportal-ready schedule status records found.";
      return;
    }

    const byStatusId = new Map(customerScheduleStatusExportState.records.map((item) => [item.statusId, item]));
    for (const item of imported) byStatusId.set(item.statusId, item);
    customerScheduleStatusExportState.records = Array.from(byStatusId.values());
    saveCustomerScheduleStatusExports(customerScheduleStatusExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Status export could not be read.";
  }
}

function handleClearCustomerScheduleStatusExports() {
  customerScheduleStatusExportState.records = [];
  saveCustomerScheduleStatusExports(customerScheduleStatusExportState.records);
  const fileInput = byId("customer-schedule-status-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleScheduleLifecycleStatusImport(event) {
  event.preventDefault();
  const fileInput = byId("schedule-lifecycle-status-file");
  const confirmation = byId("schedule-lifecycle-status-export-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose schedule-lifecycle-status.json first.";
    return;
  }

  try {
    const imported = normalizeScheduleLifecycleStatusPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe Webportal-ready schedule lifecycle status records found.";
      return;
    }

    const byStatusId = new Map(scheduleLifecycleStatusExportState.records.map((item) => [item.statusId, item]));
    for (const item of imported) byStatusId.set(item.statusId, item);
    scheduleLifecycleStatusExportState.records = Array.from(byStatusId.values());
    saveScheduleLifecycleStatusExports(scheduleLifecycleStatusExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Lifecycle status export could not be read.";
  }
}

function handleClearScheduleLifecycleStatusExports() {
  scheduleLifecycleStatusExportState.records = [];
  saveScheduleLifecycleStatusExports(scheduleLifecycleStatusExportState.records);
  const fileInput = byId("schedule-lifecycle-status-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleRevisedReminderDeadlineReceiptImport(event) {
  event.preventDefault();
  const fileInput = byId("revised-reminder-deadline-receipt-file");
  const confirmation = byId("revised-reminder-deadline-receipt-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose revised-reminder-deadline-receipts.json first.";
    return;
  }

  try {
    const imported = normalizeRevisedReminderDeadlineReceiptPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe revised reminder/deadline receipt records found.";
      return;
    }

    const byReceiptId = new Map(revisedReminderDeadlineReceiptExportState.records.map((item) => [item.receiptId, item]));
    for (const item of imported) byReceiptId.set(item.receiptId, item);
    revisedReminderDeadlineReceiptExportState.records = Array.from(byReceiptId.values());
    saveRevisedReminderDeadlineReceiptExports(revisedReminderDeadlineReceiptExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Revised reminder/deadline receipt export could not be read.";
  }
}

function handleClearRevisedReminderDeadlineReceiptExports() {
  revisedReminderDeadlineReceiptExportState.records = [];
  saveRevisedReminderDeadlineReceiptExports(revisedReminderDeadlineReceiptExportState.records);
  const fileInput = byId("revised-reminder-deadline-receipt-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

async function handleRevisedAvailabilityExceptionReceiptImport(event) {
  event.preventDefault();
  const fileInput = byId("revised-availability-exception-receipt-file");
  const confirmation = byId("revised-availability-exception-receipt-summary");
  const file = fileInput?.files?.[0];
  if (!file) {
    if (confirmation) confirmation.textContent = "Choose revised-availability-exception-receipts.json first.";
    return;
  }

  try {
    const imported = normalizeRevisedAvailabilityExceptionReceiptPayload(JSON.parse(await file.text()));
    if (!imported.length) {
      if (confirmation) confirmation.textContent = "No customer-safe revised availability exception receipt records found.";
      return;
    }

    const byReceiptId = new Map(revisedAvailabilityExceptionReceiptExportState.records.map((item) => [item.receiptId, item]));
    for (const item of imported) byReceiptId.set(item.receiptId, item);
    revisedAvailabilityExceptionReceiptExportState.records = Array.from(byReceiptId.values());
    saveRevisedAvailabilityExceptionReceiptExports(revisedAvailabilityExceptionReceiptExportState.records);
    renderAll();
  } catch {
    if (confirmation) confirmation.textContent = "Revised availability exception receipt export could not be read.";
  }
}

function handleClearRevisedAvailabilityExceptionReceiptExports() {
  revisedAvailabilityExceptionReceiptExportState.records = [];
  saveRevisedAvailabilityExceptionReceiptExports(revisedAvailabilityExceptionReceiptExportState.records);
  const fileInput = byId("revised-availability-exception-receipt-file");
  if (fileInput) fileInput.value = "";
  renderAll();
}

function handleScheduleLifecycleAction(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const action = createScheduleLifecycleActionRecord(data);

  state.ledger.scheduleLifecycleActions ||= [];
  state.ledger.scheduleLifecycleActions.unshift(action);
  addTimeline("Schedule lifecycle action requested", action.customerSafeStatus, action.status);
  appendReceipt(`${action.actionKind} action queued locally for ${action.requestId}; provider calls remain disabled.`, action.status);
  saveLedger(state.ledger);

  const confirmation = byId("schedule-lifecycle-confirmation");
  if (confirmation) confirmation.textContent = action.customerSafeStatus;
  form.reset();
  renderAll();
}

function handleScheduleRequest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const request = createScheduleRequestRecord(data);
  const handoff = createTimingHandoffForRequest(request, "EPOCH");
  const availabilityWindow = selectOpenAvailabilityWindow(state.ledger.availabilityWindows);
  const conflictDecision = createAvailabilityConflictDecisionForHandoff(handoff, availabilityWindow);

  state.ledger.scheduleRequests.unshift(request);
  state.ledger.timingHandoffs.unshift(handoff);
  state.ledger.availabilityConflictDecisions.unshift(conflictDecision);

  let confirmationText = conflictDecision.customerSafeStatus;
  if (conflictDecision.status === "clear") {
    const entry = createScheduleEntryForRequest(request);
    const acceptance = createScheduleRequestAcceptanceForRequest(request, availabilityWindow);
    const hold = createAvailabilityHoldForAcceptance(acceptance, availabilityWindow);
    const bookingConfirmation = createBookingConfirmationForHold(hold, request, entry);
    const scheduleStatusEvent = createScheduleStatusEventForBooking(bookingConfirmation, request);
    const bookingReceipt = createBookingReceiptForConfirmation(bookingConfirmation, scheduleStatusEvent);
    const timingReturnPayload = createTimingReturnPayloadForDecision(conflictDecision, request, bookingConfirmation);
    const timingReturnReceipt = createTimingReturnReceiptForPayload(timingReturnPayload, conflictDecision);

    request.status = "accepted";
    request.customerSafeStatus = acceptance.customerSafeStatus;
    handoff.status = "returned";
    handoff.customerSafeStatus = timingReturnPayload.customerSafeStatus;
    entry.status = "confirmed";
    entry.customerSafeStatus = bookingConfirmation.customerSafeStatus;

    state.ledger.scheduleEntries.unshift(entry);
    state.ledger.scheduleRequestAcceptances.unshift(acceptance);
    state.ledger.availabilityHolds.unshift(hold);
    state.ledger.bookingConfirmations.unshift(bookingConfirmation);
    state.ledger.scheduleStatusEvents.unshift(scheduleStatusEvent);
    state.ledger.bookingReceipts.unshift(bookingReceipt);
    state.ledger.timingReturnPayloads.unshift(timingReturnPayload);
    state.ledger.timingReturnReceipts.unshift(timingReturnReceipt);
    if (availabilityWindow) availabilityWindow.holds = Number(availabilityWindow.holds || 0) + 1;
    addTimeline("Request accepted", `${request.requester} requested ${scheduleNeedLabel(request.need)}.`, acceptance.status);
    addTimeline("Booking confirmed", bookingConfirmation.customerSafeStatus, bookingConfirmation.status);
    addTimeline("Timing returned", timingReturnPayload.customerSafeStatus, timingReturnPayload.status);
    appendReceipt(`${request.requester} received a local-only schedule booking confirmation and timing return.`);
    confirmationText = bookingConfirmation.customerSafeStatus;
  } else {
    const scheduleStatusEvent = createScheduleStatusEventForConflict(conflictDecision, request);
    const timingReturnPayload = createTimingReturnPayloadForDecision(conflictDecision, request);
    const timingReturnReceipt = createTimingReturnReceiptForPayload(timingReturnPayload, conflictDecision);
    const waitlistEntry = createAvailabilityWaitlistEntryForRequest(
      request,
      conflictDecision,
      (state.ledger.availabilityWaitlistEntries || []).length + 1
    );
    const fullWindow = selectFullAvailabilityWindow(state.ledger.availabilityWindows || []);
    const snapshot = createAvailabilityCapacitySnapshotForWindow(
      fullWindow,
      [waitlistEntry, ...(state.ledger.availabilityWaitlistEntries || [])],
      state.ledger.availabilityHoldReleases || [],
      state.ledger.availabilityPromotionCandidates || []
    );
    const capacityReceipt = createAvailabilityCapacityReceiptForPromotion(null, null, waitlistEntry);

    request.status = "waitlisted";
    request.customerSafeStatus = waitlistEntry.customerSafeStatus;
    handoff.status = "needs-reschedule";
    handoff.customerSafeStatus = timingReturnPayload.customerSafeStatus;

    state.ledger.scheduleStatusEvents.unshift(scheduleStatusEvent);
    state.ledger.timingReturnPayloads.unshift(timingReturnPayload);
    state.ledger.timingReturnReceipts.unshift(timingReturnReceipt);
    state.ledger.availabilityWaitlistEntries.unshift(waitlistEntry);
    if (snapshot.availabilityWindowId) state.ledger.availabilityCapacitySnapshots.unshift(snapshot);
    state.ledger.availabilityCapacityReceipts.unshift(capacityReceipt);
    addTimeline("Timing conflict", timingReturnPayload.customerSafeStatus, timingReturnPayload.status);
    addTimeline("Waitlist opened", waitlistEntry.customerSafeStatus, waitlistEntry.status);
    appendReceipt(`${request.requester} received a local-only availability conflict return.`, "needs-reschedule");
    appendReceipt(capacityReceipt.summary, capacityReceipt.status);
    confirmationText = waitlistEntry.customerSafeStatus;
  }
  saveLedger(state.ledger);

  const confirmation = byId("request-confirmation");
  if (confirmation) confirmation.textContent = confirmationText;
  form.reset();
  renderAll();
}

function bindControls() {
  const requestForm = byId("schedule-request-form");
  if (requestForm) requestForm.addEventListener("submit", handleScheduleRequest);

  const lifecycleActionForm = byId("schedule-lifecycle-action-form");
  if (lifecycleActionForm) lifecycleActionForm.addEventListener("submit", handleScheduleLifecycleAction);

  const statusImportForm = byId("customer-schedule-status-import-form");
  if (statusImportForm) statusImportForm.addEventListener("submit", handleCustomerScheduleStatusImport);

  const clearStatusExportButton = byId("clear-customer-schedule-status-export");
  if (clearStatusExportButton) clearStatusExportButton.addEventListener("click", handleClearCustomerScheduleStatusExports);

  const lifecycleStatusImportForm = byId("schedule-lifecycle-status-import-form");
  if (lifecycleStatusImportForm) lifecycleStatusImportForm.addEventListener("submit", handleScheduleLifecycleStatusImport);

  const clearLifecycleStatusExportButton = byId("clear-schedule-lifecycle-status-export");
  if (clearLifecycleStatusExportButton) clearLifecycleStatusExportButton.addEventListener("click", handleClearScheduleLifecycleStatusExports);

  const revisedReminderDeadlineReceiptImportForm = byId("revised-reminder-deadline-receipt-import-form");
  if (revisedReminderDeadlineReceiptImportForm) revisedReminderDeadlineReceiptImportForm.addEventListener("submit", handleRevisedReminderDeadlineReceiptImport);

  const clearRevisedReminderDeadlineReceiptsButton = byId("clear-revised-reminder-deadline-receipts");
  if (clearRevisedReminderDeadlineReceiptsButton) clearRevisedReminderDeadlineReceiptsButton.addEventListener("click", handleClearRevisedReminderDeadlineReceiptExports);

  const revisedAvailabilityExceptionReceiptImportForm = byId("revised-availability-exception-receipt-import-form");
  if (revisedAvailabilityExceptionReceiptImportForm) revisedAvailabilityExceptionReceiptImportForm.addEventListener("submit", handleRevisedAvailabilityExceptionReceiptImport);

  const clearRevisedAvailabilityExceptionReceiptsButton = byId("clear-revised-availability-exception-receipts");
  if (clearRevisedAvailabilityExceptionReceiptsButton) clearRevisedAvailabilityExceptionReceiptsButton.addEventListener("click", handleClearRevisedAvailabilityExceptionReceiptExports);

  const resetButton = byId("reset-schedule-ledger");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      state.ledger = clone(initialEpochLedger);
      saveLedger(state.ledger);
      renderAll();
    });
  }

  const seriesButton = byId("generate-recurring-series");
  if (seriesButton) seriesButton.addEventListener("click", handleGenerateRecurringSeries);

  const recommendationButton = byId("generate-booking-recommendations");
  if (recommendationButton) recommendationButton.addEventListener("click", handleGenerateBookingRecommendations);

  const promoteButton = byId("promote-waitlist");
  if (promoteButton) promoteButton.addEventListener("click", handlePromoteWaitlist);

  const reminderDeadlineButton = byId("run-reminder-deadline-pass");
  if (reminderDeadlineButton) reminderDeadlineButton.addEventListener("click", handleRunReminderDeadlinePass);
}

renderAll();
bindControls();
