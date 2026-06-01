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
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function persistData() {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
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

function allOperatingItems() {
  return [
    ...data.leads.map((item) => ({ ...item, kind: "lead", time: item.nextActionAt })),
    ...data.sessions.map((item) => ({ ...item, kind: "session", time: item.startAt })),
    ...data.assignments.map((item) => ({ ...item, kind: "request", time: item.dueAt })),
    ...data.submissions.map((item) => ({ ...item, kind: "submission", time: item.reviewDueAt })),
    ...data.reviews.map((item) => ({ ...item, kind: "review", time: item.returnedAt })),
    ...data.followups.map((item) => ({ ...item, kind: "follow-up", time: item.nextActionAt }))
  ];
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
    .filter((item) => attentionStatuses.has(item.status) || item.kind === "session" || item.kind === "follow-up" || item.kind === "lead")
    .slice(0, 10);

  byId("admin-actions").innerHTML = adminItems.map((item) => {
    const title = item.title || item.name || item.id;
    const body = item.summary
      ? `${item.kind} | ${item.summary}`
      : `${item.kind} | next: ${formatTime(item.time)}`;
    return record(title, body, [statusChip(item.status), chip(item.kind)]);
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

function renderMonitor(items) {
  const receiptCount = data.receipts.length;
  const attentionCount = items.filter((item) => attentionStatuses.has(item.status)).length;
  const visibleCount = data.assignments.filter((item) => item.externalVisible).length;
  const intakeCount = data.leads.filter((item) => item.id.startsWith("lead-intake")).length;
  const reviewingCount = data.submissions.filter((item) => item.status === "reviewing" || item.status === "submitted").length;

  byId("monitor-items").innerHTML = [
    record("Queue Attention", `${attentionCount} records need attention now.`, [chip(`${attentionCount} active`, "reviewing")]),
    record("External Visibility", `${visibleCount} student/customer-visible records are available.`, [chip(`${visibleCount} visible`)]),
    record("Delivery Receipts", `${receiptCount} completed delivery receipts are monitor-visible.`, [chip(`${receiptCount} receipts`, "complete")]),
    record("Live Intake Flow", `${intakeCount} public intake records have entered operations.`, [chip(`${intakeCount} captured`, "waiting")]),
    record("Review Return Queue", `${reviewingCount} submissions are waiting for returned feedback.`, [chip(`${reviewingCount} reviews`, "submitted")])
  ].join("");
}

function renderIntakeSnapshot() {
  const requests = data.assignments
    .filter((item) => item.externalVisible)
    .slice(0, 4);

  byId("intake-feed").innerHTML = requests.map((item) => {
    return record(
      item.title,
      item.summary || `Visible request due ${formatTime(item.dueAt)}`,
      [statusChip(item.status), chip("external")]
    );
  }).join("");
}

function renderAll() {
  const items = allOperatingItems();
  renderMetrics(items);
  renderAdmin(items);
  renderStudentStatus();
  renderSubmissionOptions();
  renderSubmissions();
  renderMonitor(items);
  renderIntakeSnapshot();
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

function init() {
  renderAll();
  wireTabs();
  wireIntakeForm();
  wireSubmissionForm();
  wireReviewReturn();
}

init();
