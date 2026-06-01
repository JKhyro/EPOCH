const seedData = window.EPOCH_SEED_DATA;
const recordTools = window.EPOCH_OPERATING_RECORDS;
const storageKey = "epoch-commercial-operating-data";
const attentionStatuses = new Set(["proposed", "draft", "presented", "unavailable", "queued", "approved", "dispatched", "acknowledged", "in-progress", "failed", "snoozed", "retry-ready", "payment-ready", "payment-blocked", "submitted", "reviewing", "overdue", "blocked"]);
const today = "2026-06-01";
const viewNames = new Set(["admin", "student", "monitor", "public"]);

let data = loadData();
let lastMonitorReport = null;

function byId(id) {
  return document.getElementById(id);
}

function viewFromRoute() {
  const candidate = window.location.hash.replace("#", "");
  return viewNames.has(candidate) ? candidate : "admin";
}

function routeForView(viewName) {
  return `#${viewName}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chip(label, className) {
  const safeClass = className ? ` ${String(className).replace(/[^a-z0-9_-]/gi, "")}` : "";
  return `<span class="chip${safeClass}">${escapeHtml(label)}</span>`;
}

function loadData() {
  const fallback = recordTools.cloneData(seedData);
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return fallback;
    return recordTools.importOperatingLedger(fallback, stored).data;
  } catch {
    return fallback;
  }
}

function persistData(options = {}) {
  try {
    const ledger = recordTools.createOperatingLedger(data, options);
    window.localStorage.setItem(storageKey, JSON.stringify(ledger));
    data = ledger.data;
  } catch {
    // Browser storage is optional in this static kickoff surface.
  }
}

function resetData() {
  data = recordTools.cloneData(seedData);
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Browser storage is optional in this static kickoff surface.
  }
}

function storageStatusText() {
  const persistence = recordTools.summarizePersistenceState(data);
  return `Ledger v${recordTools.ledgerVersion} | ${data.customers.length} customers | ${data.engagements.length} engagements | ${data.campaignRoutes.length} campaigns | ${(data.marketingConversionEvents || []).length} conversion KPIs | ${(data.providerAdapterCandidates || []).length} provider adapters | ${(data.calendarAdapterPrototypes || []).length} calendar prototypes | ${(data.librarySyncHandoffs || []).length} LIBRARY handoffs | ${(data.calendarProviderHandoffs || []).length} calendar handoffs | ${(data.notificationProviderHandoffs || []).length} notification provider handoffs | ${(data.paymentProviderHandoffs || []).length} payment provider handoffs | ${(data.authSessionRoleHandoffs || []).length} auth/session handoffs | ${data.notificationEvents.length} updates | ${data.receipts.length} receipts | r${persistence.revision} ${persistence.adapterState} | ${persistence.ledgerId}`;
}

function formatTime(value) {
  if (!value) return "No time set";
  return value.replace("T", " ").replace("+09:00", " JST");
}

function statusChip(status) {
  return chip(status, status);
}

function toneChip(label, tone) {
  const toneClass = tone || "neutral";
  return chip(label, toneClass);
}

function priorityTone(priority) {
  if (priority === "high") return "blocked";
  if (priority === "medium") return "overdue";
  return "complete";
}

function monitorReceiptTone(status) {
  if (status === "blocked") return "blocked";
  if (status === "attention") return "overdue";
  return "complete";
}

function record(title, body, chips) {
  return `
    <article class="record">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <div class="meta">${chips.join("")}</div>
    </article>
  `;
}

function trackName(trackId) {
  const track = data.tracks.find((item) => item.id === trackId);
  return track ? track.name : "track pending";
}

function packageName(packageId) {
  const offerPackage = data.offerPackages.find((item) => item.id === packageId);
  return offerPackage ? offerPackage.name : "package pending";
}

function frameworkName(frameworkId) {
  const framework = (data.curriculumFrameworks || []).find((item) => item.id === frameworkId);
  return framework ? framework.title : "framework pending";
}

function gameplanForPackage(packageId) {
  return (data.packageGameplans || []).find((item) => item.packageId === packageId);
}

function formatJpy(value) {
  return `JPY ${Number(value || 0).toLocaleString("en-US")}`;
}

function appendMonitorReceipt(action, detail, status = "complete", options = {}) {
  const result = recordTools.createMonitorActionRecords(data, {
    actionId: action.id,
    title: action.title,
    detail,
    status,
    target: action.target,
    effect: action.effect,
    priority: action.priority
  });
  data = result.data;
  if (options.persist !== false) {
    persistData({
      adapterState: "modified-local",
      recoveryNote: "Monitor operator action recorded locally; export a ledger snapshot before external handoff."
    });
  }
  return result.records;
}

function scrollToMonitorTarget(targetId) {
  const target = byId(targetId);
  if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
}

function allOperatingItems() {
  return [
    ...data.leads.map((item) => ({ ...item, kind: "lead", time: item.nextActionAt })),
    ...data.opportunities.map((item) => ({ ...item, title: packageName(item.packageId), kind: "opportunity", time: item.nextActionAt })),
    ...(data.engagements || []).map((item) => ({ ...item, title: packageName(item.packageId), kind: "engagement", time: item.onboardingDueAt || item.acceptedAt })),
    ...(data.packageGameplans || []).map((item) => ({ ...item, kind: "gameplan", time: item.nextMilestoneAt })),
    ...(data.campaignRoutes || []).map((item) => ({ ...item, kind: "campaign route", title: item.name || item.routeKey, status: item.status || item.readinessStatus, time: item.goLiveAt || item.startAt })),
    ...(data.marketingConversionEvents || []).map((item) => ({ ...item, kind: "marketing conversion", time: item.nextActionAt || item.occurredAt || item.updatedAt || item.createdAt })),
    ...(data.providerAdapterCandidates || []).map((item) => ({ ...item, kind: "provider adapter", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.calendarAdapterPrototypes || []).map((item) => ({ ...item, kind: "calendar adapter", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.workPlans || []).map((item) => ({ ...item, kind: "agent work plan", time: item.dueAt })),
    ...(data.agentHandoffs || []).map((item) => ({ ...item, kind: "agent handoff", time: item.nextActionAt })),
    ...(data.notificationEvents || []).map((item) => ({ ...item, kind: "update", time: item.deliverAfterAt || item.createdAt })),
    ...(data.notificationDeliveries || []).map((item) => ({ ...item, kind: "notification delivery", time: item.nextActionAt || item.createdAt })),
    ...(data.notificationProviderHandoffs || []).map((item) => ({ ...item, kind: "notification provider", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.paymentProviderHandoffs || []).map((item) => ({ ...item, kind: "payment provider", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.authSessionRoleHandoffs || []).map((item) => ({ ...item, kind: "auth/session role", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.quotes || []).map((item) => ({ ...item, kind: "quote", time: item.nextActionAt || item.validUntil || item.createdAt })),
    ...(data.reminderRules || []).map((item) => ({ ...item, kind: "reminder rule", time: item.nextActionAt || item.reminderAt })),
    ...(data.recurrenceCandidates || []).map((item) => ({ ...item, kind: "recurrence candidate", time: item.nextCandidateAt || item.createdAt })),
    ...(data.availabilityWindows || []).map((item) => ({ ...item, kind: "availability window", time: item.startAt || item.createdAt })),
    ...(data.accessGateways || []).map((item) => ({ ...item, kind: "access gateway", title: item.label, time: item.updatedAt || item.lastVerifiedAt || item.createdAt })),
    ...(data.librarySyncHandoffs || []).map((item) => ({ ...item, kind: "library sync", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...(data.calendarProviderHandoffs || []).map((item) => ({ ...item, kind: "calendar provider", time: item.nextActionAt || item.updatedAt || item.createdAt })),
    ...data.sessions.map((item) => ({ ...item, kind: "session", time: item.startAt })),
    ...data.assignments.map((item) => ({ ...item, kind: "request", time: item.dueAt })),
    ...data.submissions.map((item) => ({ ...item, kind: "submission", time: item.reviewDueAt })),
    ...data.reviews.map((item) => ({ ...item, kind: "review", time: item.returnedAt })),
    ...data.followups.map((item) => ({ ...item, kind: "follow-up", time: item.nextActionAt }))
  ];
}

function renderOfferOptions() {
  const select = byId("intake-package");
  select.innerHTML = data.offerPackages.map((offerPackage) => {
    return `<option value="${escapeHtml(offerPackage.id)}">${escapeHtml(`${offerPackage.name} - ${formatJpy(offerPackage.priceJpy)}`)}</option>`;
  }).join("");
}

function renderOfferCatalog() {
  byId("offer-catalog").innerHTML = data.offerPackages.map((offerPackage) => {
    const gameplan = gameplanForPackage(offerPackage.id);
    return record(
      offerPackage.name,
      `${offerPackage.audience} | ${offerPackage.deliveryModel} | ${offerPackage.marketRoute || "Japan-wide remote"}`,
      [
        chip(formatJpy(offerPackage.priceJpy)),
        chip(offerPackage.routing),
        chip(offerPackage.status),
        chip(offerPackage.laborModel || "tracked delivery"),
        chip(gameplan ? "gameplan-ready" : "gameplan-pending", gameplan ? "complete" : "waiting")
      ]
    );
  }).join("");
}

function renderCurriculumFrameworks() {
  byId("curriculum-frameworks").innerHTML = (data.curriculumFrameworks || []).map((framework) => {
    const levels = Array.isArray(framework.levels) ? framework.levels.join(", ") : "adaptive";
    const modules = Array.isArray(framework.modules) ? framework.modules.slice(0, 3).join(" | ") : "modules pending";
    return record(
      framework.title,
      `${framework.positioning} Modules: ${modules}`,
      [
        statusChip(framework.status),
        chip(`${levels}`),
        chip(framework.cadence || "cadence pending")
      ]
    );
  }).join("");
}

function renderAdminGameplans() {
  const gameplans = data.packageGameplans || [];
  byId("admin-gameplans").innerHTML = gameplans.map((gameplan) => {
    return record(
      gameplan.title,
      `${packageName(gameplan.packageId)} | ${frameworkName(gameplan.frameworkId)} | ${gameplan.internalReadiness}`,
      [
        statusChip(gameplan.status),
        chip(gameplan.laborModel || "delivery model pending"),
        chip(formatTime(gameplan.nextMilestoneAt))
      ]
    );
  }).join("");
}

function renderStudentGameplans() {
  const customers = data.customers || [];
  byId("student-gameplans").innerHTML = customers.map((customer) => {
    const gameplan = (data.packageGameplans || []).find((item) => item.id === customer.gameplanId)
      || gameplanForPackage(customer.packageId);
    return record(
      customer.displayName,
      gameplan
        ? `${gameplan.customerVisibleSummary} Next milestone: ${formatTime(gameplan.nextMilestoneAt)}`
        : "No personalized gameplan has been assigned yet.",
      [
        chip(gameplan ? gameplan.title : "gameplan pending"),
        chip(customer.ageBand),
        chip(gameplan ? gameplan.laborModel : "unassigned")
      ]
    );
  }).join("");
}

function campaignAudienceLabel(route) {
  if (route.audienceTier === "under19") return "guardian gate";
  if (route.audienceTier === "corporate") return "business route";
  return "adult route";
}

function renderCampaignRoutes() {
  const routes = data.campaignRoutes || [];
  const adminTarget = byId("admin-campaign-routes");
  const publicTarget = byId("public-campaign-routes");

  if (adminTarget) {
    adminTarget.innerHTML = routes.map((route) => record(
      route.name,
      `${route.routeKey} | ${route.channel} | ${route.weeklyCadence}`,
      [
        statusChip(route.status || route.readinessStatus),
        chip(route.regionScope),
        chip(route.primaryConversion),
        chip(route.capacityMode),
        chip(`${(route.monitorKpis || []).length} KPIs`)
      ]
    )).join("");
  }

  if (publicTarget) {
    publicTarget.innerHTML = routes
      .filter((route) => route.publicRoute)
      .slice(0, 4)
      .map((route) => record(
        route.name,
        route.publicCopy,
        [
          chip(route.regionScope),
          chip(campaignAudienceLabel(route)),
          chip(route.ctaPrimary)
        ]
      )).join("");
  }
}

function renderMetrics(items) {
  const todayCount = items.filter((item) => item.time && item.time.startsWith(today)).length;
  const upcomingCount = items.filter((item) => item.time && item.time > `${today}T23:59:59`).length;
  const overdueCount = items.filter((item) => item.status === "overdue").length;
  const blockedCount = items.filter((item) => item.status === "blocked").length;

  byId("metric-today").textContent = todayCount;
  byId("metric-upcoming").textContent = upcomingCount;
  byId("metric-overdue").textContent = overdueCount;
  byId("metric-blocked").textContent = blockedCount;
  byId("monitor-health").textContent = overdueCount || blockedCount ? "Attention" : "Healthy";
}

function renderAdmin(items) {
  const adminItems = items
    .filter((item) => attentionStatuses.has(item.status) || item.kind === "session" || item.kind === "follow-up" || item.kind === "lead" || item.kind === "opportunity" || item.kind === "engagement" || item.kind === "campaign route" || item.kind === "agent work plan" || item.kind === "agent handoff")
    .slice(0, 10);

  byId("admin-actions").innerHTML = adminItems.map((item) => {
    const title = item.title || item.name || item.id;
    const body = item.summary
      ? `${item.kind} | ${item.summary}`
      : `${item.kind} | next: ${formatTime(item.time)}`;
    return record(title, body, [statusChip(item.status), chip(item.kind)]);
  }).join("");
}

function renderOpportunityOptions() {
  const select = byId("engagement-opportunity");
  const options = data.opportunities
    .filter((item) => ["planned", "waiting", "deferred"].includes(item.status))
    .map((opportunity) => {
      const label = `${packageName(opportunity.packageId)} | ${opportunity.status} | ${formatJpy(opportunity.estimatedValueJpy)}`;
      return `<option value="${escapeHtml(opportunity.id)}">${escapeHtml(label)}</option>`;
    });
  select.innerHTML = options.length
    ? options.join("")
    : "<option value=\"\">No open opportunities</option>";
}

function renderOpportunityFeed() {
  const opportunities = data.opportunities.slice(0, 6);
  byId("opportunity-feed").innerHTML = opportunities.length
    ? opportunities.map((opportunity) => {
      const body = `${opportunity.nextAction || "No next action set"} | ${formatTime(opportunity.nextActionAt)}`;
      return record(packageName(opportunity.packageId), body, [
        statusChip(opportunity.status),
        chip(formatJpy(opportunity.estimatedValueJpy)),
        chip(opportunity.owner || "owner pending")
      ]);
    }).join("")
    : record("Opportunity Pipeline", "No opportunities have been captured yet.", [chip("empty")]);
}

function renderEngagementFeed() {
  const engagements = data.engagements || [];
  byId("engagement-feed").innerHTML = engagements.length
    ? engagements.slice(0, 6).map((engagement) => {
      const body = `Onboarding due ${formatTime(engagement.onboardingDueAt)} | ${engagement.note || "Engagement plan active"}`;
      return record(packageName(engagement.packageId), body, [
        statusChip(engagement.status),
        chip(formatJpy(engagement.valueJpy)),
        chip(engagement.owner || "owner pending")
      ]);
    }).join("")
    : record("Engagements", "Accepted opportunities will appear here with onboarding and submission-plan records.", [chip("empty")]);
}

function renderScheduleOptions() {
  const select = byId("schedule-assignment");
  const options = data.assignments
    .filter((item) => item.externalVisible)
    .map((assignment) => {
      const customer = data.customers.find((item) => item.id === assignment.customerId);
      const owner = customer ? ` - ${customer.displayName}` : "";
      return `<option value="${escapeHtml(assignment.id)}">${escapeHtml(assignment.title + owner)}</option>`;
    });
  select.innerHTML = options.join("");
}

function renderScheduleLifecycleOptions() {
  const select = byId("schedule-lifecycle-session");
  const sessions = data.sessions || [];
  const options = sessions.map((session) => {
    const customer = data.customers.find((item) => item.id === session.customerId);
    const owner = customer ? ` - ${customer.displayName}` : "";
    return `<option value="${escapeHtml(session.id)}">${escapeHtml(session.title + owner)} (${escapeHtml(session.status)})</option>`;
  });
  select.innerHTML = options.length ? options.join("") : `<option value="">No scheduled sessions yet</option>`;
}

function renderScheduleFeed() {
  byId("schedule-feed").innerHTML = data.sessions.length ? data.sessions.slice(0, 6).map((session) => {
    const previous = session.previousStartAt ? ` | previous ${formatTime(session.previousStartAt)}` : "";
    const reason = session.cancelReason || session.rescheduleReason;
    const body = `${formatTime(session.startAt)} to ${formatTime(session.endAt)}${previous}${reason ? ` | ${reason}` : ""}`;
    return record(session.title, body, [
      statusChip(session.status),
      session.rescheduledAt ? chip("rescheduled") : "",
      session.canceledAt ? chip("canceled") : "",
      chip(session.owner || "owner pending")
    ]);
  }).join("") : record("Scheduled Sessions", "Schedule accepted work first; reschedule and cancellation controls will bind to the selected session.", [chip("empty")]);
}

function renderStudentStatus() {
  byId("student-status").innerHTML = data.customers.map((customer) => {
    return record(
      customer.displayName,
      customer.externalStatus,
      [
        chip(trackName(customer.trackId)),
        chip(customer.ageBand)
      ]
    );
  }).join("");
}

function renderCustomerUpdates() {
  const updates = (data.notificationEvents || [])
    .filter((item) => item.visible)
    .slice(0, 8);

  byId("customer-update-log").innerHTML = updates.length
    ? updates.map((update) => {
      const customer = data.customers.find((item) => item.id === update.customerId);
      return record(
        update.title,
        update.summary,
        [
          chip(customer?.displayName || "customer pending"),
          chip(update.outboxStatus || update.deliveryStatus || "pending"),
          chip(update.deliveryProvider || update.channel || "customer-update"),
          chip(formatTime(update.deliverAfterAt || update.createdAt))
        ]
      );
    }).join("")
    : record("Update Log", "No customer-visible updates have been created yet.", [chip("empty")]);
}

function renderSubmissionOptions() {
  const select = byId("submission-assignment");
  const options = data.assignments
    .filter((item) => item.externalVisible)
    .map((assignment) => {
      const customer = data.customers.find((item) => item.id === assignment.customerId);
      const owner = customer ? ` - ${customer.displayName}` : "";
      return `<option value="${escapeHtml(assignment.id)}">${escapeHtml(assignment.title + owner)}</option>`;
    });
  select.innerHTML = options.join("");
}

function renderSubmissions() {
  byId("submission-feed").innerHTML = data.submissions.slice(0, 6).map((submission) => {
    const assignment = data.assignments.find((item) => item.id === submission.assignmentId);
    const title = submission.title || assignment?.title || submission.id;
    const body = submission.summary || `Review due ${formatTime(submission.reviewDueAt)}`;
    return record(title, body, [
      statusChip(submission.status),
      chip(formatTime(submission.reviewDueAt))
    ]);
  }).join("");
}

function monitorSection(title, cards, sectionId) {
  return `
    <section class="monitor-section" id="${escapeHtml(sectionId)}">
      <div class="monitor-section-heading">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="monitor-grid">${cards.join("")}</div>
    </section>
  `;
}

function renderMonitorActionConsole(report) {
  const status = byId("monitor-operator-status");
  const buttons = byId("monitor-action-buttons");
  const receipts = byId("monitor-action-receipts");
  const actionCount = report.operatorActions.length;
  const riskCount = report.summary.risks;
  const accessWarnings = report.summary.safeAccessViolations;

  status.textContent = `${actionCount} queued action${actionCount === 1 ? "" : "s"} | ${report.summary.awaitingReview} awaiting review | ${accessWarnings} access warning${accessWarnings === 1 ? "" : "s"} | ${riskCount} total risks`;
  buttons.innerHTML = actionCount
    ? report.operatorActions.map((action) => `
      <button type="button" class="monitor-action-button" data-monitor-action-id="${escapeHtml(action.id)}">
        <span>${escapeHtml(action.title)}</span>
        <span class="button-meta">${escapeHtml(action.detail)}</span>
      </button>
    `).join("")
    : `<div class="record compact-record">
      <h3>No queued operator action</h3>
      <p>Scope, memory, and safe-access posture are currently aligned with the bounded monitor slice.</p>
      <div class="meta">${toneChip("stable", "complete")}</div>
    </div>`;

  receipts.innerHTML = (report.monitorHealthChecks || []).length
    ? report.monitorHealthChecks.map((item) => `
      <article class="record compact-record">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || "Monitor health check recorded.")}</p>
        <div class="meta">
          ${toneChip(item.status || "recorded", monitorReceiptTone(item.status))}
          ${chip(formatTime(item.createdAt))}
          ${item.target ? chip(item.target) : ""}
        </div>
      </article>
    `).join("")
    : `<div class="record compact-record">
      <h3>No monitor health check</h3>
      <p>Ledger-backed operator action receipts will appear here after export, review return, or safe-access acknowledgement.</p>
      <div class="meta">${chip("local-only")}</div>
    </div>`;
}

function runMonitorAction(actionId) {
  const action = (lastMonitorReport?.operatorActions || []).find((item) => item.id === actionId);
  if (!action) return;

  activateView("monitor");
  let detail = action.detail;
  let status = action.effect === "scroll" ? "waiting" : "complete";

  if (action.effect === "export-ledger") {
    appendMonitorReceipt(action, "Ledger export triggered from the monitor control action.", "complete", { persist: false });
    byId("export-ledger")?.click();
    detail = "Ledger export triggered from the monitor control action.";
  } else if (action.effect === "return-review") {
    byId("return-review")?.click();
    detail = "Queued review return triggered from the monitor control action.";
    appendMonitorReceipt(action, detail, status);
  } else if (action.effect === "acknowledge-posture") {
    detail = "Safe-access posture was acknowledged as local-first and intake-only.";
    appendMonitorReceipt(action, detail, status);
  } else {
    detail = `Opened ${action.target} for review.`;
    appendMonitorReceipt(action, detail, status);
  }

  renderAll();
  if (action.target) scrollToMonitorTarget(action.target);
}

function renderMonitor(items) {
  const attentionCount = items.filter((item) => attentionStatuses.has(item.status)).length;
  const visibleCount = data.assignments.filter((item) => item.externalVisible).length;
  const deadlines = recordTools.summarizeDeadlines(data, { now: `${today}T12:00:00+09:00` });
  const report = recordTools.buildMonitorReport(data, { now: `${today}T12:00:00+09:00` });
  const revenue = report.revenue || recordTools.summarizeRevenueState(data);
  const curriculum = report.curriculum || recordTools.summarizeCurriculumState(data);
  const notifications = report.notifications || recordTools.summarizeNotificationState(data);
  const notificationProvider = report.notificationProvider || recordTools.summarizeNotificationProviderState(data, { notifications });
  const quotes = report.quotes || recordTools.summarizeQuoteState(data);
  const paymentProvider = report.paymentProvider || recordTools.summarizePaymentProviderState(data, { quotes });
  const authSession = report.authSession || recordTools.summarizeAuthSessionRoleState(data);
  const scheduleControls = report.scheduleControls || recordTools.summarizeScheduleControlState(data);
  const handoffs = report.handoffs || recordTools.summarizeAgentHandoffState(data);
  const marketing = report.marketing || recordTools.summarizeMarketingState(data);
  const marketingConversion = report.marketingConversion || recordTools.summarizeMarketingConversionState(data);
  const providerAdapters = report.providerAdapters || recordTools.summarizeProviderAdapterSelectionState(data);
  const calendarAdapter = report.calendarAdapter || recordTools.summarizeCalendarAdapterPrototypeState(data);
  const routePlacement = report.routePlacement || recordTools.summarizeRoutePlacementState(data, { now: `${today}T12:00:00+09:00` });
  const accessGateways = report.accessGateways || recordTools.summarizeAccessGatewayState(data, { now: `${today}T12:00:00+09:00`, routePlacement });
  const calendarExport = recordTools.createCalendarExport(data, { now: `${today}T12:00:00+09:00` });
  const calendar = report.calendar || recordTools.summarizeCalendarExport(calendarExport);
  const calendarProvider = report.calendarProvider || recordTools.summarizeCalendarProviderState(data, { now: `${today}T12:00:00+09:00`, calendarExport });
  const persistence = report.persistence || recordTools.summarizePersistenceState(data, { now: `${today}T12:00:00+09:00` });
  const librarySync = report.librarySync || recordTools.summarizeLibrarySyncState(data, { now: `${today}T12:00:00+09:00`, persistence });
  lastMonitorReport = report;
  byId("monitor-route-status").textContent = `${routeForView("monitor")} | ${report.summary.queue} queued | ${report.summary.risks} risks | ${routePlacement.summary.routeCount} SYNAPSE routes | ${accessGateways.gatewayCount} access gates | ${librarySync.handoffCount} LIBRARY handoffs | ${calendarProvider.handoffCount} calendar handoffs | ${calendarAdapter.payloadReady} calendar prototypes ready | ${notificationProvider.handoffCount} notification provider handoffs | ${paymentProvider.handoffCount} payment provider handoffs | ${authSession.handoffCount} auth/session handoffs | ${marketing.ready} campaign routes ready | ${marketingConversion.readyEvents} conversion KPIs ready | ${providerAdapters.readyCandidates} provider adapters ready | ${persistence.adapterState}`;
  renderMonitorActionConsole(report);

  const summaryCards = [
    record("Monitor Summary", `${report.summary.queue} queued, ${report.summary.timeline} timeline records, ${report.summary.risks} risks.`, [chip(report.summary.health, report.summary.health === "Ready" ? "complete" : "blocked")]),
    record("Queue Attention", `${attentionCount} records need attention now.`, [chip(`${attentionCount} active`, "reviewing")]),
    record("Dirty Local State", report.summary.dirtyLocalState ? `Persistence is ${persistence.adapterState}; export is still required for a durable recovery point.` : "The current ledger is already in a snapshot-ready state.", [toneChip(report.summary.dirtyLocalState ? "dirty" : "clean", report.summary.dirtyLocalState ? "blocked" : "complete")]),
    record("Awaiting Review", `${report.summary.awaitingReview} submission/review record${report.summary.awaitingReview === 1 ? "" : "s"} still need operator return or blocker state.`, [toneChip(`${report.summary.awaitingReview} queued`, report.summary.awaitingReview ? "overdue" : "complete")]),
    record("Scope Health", `${report.scope.allowedCount} allowed surfaces, ${report.scope.blockedCount} blocked surfaces, ${report.summary.scopeWarnings} warning${report.summary.scopeWarnings === 1 ? "" : "s"}.`, [toneChip(report.scope.status, report.scope.status === "ready" ? "complete" : "overdue"), chip(report.scope.owner || "owner pending")]),
    record("Memory Health", `${report.memory.total} monitor note${report.memory.total === 1 ? "" : "s"} with ${report.memory.staleCount} stale and ${report.memory.watchCount} due soon.`, [toneChip(report.memory.status, report.memory.staleCount ? "blocked" : report.memory.watchCount ? "overdue" : "complete"), chip(report.memory.latestUpdate ? formatTime(report.memory.latestUpdate) : "no update")]),
    record("Safe Access", `${report.access.mode}, raw monitor ${report.access.rawMonitor}, raw admin ${report.access.rawAdmin}.`, [toneChip(`${report.summary.safeAccessViolations} warnings`, report.summary.safeAccessViolations ? "blocked" : "complete"), chip(report.access.defaultPublicPolicy)]),
    record("Access Gateway", `${accessGateways.controlledPublic} public, ${accessGateways.controlledCustomer} customer, ${accessGateways.deniedRaw} raw denied.`, [toneChip(accessGateways.status, accessGateways.status === "ready" ? "complete" : "blocked"), chip(`${accessGateways.gatewayCount} gates`)]),
    record("LIBRARY Sync", `${librarySync.exportHandoffs} export handoff, ${librarySync.recoveryHandoffs} recovery handoff, ${librarySync.searchReady} search-ready.`, [toneChip(librarySync.status, librarySync.violations.length ? "blocked" : librarySync.dirtySnapshotPending ? "overdue" : "complete"), chip(`${librarySync.handoffCount} handoffs`)]),
    record("Calendar Providers", `${calendarProvider.providerReady} provider handoffs, ${calendarProvider.invitationReady} invitation handoff, ${calendarProvider.noLiveSend} no-live-send.`, [toneChip(calendarProvider.status, calendarProvider.status === "ready" ? "complete" : "blocked"), chip(`${calendarProvider.handoffCount} handoffs`)]),
    record("Notification Providers", `${notificationProvider.providerReady} provider handoffs, ${notificationProvider.templateReady} template-ready, ${notificationProvider.consentReady} consent-ready, ${notificationProvider.noLiveSend} no-live-send.`, [toneChip(notificationProvider.status, notificationProvider.status === "ready" ? "complete" : "blocked"), chip(`${notificationProvider.handoffCount} handoffs`)]),
    record("Payment Providers", `${paymentProvider.providerReady} provider handoffs, ${paymentProvider.invoiceReady} invoice-ready, ${paymentProvider.checkoutReady} checkout-ready, ${paymentProvider.noLivePayment} no-live-payment.`, [toneChip(paymentProvider.status, paymentProvider.status === "ready" ? "complete" : "blocked"), chip(`${paymentProvider.handoffCount} handoffs`)]),
    record("Auth / Session Roles", `${authSession.publicReady} public, ${authSession.customerReady} customer, ${authSession.internalDenied} internal denied, ${authSession.noLiveAuth} no-live-auth.`, [toneChip(authSession.status, authSession.status === "ready" ? "complete" : "blocked"), chip(`${authSession.handoffCount} handoffs`)]),
    record("Operator Actions", `${report.operatorActions.length} local action${report.operatorActions.length === 1 ? "" : "s"} are queued in the monitor controls.`, [toneChip(`${report.operatorActions.length} queued`, report.operatorActions.length ? "overdue" : "complete")]),
    record("External Visibility", `${visibleCount} student/customer-visible records are available.`, [chip(`${visibleCount} visible`)]),
    record("Deadline Control", `${deadlines.today} today, ${deadlines.upcoming} upcoming, ${deadlines.overdue} overdue.`, [chip(`${deadlines.owned} owner-linked`, "planned")]),
    record("Opportunity Pipeline", `${revenue.pipelineCount} open opportunities with ${formatJpy(revenue.pipelineValueJpy)} estimated value.`, [chip(`${revenue.waitingCount} waiting`, "waiting"), chip(`${revenue.deferredCount} deferred`)]),
    record("Engagement Revenue", `${revenue.activeEngagements} active engagements with ${formatJpy(revenue.acceptedValueJpy)} accepted value.`, [chip(`${revenue.acceptedCount} accepted`, "complete"), chip(`${revenue.under19CompatibilityCount} compatibility gates`)]),
    record("Curriculum Readiness", `${curriculum.frameworks} frameworks, ${curriculum.activeGameplans} active/planned gameplans, ${curriculum.eikenLevelCount} EIKEN levels represented.`, [chip(`${curriculum.submissionFirstGameplans} submission-first`), chip(`${curriculum.under19GuardedGameplans} guarded`)]),
    record("Update Events", `${notifications.visible} visible updates, ${notifications.pending} pending, ${notifications.blocked} blocked.`, [chip(`${notifications.posted} posted`, "complete"), chip(`${notifications.total} total`)]),
    record("Notification Outbox", `${notifications.outbox} delivery handoff records, ${notifications.queued} queued, ${notifications.sent} sent, ${notifications.failed} failed.`, [chip(`${notifications.retryReady} retry-ready`), chip(`${notifications.missingOutbox} missing outbox`, notifications.missingOutbox ? "blocked" : "complete")]),
    record("Quote Readiness", `${quotes.total} quote records worth ${formatJpy(quotes.valueJpy)} with ${quotes.paymentReady} payment-ready and ${quotes.paymentBlocked} blocked.`, [chip(`${quotes.under19Blocked} under-19 gated`, quotes.under19Blocked ? "blocked" : "complete"), chip(`${quotes.paidRecorded} paid-recorded`)]),
    record("Reminder Control", `${scheduleControls.reminders} reminders, ${scheduleControls.recurrenceCandidates} recurrence candidates, ${scheduleControls.availabilityWindows} availability windows.`, [chip(`${scheduleControls.plannedReminders} planned`), chip(`${scheduleControls.availableWindows} available`)]),
    record("Agent Handoffs", `${handoffs.handoffs} handoffs, ${handoffs.workPlans} work plans, ${handoffs.pendingApprovals} pending approval, ${handoffs.dispatched} dispatched, ${handoffs.acknowledged} acknowledged, ${handoffs.complete} complete.`, [chip(`${handoffs.monitorVisible} monitor-visible`), chip(`${handoffs.customerVisibleBlocked} customer-visible`)]),
    record("Campaign Readiness", `${marketing.ready} of ${marketing.total} campaign routes ready across ${marketing.channelCount} channel groups.`, [chip(`${marketing.jp} JP`), chip(`${marketing.global} global`), chip(`${marketing.copyViolations} copy risks`, marketing.copyViolations ? "blocked" : "complete")]),
    record("Conversion KPIs", `${marketingConversion.readyEvents} of ${marketingConversion.eventCount} KPI events ready; ${marketingConversion.noLiveTracking} no-live-tracking.`, [toneChip(marketingConversion.status, marketingConversion.status === "ready" ? "complete" : "blocked"), chip(formatJpy(marketingConversion.potentialValueJpy))]),
    record("Provider Adapters", `${providerAdapters.readyCandidates} of ${providerAdapters.candidateCount} candidates ready; ${providerAdapters.noLiveProvider} no-live-provider and ${providerAdapters.noSecrets} no-secrets.`, [toneChip(providerAdapters.status, providerAdapters.status === "ready" ? "complete" : "blocked"), chip(`${providerAdapters.approvedSandboxOnly} sandbox-approved`)]),
    record("Sandbox Calendar Adapter", `${calendarAdapter.payloadReady} of ${calendarAdapter.prototypeCount} prototypes payload-ready; ${calendarAdapter.noLiveProvider} no-live-provider, ${calendarAdapter.noSecrets} no-secrets, ${calendarAdapter.noInvitationSend} no-invitation-send.`, [toneChip(calendarAdapter.status, calendarAdapter.status === "ready" ? "complete" : "blocked"), chip(`${calendarAdapter.payloadEntries} payload items`)]),
    record("SYNAPSE Placement", `${routePlacement.summary.routeCount} routes, ${routePlacement.placementMode}, ${routePlacement.access}.`, [chip(routePlacement.targetSystem), chip(routePlacement.duplicateUi ? "duplicate-ui" : "no-duplicate-ui"), chip(routePlacement.summary.monitorHref)]),
    record("Calendar Export", `${calendar.total} export-ready entries, ${calendar.customerVisible} customer-visible, ${calendar.updateLinked} update-linked.`, [chip(calendarExport.schema), chip(calendarExport.timezone)]),
    record("Persistence", `Ledger ${persistence.ledgerId} revision ${persistence.revision}; ${persistence.adapterState}; checksum ${persistence.checksum}.`, [chip(persistence.adapter), chip(persistence.libraryReady ? "library-ready" : "local-only")])
  ];

  const queueCards = report.queue.map((item) => record(
    item.title || item.id,
    `${item.kind} | ${formatTime(item.time)} | owner: ${item.owner}`,
    [statusChip(item.status), chip(item.kind)]
  ));

  const timelineCards = report.timeline.map((item) => record(
    item.title || item.id,
    `${item.kind} | ${formatTime(item.time)} | owner: ${item.owner}`,
    [statusChip(item.status), chip(item.id)]
  ));

  const scopeCards = [
    record(
      report.scope.title,
      `${report.scope.summary} Local authority: ${report.scope.localAuthority}`,
      [toneChip(report.scope.status, report.scope.status === "ready" ? "complete" : "overdue"), chip(report.scope.reviewBy ? formatTime(report.scope.reviewBy) : "review pending")]
    ),
    record(
      "Allowed Surfaces",
      report.scope.allowedSurfaces.join(" | ") || "No allowed surfaces recorded.",
      [chip(`${report.scope.allowedCount} allowed`), chip(routePlacement.summary.publicRoutes ? `${routePlacement.summary.publicRoutes} public intake` : "no public intake")]
    ),
    record(
      "Blocked Surfaces",
      report.scope.blockedSurfaces.join(" | ") || "No blocked surfaces recorded.",
      [chip(`${report.scope.blockedCount} blocked`), toneChip(`${report.scope.warnings.length} warnings`, report.scope.warnings.length ? "overdue" : "complete")]
    ),
    record(
      "Verification Steps",
      report.scope.verificationSteps.join(" | ") || "No verification steps recorded.",
      [chip(`${report.scope.verificationCount} checks`), chip(report.scope.owner || "owner pending")]
    )
  ];

  const memoryCards = report.memory.entries.length
    ? report.memory.entries.map((item) => record(
      item.title,
      item.summary,
      [
        toneChip(item.status || "active", String(item.status || "").trim() === "stale" || (item.reviewBy && item.reviewBy < `${today}T12:00:00+09:00`) ? "blocked" : "complete"),
        chip(item.reviewBy ? formatTime(item.reviewBy) : "review pending"),
        chip(item.owner || "owner pending")
      ]
    ))
    : [record("Memory", "No monitor memory notes have been recorded yet.", [chip("empty")])];

  const calendarCards = calendarExport.entries.slice(0, 8).map((item) => record(
    item.title,
    `${item.timeKind} | ${formatTime(item.startAt || item.dueAt)} | source: ${item.sourceKind}`,
    [statusChip(item.status), chip(item.localDate || "date pending"), chip(item.customerName || item.owner || "owner pending")]
  ));

  const handoffItems = [
    ...(data.workPlans || []).map((item) => ({
      title: item.title,
      body: `${item.sourceSystem} -> ${item.targetSystem} | ${formatTime(item.dueAt)} | ${item.summary}`,
      chips: [statusChip(item.status), chip(item.approvalStatus), chip(item.customerVisible ? "customer-visible" : "operator-approval")]
    })),
    ...(data.agentHandoffs || []).map((item) => ({
      title: item.title,
      body: `${item.sourceSystem} -> ${item.targetSystem} | ${formatTime(item.nextActionAt)} | ${item.lastNote || item.rollbackRule}`,
      chips: [statusChip(item.status), chip(item.approvalStatus), chip(item.customerVisible ? "customer-visible" : "internal-only"), chip(`${Array.isArray(item.receiptIds) ? item.receiptIds.length : 0} receipts`)]
    }))
  ];
  const handoffCards = handoffItems.length
    ? handoffItems.slice(0, 8).map((item) => record(item.title, item.body, item.chips))
    : [record("Agent Handoffs", "No SYMBIOSIS/ANVIL handoff records have been proposed yet.", [chip("empty")])];

  const outboxCards = (data.notificationDeliveries || []).length
    ? data.notificationDeliveries.slice(0, 8).map((item) => record(
      item.title,
      `${item.provider} | ${item.channel} | ${formatTime(item.nextActionAt || item.createdAt)} | ${item.lastNote || item.summary}`,
      [statusChip(item.status), chip(item.customerVisible ? "customer-safe" : "internal"), chip(`${Array.isArray(item.receiptIds) ? item.receiptIds.length : 0} receipts`)]
    ))
    : [record("Notification Outbox", "No customer-safe updates have been queued for delivery handoff yet.", [chip("empty")])];

  const notificationProviderCards = notificationProvider.handoffs.map((handoff) => record(
    handoff.title,
    `${handoff.targetProvider} | ${handoff.syncMode} | ${handoff.templatePolicy} | ${handoff.consentPolicy} | ${handoff.notes}`,
    [
      statusChip(handoff.status),
      chip(handoff.handoffStatus),
      chip(handoff.customerSafeStatus),
      toneChip(`${handoff.violations.length} violations`, handoff.violations.length ? "blocked" : "complete")
    ]
  ));

  const paymentProviderCards = paymentProvider.handoffs.map((handoff) => record(
    handoff.title,
    `${handoff.targetProvider} | ${handoff.syncMode} | ${handoff.invoicePolicy} | ${handoff.checkoutPolicy} | ${handoff.eligibilityPolicy} | ${handoff.notes}`,
    [
      statusChip(handoff.status),
      chip(handoff.handoffStatus),
      chip(handoff.customerSafeStatus),
      toneChip(`${handoff.violations.length} violations`, handoff.violations.length ? "blocked" : "complete")
    ]
  ));

  const authSessionCards = authSession.handoffs.map((handoff) => record(
    handoff.title,
    `${handoff.roleKey} | ${handoff.surface} | ${handoff.sessionMode} | ${handoff.accessPolicy} | ${handoff.notes}`,
    [
      statusChip(handoff.status),
      chip(handoff.handoffStatus),
      chip(handoff.publicExposure),
      toneChip(`${handoff.violations.length} violations`, handoff.violations.length ? "blocked" : "complete")
    ]
  ));

  const quoteCards = (data.quotes || []).length
    ? data.quotes.slice(0, 8).map((item) => record(
      item.title,
      `${formatJpy(item.amountJpy)} | ${item.customerSafeStatus || item.summary}`,
      [statusChip(item.status), chip(item.paymentStatus), chip(item.guardianConsentRequired ? "guardian-consent-required" : "payment-gate-clear")]
    ))
    : [record("Quote Readiness", "No quote or estimate records have been created yet.", [chip("empty")])];

  const scheduleControlItems = [
    ...(data.reminderRules || []).map((item) => ({
      title: item.title,
      body: `${item.sourceKind}:${item.sourceId} | ${formatTime(item.nextActionAt || item.reminderAt)} | ${item.summary}`,
      chips: [statusChip(item.status), chip(item.channel), chip(item.customerVisible ? "customer-safe" : "internal")]
    })),
    ...(data.recurrenceCandidates || []).map((item) => ({
      title: item.title,
      body: `${item.sourceKind}:${item.sourceId} | ${item.cadence} | ${formatTime(item.nextCandidateAt)}`,
      chips: [statusChip(item.status), chip(item.autoCreateSessions ? "auto" : "operator-approved"), chip(item.customerVisible ? "customer-safe" : "internal")]
    })),
    ...(data.availabilityWindows || []).map((item) => ({
      title: item.title,
      body: `${item.owner} | ${formatTime(item.startAt)} - ${formatTime(item.endAt)} | capacity ${item.capacity}`,
      chips: [statusChip(item.status), chip(item.serviceLane), chip(item.customerVisible ? "customer-safe" : "internal")]
    }))
  ];
  const scheduleControlCards = scheduleControlItems.length
    ? scheduleControlItems.slice(0, 8).map((item) => record(item.title, item.body, item.chips))
    : [record("Reminder Control", "No reminder, recurrence, or availability-window records have been created yet.", [chip("empty")])];

  const routeCards = routePlacement.routes.map((route) => record(
    route.label,
    `${route.surface} | ${route.href} | ${route.summary}`,
    [statusChip(route.status), chip(route.visibility), chip(route.placement === "link" ? "link-only" : route.placement)]
  ));

  const gatewayCards = accessGateways.gateways.map((gateway) => record(
    gateway.label,
    `${gateway.surface} | ${gateway.href} | ${gateway.policy} | ${gateway.notes}`,
    [
      statusChip(gateway.status),
      chip(gateway.publicExposure),
      chip(gateway.verificationStatus),
      toneChip(`${gateway.violations.length} violations`, gateway.violations.length ? "blocked" : "complete")
    ]
  ));

  const librarySyncCards = librarySync.handoffs.map((handoff) => record(
    handoff.title,
    `${handoff.sourceSystem} -> ${handoff.targetSystem} | ${handoff.syncMode} | ${handoff.notes}`,
    [
      statusChip(handoff.status),
      chip(handoff.handoffStatus),
      chip(handoff.recoveryState),
      toneChip(`${handoff.violations.length} violations`, handoff.violations.length ? "blocked" : "complete")
    ]
  ));

  const calendarProviderCards = calendarProvider.handoffs.map((handoff) => record(
    handoff.title,
    `${handoff.targetProvider} | ${handoff.syncMode} | ${handoff.invitationPolicy} | ${handoff.notes}`,
    [
      statusChip(handoff.status),
      chip(handoff.handoffStatus),
      chip(handoff.customerSafeStatus),
      toneChip(`${handoff.violations.length} violations`, handoff.violations.length ? "blocked" : "complete")
    ]
  ));

  const curriculumCards = [
    ...(data.curriculumFrameworks || []).map((framework) => record(
      framework.title,
      `${framework.diagnostic} | ${framework.cadence}`,
      [statusChip(framework.status), chip(Array.isArray(framework.levels) ? framework.levels.join("/") : "adaptive"), chip(framework.trackId)]
    )),
    ...(data.packageGameplans || []).map((gameplan) => record(
      gameplan.title,
      `${packageName(gameplan.packageId)} | ${gameplan.internalReadiness}`,
      [statusChip(gameplan.status), chip(gameplan.laborModel), chip(formatTime(gameplan.nextMilestoneAt))]
    ))
  ];

  const campaignCards = (data.campaignRoutes || []).map((route) => record(
    route.name,
    `${route.routeKey} | ${route.channel} | ${route.weeklyCadence}`,
    [
      statusChip(route.status || route.readinessStatus),
      chip(route.regionScope),
      chip(route.primaryConversion),
      chip(route.audienceTier),
      chip(route.guardianConsentRequired ? "guardian-consent" : route.copyPolicy)
    ]
  ));

  const marketingConversionCards = marketingConversion.events.map((event) => record(
    event.title,
    `${event.routeKey} | ${event.eventType} | ${event.attributionPolicy} | ${event.notes}`,
    [
      statusChip(event.status),
      chip(event.readinessStatus),
      chip(event.regionScope),
      toneChip(`${event.violations.length} violations`, event.violations.length ? "blocked" : "complete")
    ]
  ));

  const providerAdapterCards = providerAdapters.candidates.map((candidate) => record(
    candidate.title,
    `${candidate.providerFamily} | ${candidate.targetProvider} | ${candidate.goNoGoState} | ${candidate.notes}`,
    [
      statusChip(candidate.status),
      chip(candidate.readinessStatus),
      chip(candidate.sandboxOnly ? "sandbox-only" : "sandbox-missing"),
      toneChip(`${candidate.violations.length} violations`, candidate.violations.length ? "blocked" : "complete")
    ]
  ));

  const calendarAdapterCards = calendarAdapter.prototypes.map((prototype) => record(
    prototype.title,
    `${prototype.targetProvider} | ${prototype.adapterMode} | ${prototype.prototypeStatus} | ${prototype.payloadEntryCount} local preview items | ${prototype.notes}`,
    [
      statusChip(prototype.status),
      chip(prototype.payloadMode),
      chip(prototype.sandboxOnly && prototype.localOnly ? "sandbox-local" : "boundary-missing"),
      toneChip(`${prototype.violations.length} violations`, prototype.violations.length ? "blocked" : "complete")
    ]
  ));

  const riskCards = report.risks.length
    ? report.risks.map((item) => record(item.title, item.detail, [chip(item.severity, item.severity === "high" ? "blocked" : "overdue")]))
    : [record("Risks", "No active risk records in the current operating surface.", [chip("clear", "complete")])];

  const receiptCards = report.receipts.map((item) => record(
    item.kind,
    item.note || `Receipt created ${formatTime(item.createdAt)}`,
    [statusChip(item.status), chip(formatTime(item.createdAt))]
  ));

  const accessCards = [
    record(
      "Safe Access Posture",
      `${report.access.mode}; raw monitor ${report.access.rawMonitor}; raw admin ${report.access.rawAdmin}; public intake ${report.access.publicIntake}.`,
      [toneChip(report.access.status, report.access.status === "ready" ? "complete" : "blocked"), chip(report.access.defaultPublicPolicy)]
    ),
    record(
      "Controlled Customer Route",
      `${report.access.customerStatus} stays customer-safe while internal admin and monitor routes remain local-first.`,
      [chip(routePlacement.summary.controlledCustomerRoutes ? `${routePlacement.summary.controlledCustomerRoutes} controlled` : "none"), chip(report.access.safeGateway)]
    ),
    record(
      "Gateway Contract",
      `${accessGateways.gatewayCount} gateway records with ${accessGateways.controlledPublic} controlled public, ${accessGateways.controlledCustomer} controlled customer, and ${accessGateways.deniedRaw} raw denial rules.`,
      [toneChip(accessGateways.status, accessGateways.status === "ready" ? "complete" : "blocked"), chip(accessGateways.schema)]
    ),
    record(
      "Operator Rule",
      report.access.operatorRule,
      [toneChip(`${report.access.violations.length} violations`, report.access.violations.length ? "blocked" : "complete"), chip(report.access.lastVerifiedAt ? formatTime(report.access.lastVerifiedAt) : "not verified")]
    ),
    record(
      "Access Notes",
      (report.access.notes || []).join(" | ") || "No access notes recorded.",
      [chip(report.access.verificationStatus || "unverified")]
    )
  ];

  const persistenceCards = [
    record(
      "Durable Ledger Boundary",
      `${persistence.source} snapshot ${persistence.snapshotAt}; parent revision ${persistence.parentRevision || "none"}.`,
      [chip(`revision ${persistence.revision}`), chip(persistence.adapterState), chip(persistence.libraryReady ? "LIBRARY-ready" : "local-only")]
    ),
    record(
      "Recovery Contract",
      persistence.recoveryNote,
      [chip(persistence.ledgerId), chip(persistence.checksum)]
    )
  ];

  byId("monitor-items").innerHTML = [
    monitorSection("Summary", summaryCards, "monitor-summary"),
    monitorSection("Scope", scopeCards, "monitor-scope"),
    monitorSection("Memory", memoryCards, "monitor-memory"),
    monitorSection("Queue", queueCards, "monitor-queue"),
    monitorSection("Timeline", timelineCards, "monitor-timeline"),
    monitorSection("Curriculum / Gameplans", curriculumCards, "monitor-curriculum"),
    monitorSection("Campaign Routes", campaignCards.length ? campaignCards : [record("Campaign Routes", "No campaign route records have been created yet.", [chip("empty")])], "monitor-campaigns"),
    monitorSection("Marketing Conversion KPIs", marketingConversionCards.length ? marketingConversionCards : [record("Marketing Conversion KPIs", "No local conversion KPI readiness records have been created yet.", [chip("empty")])], "monitor-marketing-conversions"),
    monitorSection("Provider Adapter Go/No-Go", providerAdapterCards.length ? providerAdapterCards : [record("Provider Adapter Go/No-Go", "No provider adapter candidate records have been created yet.", [chip("empty")])], "monitor-provider-adapters"),
    monitorSection("Sandbox Calendar Adapter", calendarAdapterCards.length ? calendarAdapterCards : [record("Sandbox Calendar Adapter", "No sandbox calendar adapter prototype records have been created yet.", [chip("empty")])], "monitor-calendar-adapter"),
    monitorSection("Agent Handoffs", handoffCards, "monitor-handoffs"),
    monitorSection("Notification Outbox", outboxCards, "monitor-notification-outbox"),
    monitorSection("Notification Provider Handoffs", notificationProviderCards.length ? notificationProviderCards : [record("Notification Providers", "No notification provider handoff records have been created yet.", [chip("empty")])], "monitor-notification-provider"),
    monitorSection("Payment Provider Handoffs", paymentProviderCards.length ? paymentProviderCards : [record("Payment Providers", "No payment provider handoff records have been created yet.", [chip("empty")])], "monitor-payment-provider"),
    monitorSection("Auth Session Role Handoffs", authSessionCards.length ? authSessionCards : [record("Auth Session Roles", "No auth/session role handoff records have been created yet.", [chip("empty")])], "monitor-auth-session"),
    monitorSection("Quote Readiness", quoteCards, "monitor-quotes"),
    monitorSection("Reminder Control", scheduleControlCards, "monitor-reminders"),
    monitorSection("SYNAPSE Placement", routeCards, "monitor-suite"),
    monitorSection("Access Gateway Records", gatewayCards.length ? gatewayCards : [record("Access Gateway", "No access gateway records have been created yet.", [chip("empty")])], "monitor-access-gateways"),
    monitorSection("LIBRARY Sync Handoffs", librarySyncCards.length ? librarySyncCards : [record("LIBRARY Sync", "No LIBRARY sync handoff records have been created yet.", [chip("empty")])], "monitor-library-sync"),
    monitorSection("Calendar Provider Handoffs", calendarProviderCards.length ? calendarProviderCards : [record("Calendar Providers", "No calendar provider handoff records have been created yet.", [chip("empty")])], "monitor-calendar-provider"),
    monitorSection("Calendar Export", calendarCards.length ? calendarCards : [record("Calendar Export", "No export-ready calendar entries have been created yet.", [chip("empty")])], "monitor-calendar"),
    monitorSection("Persistence", persistenceCards, "monitor-persistence"),
    monitorSection("Safe Access", accessCards, "monitor-access"),
    monitorSection("Risks", riskCards, "monitor-risks"),
    monitorSection("Receipts", receiptCards.length ? receiptCards : [record("Receipts", "No receipts have been created yet.", [chip("empty")])], "monitor-receipts")
  ].join("");
}

function renderLedgerStatus() {
  byId("storage-status").textContent = storageStatusText();
}

function renderAgentHandoffOptions() {
  const select = byId("agent-handoff-select");
  const submit = byId("agent-handoff-transition");
  const handoffs = data.agentHandoffs || [];
  const options = handoffs.map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = options.length ? options.join("") : `<option value="">No ARA handoff records yet</option>`;
  if (submit) submit.disabled = !options.length;
}

function renderNotificationDeliveryOptions() {
  const select = byId("notification-delivery-select");
  if (!select) return;
  const deliveries = data.notificationDeliveries || [];
  const options = deliveries.map((delivery) => {
    return `<option value="${escapeHtml(delivery.id)}">${escapeHtml(delivery.title)} (${escapeHtml(delivery.status)})</option>`;
  });
  select.innerHTML = options.length ? options.join("") : `<option value="">Queue visible updates first</option>`;
}

function renderNotificationProviderOptions() {
  const select = byId("notification-provider-select");
  const submit = byId("notification-provider-apply");
  if (!select) return;
  const handoffOptions = (data.notificationProviderHandoffs || []).map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = handoffOptions.length ? handoffOptions.join("") : `<option value="">No notification provider handoffs yet</option>`;
  if (submit) submit.disabled = !handoffOptions.length;
}

function renderPaymentProviderOptions() {
  const select = byId("payment-provider-select");
  const submit = byId("payment-provider-apply");
  if (!select) return;
  const handoffOptions = (data.paymentProviderHandoffs || []).map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = handoffOptions.length ? handoffOptions.join("") : `<option value="">No payment provider handoffs yet</option>`;
  if (submit) submit.disabled = !handoffOptions.length;
}

function renderAuthSessionRoleOptions() {
  const select = byId("auth-session-role-select");
  const submit = byId("auth-session-role-apply");
  if (!select) return;
  const handoffOptions = (data.authSessionRoleHandoffs || []).map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = handoffOptions.length ? handoffOptions.join("") : `<option value="">No auth/session role handoffs yet</option>`;
  if (submit) submit.disabled = !handoffOptions.length;
}

function renderMarketingConversionOptions() {
  const select = byId("marketing-conversion-select");
  const submit = byId("marketing-conversion-apply");
  if (!select) return;
  const eventOptions = (data.marketingConversionEvents || []).map((event) => {
    return `<option value="${escapeHtml(event.id)}">${escapeHtml(event.title)} (${escapeHtml(event.status)})</option>`;
  });
  select.innerHTML = eventOptions.length ? eventOptions.join("") : `<option value="">No conversion KPI events yet</option>`;
  if (submit) submit.disabled = !eventOptions.length;
}

function renderProviderAdapterOptions() {
  const select = byId("provider-adapter-select");
  const submit = byId("provider-adapter-apply");
  if (!select) return;
  const candidateOptions = (data.providerAdapterCandidates || []).map((candidate) => {
    return `<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.title)} (${escapeHtml(candidate.status)})</option>`;
  });
  select.innerHTML = candidateOptions.length ? candidateOptions.join("") : `<option value="">No provider adapter candidates yet</option>`;
  if (submit) submit.disabled = !candidateOptions.length;
}

function renderCalendarAdapterOptions() {
  const select = byId("calendar-adapter-select");
  const submit = byId("calendar-adapter-apply");
  if (!select) return;
  const prototypeOptions = (data.calendarAdapterPrototypes || []).map((prototype) => {
    return `<option value="${escapeHtml(prototype.id)}">${escapeHtml(prototype.title)} (${escapeHtml(prototype.status)})</option>`;
  });
  select.innerHTML = prototypeOptions.length ? prototypeOptions.join("") : `<option value="">No sandbox calendar adapter prototypes yet</option>`;
  if (submit) submit.disabled = !prototypeOptions.length;
}

function renderQuoteOptions() {
  const quoteSelect = byId("quote-select");
  const opportunitySelect = byId("quote-opportunity");
  if (quoteSelect) {
    const quoteOptions = (data.quotes || []).map((quote) => {
      return `<option value="${escapeHtml(quote.id)}">${escapeHtml(quote.title)} (${escapeHtml(quote.status)})</option>`;
    });
    quoteSelect.innerHTML = quoteOptions.length ? quoteOptions.join("") : `<option value="">Create a quote first</option>`;
  }
  if (opportunitySelect) {
    const opportunityOptions = (data.opportunities || []).map((opportunity) => {
      return `<option value="${escapeHtml(opportunity.id)}">${escapeHtml(`${packageName(opportunity.packageId)} - ${opportunity.status}`)}</option>`;
    });
    opportunitySelect.innerHTML = opportunityOptions.join("");
  }
}

function renderReminderControlOptions() {
  const reminderSelect = byId("reminder-rule-select");
  const recurrenceSelect = byId("recurrence-candidate-select");
  const availabilitySelect = byId("availability-window-select");
  const sourceSelect = byId("reminder-source");
  if (reminderSelect) {
    const reminderOptions = (data.reminderRules || []).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)} (${escapeHtml(item.status)})</option>`);
    reminderSelect.innerHTML = reminderOptions.length ? reminderOptions.join("") : `<option value="">Create a reminder first</option>`;
  }
  if (recurrenceSelect) {
    const recurrenceOptions = (data.recurrenceCandidates || []).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)} (${escapeHtml(item.status)})</option>`);
    recurrenceSelect.innerHTML = recurrenceOptions.length ? recurrenceOptions.join("") : `<option value="">Create a recurrence candidate first</option>`;
  }
  if (availabilitySelect) {
    const availabilityOptions = (data.availabilityWindows || []).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)} (${escapeHtml(item.status)})</option>`);
    availabilitySelect.innerHTML = availabilityOptions.length ? availabilityOptions.join("") : `<option value="">Create an availability window first</option>`;
  }
  if (sourceSelect) {
    const sourceItems = [
      ...data.sessions.map((item) => ({ id: item.id, label: `session: ${item.title}` })),
      ...data.assignments.map((item) => ({ id: item.id, label: `assignment: ${item.title}` })),
      ...data.followups.map((item) => ({ id: item.id, label: `follow-up: ${item.title}` }))
    ];
    sourceSelect.innerHTML = sourceItems.length
      ? sourceItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("")
      : `<option value="">Schedule or request work first</option>`;
  }
}

