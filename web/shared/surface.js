import { availabilityWindows, deadlineItems, epochSchedule, portalTimeline, revisedMonths } from "./epoch-data.js";

const renderStack = (targetId, items, renderItem) => {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items.map(renderItem).join("");
};

const chip = (value) => `<span class="state-chip">${value}</span>`;

renderStack("schedule-queue", epochSchedule, (item) => `
  <article class="item-card">
    <div>
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </div>
    <div class="item-meta">
      ${chip(item.status)}
      <span>${item.time}</span>
    </div>
  </article>
`);

renderStack("availability-list", availabilityWindows, (item) => `
  <article class="mini-row">
    <strong>${item.label}</strong>
    <span>${item.time}</span>
    <small>${item.capacity}</small>
  </article>
`);

renderStack("deadline-list", deadlineItems, (item) => `
  <article class="mini-row">
    <strong>${item.label}</strong>
    <span>${item.due}</span>
    <small>${item.state}</small>
  </article>
`);

renderStack("portal-availability", availabilityWindows, (item) => `
  <article class="mini-row">
    <strong>${item.label}</strong>
    <span>${item.time}</span>
    <small>${item.capacity}</small>
  </article>
`);

renderStack("portal-timeline", portalTimeline, (item) => `
  <article class="item-card">
    <div>
      <strong>${item.label}</strong>
      <p>${item.detail}</p>
    </div>
    ${chip(item.state)}
  </article>
`);

const board = document.getElementById("calendar-board");
if (board) {
  board.innerHTML = epochSchedule.map((item, index) => `
    <article class="calendar-event event-${index + 1}">
      <span>${item.time}</span>
      <strong>${item.title}</strong>
      <small>${item.status}</small>
    </article>
  `).join("");
}

const monthGrid = document.getElementById("revised-calendar");
if (monthGrid) {
  monthGrid.innerHTML = revisedMonths.map((month, index) => `
    <span>
      <strong>${String(index + 1).padStart(2, "0")}</strong>
      ${month}
    </span>
  `).join("");
}

const requestForm = document.getElementById("schedule-request-form");
if (requestForm) {
  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(requestForm);
    const requester = form.get("requester");
    const need = form.get("need");
    const confirmation = document.getElementById("request-confirmation");
    const timeline = document.getElementById("portal-timeline");
    const entry = {
      label: "New request queued",
      detail: `${requester} requested: ${need}.`,
      state: "queued"
    };
    portalTimeline.unshift(entry);
    if (confirmation) confirmation.textContent = "Schedule request added locally for EPOCH operator review.";
    if (timeline) {
      timeline.innerHTML = portalTimeline.map((item) => `
        <article class="item-card">
          <div>
            <strong>${item.label}</strong>
            <p>${item.detail}</p>
          </div>
          ${chip(item.state)}
        </article>
      `).join("");
    }
  });
}
