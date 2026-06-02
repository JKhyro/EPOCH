import fs from "node:fs";

function fail(message) {
  console.error(`verification failed: ${message}`);
  process.exit(1);
}

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

const root = read("../web/index.html");
const app = read("../web/app/index.html");
const portal = read("../web/webportal/index.html");
const data = read("../web/shared/epoch-data.js");
const script = read("../web/shared/surface.js");
const styles = read("../web/shared/styles.css");
const boundary = read("../docs/product-boundary.md");
const runtime = read("../docs/runtime-and-packaging.md");
const monitor = read("../docs/monitor-parity-health-controls.md");
const header = read("../native/epoch_core.h");
const source = read("../native/epoch_core.c");

for (const phrase of ["EPOCH App", "EPOCH Webportal", "EPOCH MONITOR"]) {
  if (!root.includes(phrase)) fail(`root missing surface phrase ${phrase}`);
}

if (!app.includes("EPOCH App")) fail("app missing EPOCH App identity");
if (!portal.includes("EPOCH Webportal")) fail("portal missing EPOCH Webportal identity");
if (!app.includes("epoch-monitor.html") || !portal.includes("epoch-monitor.html")) fail("app/webportal missing MONITOR route link");

for (const phrase of [
  "Calendar, Scheduling, And Time Operations",
  "Native C Core",
  "revised 13-month calendar",
  "WORKSHOP Uses EPOCH Time"
]) {
  if (!root.includes(phrase)) fail(`root directory missing ${phrase}`);
}

for (const phrase of [
  "Schedule Command",
  "Calendar Board",
  "Open Windows",
  "Schedule-Bound Work",
  "Revised Calendar Preview",
  "Native C Core"
]) {
  if (!app.includes(phrase)) fail(`EPOCH app missing ${phrase}`);
}

for (const phrase of [
  "Schedule Request And Status Portal",
  "Ask For A Time",
  "Customer-Safe Timeline",
  "Next Open Windows",
  "Does not expose raw admin or MONITOR controls"
]) {
  if (!portal.includes(phrase)) fail(`EPOCH webportal missing ${phrase}`);
}

for (const path of [
  "./app/index.html",
  "./webportal/index.html",
  "http://127.0.0.1:8765/epoch-monitor.html"
]) {
  if (!root.includes(path)) fail(`root directory missing route ${path}`);
}

for (const phrase of ["epochSchedule", "availabilityWindows", "deadlineItems", "revisedMonths", "portalTimeline"]) {
  if (!data.includes(phrase)) fail(`EPOCH data missing ${phrase}`);
  if (!script.includes(phrase)) fail(`EPOCH renderer missing ${phrase}`);
}

for (const status of [
  "EPOCH_STATUS_PLANNED",
  "EPOCH_STATUS_AVAILABLE",
  "EPOCH_STATUS_QUEUED",
  "EPOCH_STATUS_IN_PROGRESS",
  "EPOCH_STATUS_OVERDUE",
  "EPOCH_STATUS_COMPLETE"
]) {
  if (!header.includes(status)) fail(`native header missing ${status}`);
}

for (const label of ["planned", "available", "queued", "in-progress", "overdue", "complete"]) {
  if (!source.includes(`"${label}"`)) fail(`native source missing label ${label}`);
}

for (const phrase of [
  "EPOCH is the calendar, scheduling",
  "WORKSHOP owns revenue streams",
  "Native C is the default implementation language",
  "Avalonia is the desktop application shell",
  "Compatibility aliases may redirect"
]) {
  const combined = `${boundary}\n${runtime}\n${monitor}`;
  if (!combined.includes(phrase)) fail(`docs missing ${phrase}`);
}

for (const forbidden of [
  "Package Gameplans",
  "Marketing Conversion",
  "Payment Provider",
  "Sandbox Payment",
  "EIKEN",
  "Premium English",
  "Campaign Routes",
  "Quote Payment",
  "Consulting Pipeline",
  "CRM"
]) {
  const combinedWeb = `${root}\n${app}\n${portal}\n${data}\n${script}`;
  if (combinedWeb.includes(forbidden)) fail(`EPOCH web surface still contains WORKSHOP-only phrase ${forbidden}`);
}

for (const selector of [".directory-layout", ".workspace-grid", ".portal-grid", ".calendar-board", ".month-grid"]) {
  if (!styles.includes(selector)) fail(`styles missing ${selector}`);
}

console.log("EPOCH surface boundary verification passed");