function renderAccessGatewayOptions() {
  const select = byId("access-gateway-select");
  const submit = byId("access-gateway-apply");
  if (!select) return;
  const gatewayOptions = (data.accessGateways || []).map((gateway) => {
    return `<option value="${escapeHtml(gateway.id)}">${escapeHtml(gateway.label)} (${escapeHtml(gateway.publicExposure || gateway.visibility)})</option>`;
  });
  select.innerHTML = gatewayOptions.length ? gatewayOptions.join("") : `<option value="">No access gateway records yet</option>`;
  if (submit) submit.disabled = !gatewayOptions.length;
}

function renderLibrarySyncOptions() {
  const select = byId("library-sync-select");
  const submit = byId("library-sync-apply");
  if (!select) return;
  const handoffOptions = (data.librarySyncHandoffs || []).map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = handoffOptions.length ? handoffOptions.join("") : `<option value="">No LIBRARY sync handoffs yet</option>`;
  if (submit) submit.disabled = !handoffOptions.length;
}

function renderCalendarProviderOptions() {
  const select = byId("calendar-provider-select");
  const submit = byId("calendar-provider-apply");
  if (!select) return;
  const handoffOptions = (data.calendarProviderHandoffs || []).map((handoff) => {
    return `<option value="${escapeHtml(handoff.id)}">${escapeHtml(handoff.title)} (${escapeHtml(handoff.status)})</option>`;
  });
  select.innerHTML = handoffOptions.length ? handoffOptions.join("") : `<option value="">No calendar provider handoffs yet</option>`;
  if (submit) submit.disabled = !handoffOptions.length;
}

