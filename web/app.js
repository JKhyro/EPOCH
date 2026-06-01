const seedData = window.EPOCH_SEED_DATA;
const recordTools = window.EPOCH_OPERATING_RECORDS;
const storageKey = "epoch-commercial-operating-data";
const attentionStatuses = new Set(["proposed", "draft", "presented", "queued", "approved", "dispatched", "acknowledged", "in-progress", "failed", "retry-ready", "payment-ready", "payment-blocked", "submitted", "reviewing", "overdue", "blocked"]);
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
  return `Ledger v${recordTools.ledgerVersion} | ${data.customers.length} customers | ${data.engagements.length} engagements | ${data.campaignRoutes.length} campaigns | ${data.notificationEvents.length} updates | ${data.receipts.length} receipts | r${persistence.revision} ${persistence.adapterState} | ${persistence.ledgerId}`;
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
    ...(data.workPlans || []).map((item) => ({ ...item, kind: "agent work plan", time: item.dueAt })),
    ...(data.agentHandoffs || []).map((item) => ({ ...item, kind: "agent handoff", time: item.nextActionAt })),
    ...(data.notificationEvents || []).map((item) => ({ ...item, kind: "update", time: item.deliverAfterAt || item.createdAt })),
    ...(data.notificationDeliveries || []).map((item) => ({ ...item, kind: "notification delivery", time: item.nextActionAt || item.createdAt })),
    ...(data.quotes || []).map((item) => ({ ...item, kind: "quote", time: item.nextActionAt || item.validUntil || item.createdAt })),
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
  const quotes = report.quotes || recordTools.summarizeQuoteState(data);
  const handoffs = report.handoffs || recordTools.summarizeAgentHandoffState(data);
  const marketing = report.marketing || recordTools.summarizeMarketingState(data);
  const routePlacement = report.routePlacement || recordTools.summarizeRoutePlacementState(data, { now: `${today}T12:00:00+09:00` });
  const calendarExport = recordTools.createCalendarExport(data, { now: `${today}T12:00:00+09:00` });
  const calendar = report.calendar || recordTools.summarizeCalendarExport(calendarExport);
  const persistence = report.persistence || recordTools.summarizePersistenceState(data, { now: `${today}T12:00:00+09:00` });
  lastMonitorReport = report;
  byId("monitor-route-status").textContent = `${routeForView("monitor")} | ${report.summary.queue} queued | ${report.summary.risks} risks | ${routePlacement.summary.routeCount} SYNAPSE routes | ${marketing.ready} campaign routes ready | ${persistence.adapterState}`;
  renderMonitorActionConsole(report);

  const summaryCards = [
    record("Monitor Summary", `${report.summary.queue} queued, ${report.summary.timeline} timeline records, ${report.summary.risks} risks.`, [chip(report.summary.health, report.summary.health === "Ready" ? "complete" : "blocked")]),
    record("Queue Attention", `${attentionCount} records need attention now.`, [chip(`${attentionCount} active`, "reviewing")]),
    record("Dirty Local State", report.summary.dirtyLocalState ? `Persistence is ${persistence.adapterState}; export is still required for a durable recovery point.` : "The current ledger is already in a snapshot-ready state.", [toneChip(report.summary.dirtyLocalState ? "dirty" : "clean", report.summary.dirtyLocalState ? "blocked" : "complete")]),
    record("Awaiting Review", `${report.summary.awaitingReview} submission/review record${report.summary.awaitingReview === 1 ? "" : "s"} still need operator return or blocker state.`, [toneChip(`${report.summary.awaitingReview} queued`, report.summary.awaitingReview ? "overdue" : "complete")]),
    record("Scope Health", `${report.scope.allowedCount} allowed surfaces, ${report.scope.blockedCount} blocked surfaces, ${report.summary.scopeWarnings} warning${report.summary.scopeWarnings === 1 ? "" : "s"}.`, [toneChip(report.scope.status, report.scope.status === "ready" ? "complete" : "overdue"), chip(report.scope.owner || "owner pending")]),
    record("Memory Health", `${report.memory.total} monitor note${report.memory.total === 1 ? "" : "s"} with ${report.memory.staleCount} stale and ${report.memory.watchCount} due soon.`, [toneChip(report.memory.status, report.memory.staleCount ? "blocked" : report.memory.watchCount ? "overdue" : "complete"), chip(report.memory.latestUpdate ? formatTime(report.memory.latestUpdate) : "no update")]),
    record("Safe Access", `${report.access.mode}, raw monitor ${report.access.rawMonitor}, raw admin ${report.access.rawAdmin}.`, [toneChip(`${report.summary.safeAccessViolations} warnings`, report.summary.safeAccessViolations ? "blocked" : "complete"), chip(report.access.defaultPublicPolicy)]),
    record("Operator Actions", `${report.operatorActions.length} local action${report.operatorActions.length === 1 ? "" : "s"} are queued in the monitor controls.`, [toneChip(`${report.operatorActions.length} queued`, report.operatorActions.length ? "overdue" : "complete")]),
    record("External Visibility", `${visibleCount} student/customer-visible records are available.`, [chip(`${visibleCount} visible`)]),
    record("Deadline Control", `${deadlines.today} today, ${deadlines.upcoming} upcoming, ${deadlines.overdue} overdue.`, [chip(`${deadlines.owned} owner-linked`, "planned")]),
    record("Opportunity Pipeline", `${revenue.pipelineCount} open opportunities with ${formatJpy(revenue.pipelineValueJpy)} estimated value.`, [chip(`${revenue.waitingCount} waiting`, "waiting"), chip(`${revenue.deferredCount} deferred`)]),
    record("Engagement Revenue", `${revenue.activeEngagements} active engagements with ${formatJpy(revenue.acceptedValueJpy)} accepted value.`, [chip(`${revenue.acceptedCount} accepted`, "complete"), chip(`${revenue.under19CompatibilityCount} compatibility gates`)]),
    record("Curriculum Readiness", `${curriculum.frameworks} frameworks, ${curriculum.activeGameplans} active/planned gameplans, ${curriculum.eikenLevelCount} EIKEN levels represented.`, [chip(`${curriculum.submissionFirstGameplans} submission-first`), chip(`${curriculum.under19GuardedGameplans} guarded`)]),
    record("Update Events", `${notifications.visible} visible updates, ${notifications.pending} pending, ${notifications.blocked} blocked.`, [chip(`${notifications.posted} posted`, "complete"), chip(`${notifications.total} total`)]),
    record("Notification Outbox", `${notifications.outbox} delivery handoff records, ${notifications.queued} queued, ${notifications.sent} sent, ${notifications.failed} failed.`, [chip(`${notifications.retryReady} retry-ready`), chip(`${notifications.missingOutbox} missing outbox`, notifications.missingOutbox ? "blocked" : "complete")]),
    record("Quote Readiness", `${quotes.total} quote records worth ${formatJpy(quotes.valueJpy)} with ${quotes.paymentReady} payment-ready and ${quotes.paymentBlocked} blocked.`, [chip(`${quotes.under19Blocked} under-19 gated`, quotes.under19Blocked ? "blocked" : "complete"), chip(`${quotes.paidRecorded} paid-recorded`)]),
    record("Agent Handoffs", `${handoffs.handoffs} handoffs, ${handoffs.workPlans} work plans, ${handoffs.pendingApprovals} pending approval, ${handoffs.dispatched} dispatched, ${handoffs.acknowledged} acknowledged, ${handoffs.complete} complete.`, [chip(`${handoffs.monitorVisible} monitor-visible`), chip(`${handoffs.customerVisibleBlocked} customer-visible`)]),
    record("Campaign Readiness", `${marketing.ready} of ${marketing.total} campaign routes ready across ${marketing.channelCount} channel groups.`, [chip(`${marketing.jp} JP`), chip(`${marketing.global} global`), chip(`${marketing.copyViolations} copy risks`, marketing.copyViolations ? "blocked" : "complete")]),
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

  const quoteCards = (data.quotes || []).length
    ? data.quotes.slice(0, 8).map((item) => record(
      item.title,
      `${formatJpy(item.amountJpy)} | ${item.customerSafeStatus || item.summary}`,
      [statusChip(item.status), chip(item.paymentStatus), chip(item.guardianConsentRequired ? "guardian-consent-required" : "payment-gate-clear")]
    ))
    : [record("Quote Readiness", "No quote or estimate records have been created yet.", [chip("empty")])];

  const routeCards = routePlacement.routes.map((route) => record(
    route.label,
    `${route.surface} | ${route.href} | ${route.summary}`,
    [statusChip(route.status), chip(route.visibility), chip(route.placement === "link" ? "link-only" : route.placement)]
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
    monitorSection("Agent Handoffs", handoffCards, "monitor-handoffs"),
    monitorSection("Notification Outbox", outboxCards, "monitor-notification-outbox"),
    monitorSection("Quote Readiness", quoteCards, "monitor-quotes"),
    monitorSection("SYNAPSE Placement", routeCards, "monitor-suite"),
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
  renderQuoteOptions();
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
  wireQuotePaymentForm();
  wireLedgerControls();
}

init();
