const seedData = window.EPOCH_SEED_DATA;
const recordTools = window.EPOCH_OPERATING_RECORDS;
const storageKey = "epoch-commercial-operating-data";
const attentionStatuses = new Set(["submitted", "reviewing", "overdue", "blocked"]);
const today = "2026-06-01";

let data = loadData();

function byId(id) {
  return document.getElementById(id);
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

function persistData() {
  try {
    const ledger = recordTools.createOperatingLedger(data);
    window.localStorage.setItem(storageKey, JSON.stringify(ledger));
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
  const ledger = recordTools.createOperatingLedger(data);
  return `Ledger v${ledger.version} | ${ledger.counts.customers} customers | ${ledger.counts.assignments} requests | ${ledger.counts.receipts} receipts`;
}

function formatTime(value) {
  if (!value) return "No time set";
  return value.replace("T", " ").replace("+09:00", " JST");
}

function statusChip(status) {
  return chip(status, status);
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

function formatJpy(value) {
  return `JPY ${Number(value || 0).toLocaleString("en-US")}`;
}

function allOperatingItems() {
  return [
    ...data.leads.map((item) => ({ ...item, kind: "lead", time: item.nextActionAt })),
    ...data.opportunities.map((item) => ({ ...item, title: packageName(item.packageId), kind: "opportunity", time: item.nextActionAt })),
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
    return record(
      offerPackage.name,
      `${offerPackage.audience} | ${offerPackage.deliveryModel}`,
      [
        chip(formatJpy(offerPackage.priceJpy)),
        chip(offerPackage.routing),
        chip(offerPackage.status)
      ]
    );
  }).join("");
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
    .filter((item) => attentionStatuses.has(item.status) || item.kind === "session" || item.kind === "follow-up" || item.kind === "lead" || item.kind === "opportunity")
    .slice(0, 10);

  byId("admin-actions").innerHTML = adminItems.map((item) => {
    const title = item.title || item.name || item.id;
    const body = item.summary
      ? `${item.kind} | ${item.summary}`
      : `${item.kind} | next: ${formatTime(item.time)}`;
    return record(title, body, [statusChip(item.status), chip(item.kind)]);
  }).join("");
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

function renderScheduleFeed() {
  byId("schedule-feed").innerHTML = data.sessions.slice(0, 6).map((session) => {
    const body = `${formatTime(session.startAt)} to ${formatTime(session.endAt)}`;
    return record(session.title, body, [
      statusChip(session.status),
      chip(session.owner || "owner pending")
    ]);
  }).join("");
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

function monitorSection(title, cards) {
  return `
    <section class="monitor-section">
      <div class="monitor-section-heading">
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="monitor-grid">${cards.join("")}</div>
    </section>
  `;
}

function renderMonitor(items) {
  const receiptCount = data.receipts.length;
  const attentionCount = items.filter((item) => attentionStatuses.has(item.status)).length;
  const visibleCount = data.assignments.filter((item) => item.externalVisible).length;
  const intakeCount = data.leads.filter((item) => item.id.startsWith("lead-intake")).length;
  const reviewingCount = data.submissions.filter((item) => item.status === "reviewing" || item.status === "submitted").length;
  const opportunityValue = data.opportunities.reduce((total, item) => total + Number(item.estimatedValueJpy || 0), 0);
  const deadlines = recordTools.summarizeDeadlines(data, { now: `${today}T12:00:00+09:00` });
  const report = recordTools.buildMonitorReport(data, { now: `${today}T12:00:00+09:00` });

  const summaryCards = [
    record("Monitor Summary", `${report.summary.queue} queued, ${report.summary.timeline} timeline records, ${report.summary.risks} risks.`, [chip(report.summary.health, report.summary.health === "Ready" ? "complete" : "blocked")]),
    record("Queue Attention", `${attentionCount} records need attention now.`, [chip(`${attentionCount} active`, "reviewing")]),
    record("External Visibility", `${visibleCount} student/customer-visible records are available.`, [chip(`${visibleCount} visible`)]),
    record("Deadline Control", `${deadlines.today} today, ${deadlines.upcoming} upcoming, ${deadlines.overdue} overdue.`, [chip(`${deadlines.owned} owner-linked`, "planned")]),
    record("Opportunity Pipeline", `${data.opportunities.length} opportunities with ${formatJpy(opportunityValue)} estimated value.`, [chip("pipeline", "waiting")])
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

  const riskCards = report.risks.length
    ? report.risks.map((item) => record(item.title, item.detail, [chip(item.severity, item.severity === "high" ? "blocked" : "overdue")]))
    : [record("Risks", "No active risk records in the current operating surface.", [chip("clear", "complete")])];

  const receiptCards = report.receipts.map((item) => record(
    item.kind,
    item.note || `Receipt created ${formatTime(item.createdAt)}`,
    [statusChip(item.status), chip(formatTime(item.createdAt))]
  ));

  byId("monitor-items").innerHTML = [
    monitorSection("Summary", summaryCards),
    monitorSection("Queue", queueCards),
    monitorSection("Timeline", timelineCards),
    monitorSection("Risks", riskCards),
    monitorSection("Receipts", receiptCards.length ? receiptCards : [record("Receipts", "No receipts have been created yet.", [chip("empty")])])
  ].join("");
}

function renderLedgerStatus() {
  byId("storage-status").textContent = storageStatusText();
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
  renderScheduleOptions();
  renderScheduleFeed();
  renderAdmin(items);
  renderStudentStatus();
  renderSubmissionOptions();
  renderSubmissions();
  renderMonitor(items);
  renderIntakeSnapshot();
  renderLedgerStatus();
}

function activateView(viewName) {
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((item) => {
    item.classList.toggle("active", item.id === `view-${viewName}`);
  });
}

function wireTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activateView(tab.dataset.view));
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
    ledgerText.value = text;
    downloadLedger(text);
    confirmation.innerHTML = record(
      "Ledger Exported",
      storageStatusText(),
      [chip("json"), chip("download")]
    );
  });

  importButton.addEventListener("click", () => {
    try {
      const result = recordTools.importOperatingLedger(data, ledgerText.value);
      data = result.data;
      persistData();
      renderAll();
      confirmation.innerHTML = record(
        "Ledger Imported",
        storageStatusText(),
        [chip("validated", "complete"), chip(`v${result.ledger.version}`)]
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
  wireScheduleForm();
  wireIntakeForm();
  wireSubmissionForm();
  wireReviewReturn();
  wireLedgerControls();
}

init();