function renderIntakeSnapshot() {
  const requests = data.assignments
    .filter((item) => item.externalVisible)
    .slice(0, 4);

  byId("intake-feed").innerHTML = requests.map((item) => {
    return record(
      item.title,
      item.summary || `Visible request due ${formatTime(item.dueAt)}`,
      [statusChip(item.status), chip("external"), chip(packageName(item.packageId))]
    );
  }).join("");
}

function renderAll() {
  const items = allOperatingItems();
  renderMetrics(items);
  renderOfferOptions();
  renderOfferCatalog();
  renderCurriculumFrameworks();
  renderAdminGameplans();
  renderStudentGameplans();
  renderCampaignRoutes();
  renderOpportunityOptions();
  renderOpportunityFeed();
  renderEngagementFeed();
  renderScheduleOptions();
  renderScheduleLifecycleOptions();
  renderScheduleFeed();
  renderAdmin(items);
  renderStudentStatus();
  renderCustomerUpdates();
  renderSubmissionOptions();
  renderSubmissions();
  renderMonitor(items);
  renderAgentHandoffOptions();
  renderNotificationDeliveryOptions();
  renderNotificationProviderOptions();
  renderPaymentProviderOptions();
  renderAuthSessionRoleOptions();
  renderMarketingConversionOptions();
  renderProviderAdapterOptions();
  renderCalendarAdapterOptions();
  renderQuoteOptions();
  renderReminderControlOptions();
  renderAccessGatewayOptions();
  renderLibrarySyncOptions();
  renderCalendarProviderOptions();
  renderIntakeSnapshot();
  renderLedgerStatus();
}

