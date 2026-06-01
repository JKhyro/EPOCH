const data = window.EPOCH_SEED_DATA;

const attentionStatuses = new Set(["submitted", "reviewing", "overdue", "blocked"]);
const today = "2026-06-01";

function byId(id) {
  return document.getElementById(id);
}

function formatTime(value) {
  if (!value) return "No time set";
  return value.replace("T", " ").replace("+09:00", " JST");
}

function statusChip(status) {
  return `<span class="chip ${status}">${status}</span>`;
}

function record(title, body, chips) {
  return `
    <article class="record">
      <h3>${title}</h3>
      <p>${body}</p>
      <div class="meta">${chips.join("")}</div>
    </article>
  `;
}

function allOperatingItems() {
  return [
    ...data.leads.map((item) => ({ ...item, kind: "lead", time: item.nextActionAt })),
    ...data.sessions.map((item) => ({ ...item, kind: "session", time: item.startAt })),
    ...data.assignments.map((item) => ({ ...item, kind: "assignment", time: item.dueAt })),
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
    .filter((item) => attentionStatuses.has(item.status) || item.kind === "session" || item.kind === "follow-up")
    .slice(0, 8);

  byId("admin-actions").innerHTML = adminItems.map((item) => {
    const title = item.title || item.name || item.id;
    const body = `${item.kind} | next: ${formatTime(item.time)}`;
    return record(title, body, [statusChip(item.status), `<span class="chip">${item.kind}</span>`]);
  }).join("");
}

function renderStudentStatus() {
  byId("student-status").innerHTML = data.customers.map((customer) => {
    const track = data.tracks.find((item) => item.id === customer.trackId);
    return record(
      customer.displayName,
      customer.externalStatus,
      [
        `<span class="chip">${track ? track.name : "track pending"}</span>`,
        `<span class="chip">${customer.ageBand}</span>`
      ]
    );
  }).join("");
}

function renderMonitor(items) {
  const receiptCount = data.receipts.length;
  const attentionCount = items.filter((item) => attentionStatuses.has(item.status)).length;
  const visibleCount = data.assignments.filter((item) => item.externalVisible).length;

  byId("monitor-items").innerHTML = [
    record("Queue Attention", `${attentionCount} records need attention now.`, [`<span class="chip reviewing">${attentionCount} active</span>`]),
    record("External Visibility", `${visibleCount} student/customer-visible records are available.`, [`<span class="chip">${visibleCount} visible</span>`]),
    record("Delivery Receipts", `${receiptCount} completed delivery receipt is monitor-visible.`, [`<span class="chip complete">${receiptCount} receipt</span>`])
  ].join("");
}

function wireTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      byId(`view-${tab.dataset.view}`).classList.add("active");
    });
  });
}

function init() {
  const items = allOperatingItems();
  renderMetrics(items);
  renderAdmin(items);
  renderStudentStatus();
  renderMonitor(items);
  wireTabs();
}

init();
