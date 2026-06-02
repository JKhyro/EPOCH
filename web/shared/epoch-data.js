export const epochSchedule = [
  {
    id: "EPOCH-SCH-001",
    title: "Submission review return window",
    owner: "EPOCH",
    status: "queued",
    time: "2026-06-03 19:00 JST",
    detail: "Schedule-bound return window requested by a WORKSHOP timing client."
  },
  {
    id: "EPOCH-SCH-002",
    title: "Calendar provider adapter review",
    owner: "EPOCH",
    status: "planned",
    time: "2026-06-04 10:30 JST",
    detail: "Internal provider-readiness check; no live provider write."
  },
  {
    id: "EPOCH-SCH-003",
    title: "Revised calendar contract pass",
    owner: "EPOCH",
    status: "in-progress",
    time: "2026-06-05 14:00 JST",
    detail: "Validate month mapping and schedule conversion rules."
  }
];

export const availabilityWindows = [
  { label: "Evening review block", time: "Mon-Wed 19:00-21:00 JST", capacity: "2 holds" },
  { label: "Admin scheduling block", time: "Fri 09:00-11:00 JST", capacity: "4 requests" },
  { label: "Async deadline pass", time: "Sun 16:00-18:00 JST", capacity: "3 checks" }
];

export const deadlineItems = [
  { label: "Customer schedule confirmation", due: "2026-06-03 12:00 JST", state: "waiting" },
  { label: "Reminder recurrence review", due: "2026-06-05 17:00 JST", state: "planned" },
  { label: "Calendar export handoff", due: "2026-06-07 09:00 JST", state: "blocked on adapter selection" }
];

export const revisedMonths = [
  "Aster", "Beryl", "Crown", "Dawn", "Ember", "Frost", "Grove",
  "Harbor", "Ivory", "Juniper", "Keystone", "Lumen", "Meridian"
];

export const portalTimeline = [
  { label: "Request received", detail: "Timing request is accepted into EPOCH scheduling.", state: "complete" },
  { label: "Availability check", detail: "Operator reviews matching windows.", state: "in-progress" },
  { label: "Confirmation pending", detail: "Customer-safe confirmation will be sent after approval.", state: "queued" }
];