function wireOpportunityForm() {
  const form = byId("opportunity-form");
  const confirmation = byId("opportunity-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = recordTools.decideOpportunityRecords(data, Object.fromEntries(formData.entries()));
    data = result.data;
    persistData();
    renderAll();

    const decision = result.records.opportunity.status;
    const title = decision === "accepted"
      ? "Engagement Accepted"
      : decision === "deferred"
        ? "Opportunity Deferred"
        : "Opportunity Rejected";
    const body = decision === "accepted"
      ? `${result.records.engagement.id} created with onboarding, first submission plan, follow-up, and receipt records.`
      : `${packageName(result.records.opportunity.packageId)} moved to ${decision} with follow-up and receipt records.`;
    confirmation.innerHTML = record(title, body, [
      statusChip(decision),
      chip(result.records.opportunity.owner || "owner pending")
    ]);
    form.reset();
  });
}

function activateView(viewName, options = {}) {
  const nextView = viewNames.has(viewName) ? viewName : "admin";
  document.body.dataset.activeView = nextView;
  document.querySelectorAll("[data-view]").forEach((item) => {
    const isActive = item.dataset.view === nextView;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
    item.setAttribute("aria-current", isActive ? "true" : "false");
  });
  document.querySelectorAll(".view").forEach((item) => {
    item.classList.toggle("active", item.id === `view-${nextView}`);
  });
  if (options.updateRoute !== false && window.location.hash !== routeForView(nextView)) {
    window.history.replaceState(null, "", routeForView(nextView));
  }
}

