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
  createScheduleEntryForRequest,
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
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  revisedMonths,
  rankAvailabilityWindowsForRequest,
  scheduleNeedLabel,
  scheduleNeedOptions,
  selectFullAvailabilityWindow,
  selectOpenAvailabilityWindow
} from "./epoch-data.js?v=epoch-availability-optimization-recommendations";

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

const mergeLedger = (stored) => {
  const base = clone(initialEpochLedger);
  if (!stored || typeof stored !== "object") return base;
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
  return base;
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

const state = {
  ledger: loadLedger()
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

  renderStack("portal-revised-status", [rulepack], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.calendarSystem || "revised calendar")}</strong>
      <span>${blocked ? "conversion inactive" : "conversion ready"}</span>
      <small>${escapeHtml(item.customerSafeStatus || "")}</small>
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

  state.ledger.recurringBookingSeries.unshift(series);
  state.ledger.recurringBookingInstances.unshift(...instances);
  state.ledger.recurrenceConflictExceptions.unshift(...exceptions);
  state.ledger.recurringSeriesReceipts.unshift(receipt);
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
  renderReceipts();
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
