import {
  EPOCH_LEDGER_KEY,
  createAvailabilityHoldForAcceptance,
  createBookingConfirmationForHold,
  createBookingReceiptForConfirmation,
  createScheduleEntryForRequest,
  createScheduleRequestRecord,
  createScheduleRequestAcceptanceForRequest,
  createScheduleStatusEventForBooking,
  initialEpochLedger,
  providerGateBlocksLiveCalls,
  providerGateReadyForToggle,
  revisedRulepackBlocksConversion,
  revisedRulepackReady,
  revisedMonths,
  scheduleNeedLabel,
  scheduleNeedOptions,
  selectOpenAvailabilityWindow
} from "./epoch-data.js?v=epoch-booking-confirmation";

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
    "scheduleRequestAcceptances",
    "availabilityHolds",
    "bookingConfirmations",
    "scheduleStatusEvents",
    "bookingReceipts",
    "availabilityWindows",
    "deadlineItems",
    "recurrenceCandidates",
    "reminderRules",
    "providerReadinessGates",
    "providerStatusEvents",
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
}

function renderBookingWorkflow() {
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
}

function renderDeadlinesAndReminders() {
  renderStack("deadline-list", state.ledger.deadlineItems, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.due)}</span>
      <small>${escapeHtml(item.health || "unscored")} - ${escapeHtml(item.customerSafeStatus || item.state)}</small>
    </article>
  `);

  renderStack("recurrence-candidate-list", state.ledger.recurrenceCandidates || [], (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)} - ${escapeHtml(item.calendarSystem)}</span>
      <small>${item.createsFutureEntries ? "future creation enabled" : "preview only"} - ${escapeHtml(item.customerSafeStatus)}</small>
    </article>
  `);

  renderStack("reminder-rule-list", state.ledger.reminderRules, (item) => `
    <article class="mini-row">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.rrule)}</span>
      <small>${escapeHtml(item.customerSafeLabel)} · ${item.sandboxOnly ? "sandbox-only" : "review required"}</small>
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
    ["Deadline Health", core.deadlineHealthValidation],
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

function renderAll() {
  renderNeedOptions();
  renderStats();
  renderScheduleQueue();
  renderCalendarBoard();
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
  const entry = createScheduleEntryForRequest(request);
  const availabilityWindow = selectOpenAvailabilityWindow(state.ledger.availabilityWindows);
  const acceptance = createScheduleRequestAcceptanceForRequest(request, availabilityWindow);
  const hold = createAvailabilityHoldForAcceptance(acceptance, availabilityWindow);
  const bookingConfirmation = createBookingConfirmationForHold(hold, request, entry);
  const scheduleStatusEvent = createScheduleStatusEventForBooking(bookingConfirmation, request);
  const bookingReceipt = createBookingReceiptForConfirmation(bookingConfirmation, scheduleStatusEvent);

  request.status = "accepted";
  request.customerSafeStatus = acceptance.customerSafeStatus;
  entry.status = "confirmed";
  entry.customerSafeStatus = bookingConfirmation.customerSafeStatus;

  state.ledger.scheduleRequests.unshift(request);
  state.ledger.scheduleEntries.unshift(entry);
  state.ledger.scheduleRequestAcceptances.unshift(acceptance);
  state.ledger.availabilityHolds.unshift(hold);
  state.ledger.bookingConfirmations.unshift(bookingConfirmation);
  state.ledger.scheduleStatusEvents.unshift(scheduleStatusEvent);
  state.ledger.bookingReceipts.unshift(bookingReceipt);
  if (availabilityWindow) availabilityWindow.holds = Number(availabilityWindow.holds || 0) + 1;
  addTimeline("Request accepted", `${request.requester} requested ${scheduleNeedLabel(request.need)}.`, acceptance.status);
  addTimeline("Booking confirmed", bookingConfirmation.customerSafeStatus, bookingConfirmation.status);
  appendReceipt(`${request.requester} received a local-only schedule booking confirmation.`);
  saveLedger(state.ledger);

  const confirmation = byId("request-confirmation");
  if (confirmation) confirmation.textContent = bookingConfirmation.customerSafeStatus;
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
}

renderAll();
bindControls();