function wireTabs() {
  document.querySelectorAll("[data-view]").forEach((tab) => {
    tab.addEventListener("click", () => activateView(tab.dataset.view));
  });
  window.addEventListener("hashchange", () => activateView(viewFromRoute(), { updateRoute: false }));
}

function wireMonitorMenu() {
  document.querySelectorAll("[data-monitor-target]").forEach((control) => {
    control.addEventListener("click", () => {
      activateView("monitor");
      const target = byId(control.dataset.monitorTarget);
      if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  });
}

function wireMonitorActionConsole() {
  byId("monitor-action-buttons").addEventListener("click", (event) => {
    const button = event.target.closest("[data-monitor-action-id]");
    if (!button) return;
    runMonitorAction(button.dataset.monitorActionId);
  });
}

function wirePublicActions() {
  document.querySelectorAll("[data-public-target]").forEach((control) => {
    control.addEventListener("click", () => {
      activateView("public");
      const target = byId(control.dataset.publicTarget);
      if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  });
}

function wireIntakeForm() {
  const form = byId("intake-form");
  const confirmation = byId("intake-confirmation");
  const resetButton = byId("reset-demo-data");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = recordTools.createIntakeRecords(data, Object.fromEntries(formData.entries()));
    data = result.data;
    persistData();
    renderAll();
    confirmation.innerHTML = record(
      "Request Captured",
      `${result.records.assignment.title} entered the operating queue and is visible across admin, external status, and monitor views.`,
      [statusChip(result.records.assignment.status), chip(result.records.customer.ageBand)]
    );
    form.reset();
  });

  resetButton.addEventListener("click", () => {
    resetData();
    renderAll();
    confirmation.innerHTML = "";
  });
}

function wireScheduleForm() {
  const form = byId("schedule-form");
  const confirmation = byId("schedule-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = recordTools.createScheduleRecords(data, Object.fromEntries(formData.entries()));
    data = result.data;
    persistData();
    renderAll();
    confirmation.innerHTML = record(
      "Work Scheduled",
      `${result.records.session.title} is now on the schedule with deadline control active.`,
      [statusChip(result.records.session.status), chip(result.records.session.owner)]
    );
    form.reset();
  });
}

function wireScheduleLifecycleForm() {
  const form = byId("schedule-lifecycle-form");
  const confirmation = byId("schedule-lifecycle-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const result = payload.action === "cancel"
      ? recordTools.cancelScheduleRecords(data, payload)
      : recordTools.rescheduleScheduleRecords(data, payload);
    data = result.data;
    persistData();
    renderAll();

    const title = payload.action === "cancel" ? "Schedule Canceled" : "Schedule Rescheduled";
    const body = payload.action === "cancel"
      ? `${result.records.session.title} was canceled without deleting the historical session record.`
      : `${result.records.session.title} moved to ${formatTime(result.records.session.startAt)} with customer-safe update and receipt records.`;
    confirmation.innerHTML = record(title, body, [
      statusChip(result.records.session.status),
      chip(result.records.receipt.kind)
    ]);
    form.reset();
  });
}

function wireSubmissionForm() {
  const form = byId("submission-form");
  const confirmation = byId("submission-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = recordTools.createSubmissionRecords(data, Object.fromEntries(formData.entries()));
    data = result.data;
    persistData();
    renderAll();
    confirmation.innerHTML = record(
      "Submission Received",
      `${result.records.submission.title} is now in the review queue and visible to the monitor.`,
      [statusChip(result.records.submission.status), chip("review queue")]
    );
    form.reset();
  });
}

function wireReviewReturn() {
  const button = byId("return-review");
  const summary = byId("review-return-summary");
  const confirmation = byId("review-confirmation");

  button.addEventListener("click", () => {
    const result = recordTools.returnReviewRecords(data, {
      returnedSummary: summary.value
    });
    data = result.data;
    persistData();
    renderAll();
    confirmation.innerHTML = record(
      "Review Returned",
      result.records.review.summary,
      [statusChip(result.records.review.status), chip("receipt created")]
    );
  });
}

function wireAgentHandoffForm() {
  const form = byId("agent-handoff-form");
  const confirmation = byId("agent-handoff-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = recordTools.transitionAgentHandoffRecords(data, Object.fromEntries(formData.entries()));
    data = result.data;
    persistData();
    renderAll();
    confirmation.innerHTML = record(
      "ARA Handoff Updated",
      `${result.records.handoff.title} moved to ${result.records.handoff.status} with ${result.records.receipt.kind}.`,
      [statusChip(result.records.handoff.status), chip(result.records.handoff.approvalStatus), chip(result.records.notificationEvent ? "customer-update" : "internal-only")]
    );
    form.reset();
  });
}

function wireNotificationOutboxForm() {
  const form = byId("notification-outbox-form");
  const confirmation = byId("notification-outbox-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = payload.action === "queue"
        ? recordTools.createNotificationOutboxRecords(data, payload)
        : recordTools.transitionNotificationDeliveryRecords(data, payload);
      data = result.data;
      persistData();
      renderAll();
      const delivery = result.records.delivery || result.records.deliveries?.[0];
      const count = result.records.deliveries ? result.records.deliveries.length : 1;
      confirmation.innerHTML = record(
        payload.action === "queue" ? "Outbox Queued" : "Delivery Updated",
        payload.action === "queue"
          ? `${count} customer-safe update${count === 1 ? "" : "s"} queued for provider-neutral delivery handoff.`
          : `${delivery.title} moved to ${delivery.status}.`,
        [statusChip(delivery?.status || "queued"), chip(payload.provider || delivery?.provider || "operator-dispatch")]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Outbox Action Blocked",
        error.message || "Notification outbox action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireNotificationProviderForm() {
  const form = byId("notification-provider-form");
  const confirmation = byId("notification-provider-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionNotificationProviderHandoffRecords(data, payload, {
        now: "2026-06-01T15:05:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Notification provider handoff changed locally; export a ledger snapshot before live delivery provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Notification Provider Updated",
        `${result.records.handoff.title} is ${result.records.handoff.handoffStatus}.`,
        [statusChip(result.records.handoff.status), chip(result.records.handoff.targetProvider), chip(result.records.handoff.consentPolicy)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Notification Provider Blocked",
        error.message || "Notification provider handoff action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wirePaymentProviderForm() {
  const form = byId("payment-provider-form");
  const confirmation = byId("payment-provider-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionPaymentProviderHandoffRecords(data, payload, {
        now: "2026-06-01T15:15:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Payment provider handoff changed locally; export a ledger snapshot before live payment provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Payment Provider Updated",
        `${result.records.handoff.title} is ${result.records.handoff.handoffStatus}.`,
        [statusChip(result.records.handoff.status), chip(result.records.handoff.targetProvider), chip(result.records.handoff.eligibilityPolicy)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Payment Provider Blocked",
        error.message || "Payment provider handoff action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireAuthSessionRoleForm() {
  const form = byId("auth-session-role-form");
  const confirmation = byId("auth-session-role-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionAuthSessionRoleHandoffRecords(data, payload, {
        now: "2026-06-01T16:20:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Auth/session role handoff changed locally; export a ledger snapshot before live identity-provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Auth Session Role Updated",
        `${result.records.handoff.title} is ${result.records.handoff.handoffStatus}.`,
        [statusChip(result.records.handoff.status), chip(result.records.handoff.roleKey), chip(result.records.handoff.publicExposure)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Auth Session Role Blocked",
        error.message || "Auth/session role handoff action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireMarketingConversionForm() {
  const form = byId("marketing-conversion-form");
  const confirmation = byId("marketing-conversion-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionMarketingConversionEventRecords(data, payload, {
        now: "2026-06-01T16:45:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Marketing conversion KPI readiness changed locally; export a ledger snapshot before live ad or analytics provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Marketing Conversion KPI Updated",
        `${result.records.event.title} is ${result.records.event.readinessStatus}.`,
        [statusChip(result.records.event.status), chip(result.records.event.eventType), chip(result.records.event.analyticsProvider)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Marketing Conversion KPI Blocked",
        error.message || "Marketing conversion KPI action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireProviderAdapterForm() {
  const form = byId("provider-adapter-form");
  const confirmation = byId("provider-adapter-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionProviderAdapterCandidateRecords(data, payload, {
        now: "2026-06-01T17:15:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Provider adapter go/no-go readiness changed locally; export a ledger snapshot before any live provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Provider Adapter Go/No-Go Updated",
        `${result.records.candidate.title} is ${result.records.candidate.goNoGoState}.`,
        [statusChip(result.records.candidate.status), chip(result.records.candidate.providerFamily), chip(result.records.candidate.sandboxOnly ? "sandbox-only" : "sandbox-missing")]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Provider Adapter Go/No-Go Blocked",
        error.message || "Provider adapter go/no-go action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireCalendarAdapterForm() {
  const form = byId("calendar-adapter-form");
  const confirmation = byId("calendar-adapter-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionCalendarAdapterPrototypeRecords(data, payload, {
        now: "2026-06-01T17:45:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Sandbox calendar adapter prototype changed locally; export a ledger snapshot before live calendar provider work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Sandbox Calendar Adapter Updated",
        `${result.records.prototype.title} is ${result.records.prototype.prototypeStatus}; live calendar API calls, OAuth, secrets, webhooks, provider writes, and invitations remain disabled.`,
        [statusChip(result.records.prototype.status), chip(result.records.prototype.payloadMode), chip(result.records.prototype.sandboxOnly ? "sandbox-only" : "sandbox-missing")]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Sandbox Calendar Adapter Blocked",
        error.message || "Sandbox calendar adapter action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireQuotePaymentForm() {
  const form = byId("quote-payment-form");
  const confirmation = byId("quote-payment-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = payload.action === "create"
        ? recordTools.createQuoteEstimateRecords(data, payload)
        : recordTools.transitionQuoteEstimateRecords(data, payload);
      data = result.data;
      persistData();
      renderAll();
      confirmation.innerHTML = record(
        payload.action === "create" ? "Quote Created" : "Quote Updated",
        `${result.records.quote.title} is ${result.records.quote.status}; ${result.records.quote.customerSafeStatus}`,
        [statusChip(result.records.quote.status), chip(result.records.quote.paymentStatus), chip(`${result.records.quote.amountJpy} JPY`)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Quote Action Blocked",
        error.message || "Quote/payment readiness action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireReminderControlForm() {
  const form = byId("reminder-control-form");
  const confirmation = byId("reminder-control-confirmation");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.reminderAt && payload.startAt) payload.reminderAt = payload.startAt;
    if (!payload.nextActionAt && payload.endAt) payload.nextActionAt = payload.endAt;
    if (!payload.nextCandidateAt && payload.startAt) payload.nextCandidateAt = payload.startAt;
    try {
      let result;
      if (payload.controlKind === "reminder") {
        result = payload.action === "create"
          ? recordTools.createReminderRuleRecords(data, payload)
          : recordTools.transitionReminderRuleRecords(data, payload);
      } else if (payload.controlKind === "recurrence") {
        result = payload.action === "create"
          ? recordTools.createRecurrenceCandidateRecords(data, payload)
          : recordTools.transitionRecurrenceCandidateRecords(data, payload);
      } else {
        result = payload.action === "create"
          ? recordTools.createAvailabilityWindowRecords(data, payload)
          : recordTools.transitionAvailabilityWindowRecords(data, payload);
      }
      data = result.data;
      persistData();
      renderAll();
      const recordResult = result.records.reminder || result.records.recurrence || result.records.availability;
      confirmation.innerHTML = record(
        "Schedule Control Updated",
        `${recordResult.title} is ${recordResult.status}.`,
        [statusChip(recordResult.status), chip(payload.controlKind || "schedule-control")]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Schedule Control Blocked",
        error.message || "Reminder, recurrence, or availability action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireAccessGatewayForm() {
  const form = byId("access-gateway-form");
  const confirmation = byId("access-gateway-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionAccessGatewayRecords(data, payload, {
        now: "2026-06-01T03:30:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Access gateway posture changed locally; export a ledger snapshot before external route placement."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Access Gateway Updated",
        `${result.records.gateway.label} is ${result.records.gateway.verificationStatus}.`,
        [statusChip(result.records.gateway.status), chip(result.records.gateway.publicExposure), chip(result.records.gateway.policy)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Access Gateway Blocked",
        error.message || "Access gateway action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireLibrarySyncForm() {
  const form = byId("library-sync-form");
  const confirmation = byId("library-sync-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionLibrarySyncHandoffRecords(data, payload, {
        now: "2026-06-01T03:35:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "LIBRARY sync handoff changed locally; export a fresh ledger before external persistence writeback."
      });
      renderAll();
      confirmation.innerHTML = record(
        "LIBRARY Sync Updated",
        `${result.records.handoff.title} is ${result.records.handoff.handoffStatus}.`,
        [statusChip(result.records.handoff.status), chip(result.records.handoff.syncMode), chip(result.records.handoff.recoveryState)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "LIBRARY Sync Blocked",
        error.message || "LIBRARY sync handoff action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function wireCalendarProviderForm() {
  const form = byId("calendar-provider-form");
  const confirmation = byId("calendar-provider-confirmation");
  if (!form || !confirmation) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = recordTools.transitionCalendarProviderHandoffRecords(data, payload, {
        now: "2026-06-01T14:15:00.000Z"
      });
      data = result.data;
      persistData({
        adapterState: "modified-local",
        recoveryNote: "Calendar provider handoff changed locally; export a ledger snapshot before live provider adapter work."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Calendar Provider Updated",
        `${result.records.handoff.title} is ${result.records.handoff.handoffStatus}.`,
        [statusChip(result.records.handoff.status), chip(result.records.handoff.targetProvider), chip(result.records.handoff.invitationPolicy)]
      );
      form.reset();
    } catch (error) {
      confirmation.innerHTML = record(
        "Calendar Provider Blocked",
        error.message || "Calendar provider handoff action could not be applied.",
        [chip("blocked", "blocked")]
      );
    }
  });
}

function downloadLedger(text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "epoch-operating-ledger.json";
  link.click();
  URL.revokeObjectURL(url);
}

function wireLedgerControls() {
  const exportButton = byId("export-ledger");
  const importButton = byId("import-ledger");
  const ledgerText = byId("ledger-json");
  const confirmation = byId("ledger-confirmation");

  exportButton.addEventListener("click", () => {
    const ledger = recordTools.createOperatingLedger(data);
    const text = JSON.stringify(ledger, null, 2);
    data = ledger.data;
    try {
      window.localStorage.setItem(storageKey, text);
    } catch {
      // Browser storage is optional in this static kickoff surface.
    }
    ledgerText.value = text;
    downloadLedger(text);
    renderAll();
    confirmation.innerHTML = record(
      "Ledger Exported",
      storageStatusText(),
      [chip("json"), chip("download"), chip(ledger.persistence.adapterState)]
    );
  });

  importButton.addEventListener("click", () => {
    try {
      const result = recordTools.importOperatingLedger(data, ledgerText.value);
      data = result.data;
      persistData({
        adapterState: "imported-recovery-snapshot",
        recoveryNote: "Imported ledger JSON and wrote a browser-local recovery snapshot."
      });
      renderAll();
      confirmation.innerHTML = record(
        "Ledger Imported",
        storageStatusText(),
        [chip("validated", "complete"), chip(`v${result.ledger.version}`), chip(result.ledger.persistence.adapterState)]
      );
    } catch (error) {
      confirmation.innerHTML = record(
        "Import Blocked",
        error.message || "The ledger JSON could not be imported.",
        [chip("invalid", "blocked")]
      );
    }
  });
}

function init() {
  renderAll();
  wireTabs();
  activateView(viewFromRoute(), { updateRoute: false });
  wireMonitorMenu();
  wireMonitorActionConsole();
  wirePublicActions();
  wireOpportunityForm();
  wireScheduleForm();
  wireScheduleLifecycleForm();
  wireIntakeForm();
  wireSubmissionForm();
  wireReviewReturn();
  wireAgentHandoffForm();
  wireNotificationOutboxForm();
  wireNotificationProviderForm();
  wirePaymentProviderForm();
  wireAuthSessionRoleForm();
  wireMarketingConversionForm();
  wireProviderAdapterForm();
  wireCalendarAdapterForm();
  wireQuotePaymentForm();
  wireReminderControlForm();
  wireAccessGatewayForm();
  wireLibrarySyncForm();
  wireCalendarProviderForm();
  wireLedgerControls();
}

init();
