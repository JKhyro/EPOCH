#include "epoch_core.h"

#include <assert.h>
#include <string.h>

int main(void) {
    EpochOperatingStatus status = EPOCH_STATUS_PLANNED;
    EpochOperatingEntry overdue = {
        "op-001",
        EPOCH_TYPE_REVIEW_DEADLINE,
        "submission-001",
        "provider",
        EPOCH_STATUS_OVERDUE,
        0,
        "2026-06-01T09:00:00+09:00",
        "2026-06-01T12:00:00+09:00",
    };
    EpochScheduleRequest request = {
        "req-001",
        "schedule client",
        "2026-06-04T18:00:00+09:00/2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        "Request received; availability is being checked.",
        EPOCH_STATUS_QUEUED,
        1,
        1,
        0,
    };
    EpochScheduleEntry schedule_entry = {
        "sch-001",
        "Gregorian schedule review",
        "local-only schedule entry",
        "2026-06-04T18:00:00+09:00",
        "2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        EPOCH_STATUS_QUEUED,
    };
    EpochAvailabilityWindow window = {
        "win-001",
        "Evening review block",
        "2026-06-04T18:00:00+09:00",
        "2026-06-04T21:00:00+09:00",
        "Asia/Tokyo",
        3,
        1,
        EPOCH_STATUS_AVAILABLE,
    };
    EpochReminderRule reminder = {
        "rem-001",
        "EPOCH-SCH-001",
        "FREQ=DAILY;COUNT=2",
        "Reminder preview only.",
        EPOCH_STATUS_PLANNED,
        1,
        0,
    };
    EpochRecurrenceRule recurrence = {
        "rec-001",
        "EPOCH-SCH-001",
        "FREQ=WEEKLY;COUNT=2",
        EPOCH_CALENDAR_GREGORIAN,
        EPOCH_STATUS_PLANNED,
        1,
        0,
        0,
    };
    EpochDeadlineRule deadline = {
        "due-001",
        "EPOCH-SCH-001",
        "2026-06-05T17:00:00+09:00",
        "Asia/Tokyo",
        "Deadline is on track.",
        EPOCH_DEADLINE_ON_TRACK,
        EPOCH_STATUS_PLANNED,
        1,
    };
    EpochRevisedCalendarRulepack draft_rulepack = {
        "rulepack-draft",
        "owner-approved-rulepack-required",
        13,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    };
    EpochRevisedCalendarRulepack approved_rulepack = {
        "rulepack-approved",
        "owner-approved-rulepack-v1",
        13,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
    };
    EpochCalendarProviderReadinessGate gate = {
        "gate-001",
        EPOCH_PROVIDER_CALENDAR,
        EPOCH_STATUS_REVIEWING,
        1,
        1,
        1,
        1,
        1,
        0,
        "",
    };

    assert(strcmp(epoch_status_label(EPOCH_STATUS_SUBMITTED), "submitted") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_PROPOSED), "proposed") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_AVAILABLE), "available") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_RETRY_READY), "retry-ready") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_PAYMENT_BLOCKED), "payment-blocked") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_ACKNOWLEDGED), "acknowledged") == 0);
    assert(epoch_status_from_label("reviewing", &status) == 1);
    assert(status == EPOCH_STATUS_REVIEWING);
    assert(epoch_status_from_label("in-progress", &status) == 1);
    assert(status == EPOCH_STATUS_IN_PROGRESS);
    assert(epoch_status_from_label("queued", &status) == 1);
    assert(status == EPOCH_STATUS_QUEUED);
    assert(epoch_status_from_label("snoozed", &status) == 1);
    assert(status == EPOCH_STATUS_SNOOZED);
    assert(epoch_status_from_label("paid-recorded", &status) == 1);
    assert(status == EPOCH_STATUS_PAID_RECORDED);
    assert(epoch_status_is_terminal(EPOCH_STATUS_RETURNED) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_SENT) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_PAID_RECORDED) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_REJECTED) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_REVIEWING) == 0);
    assert(epoch_operating_entry_needs_attention(&overdue) == 1);
    assert(strcmp(epoch_provider_kind_label(EPOCH_PROVIDER_CALENDAR), "calendar") == 0);
    assert(strcmp(epoch_provider_kind_label(EPOCH_PROVIDER_STATUS), "status") == 0);
    assert(strcmp(epoch_calendar_system_label(EPOCH_CALENDAR_REVISED_13_MONTH), "revised-13-month") == 0);
    assert(strcmp(epoch_deadline_health_label(EPOCH_DEADLINE_AT_RISK), "at-risk") == 0);
    assert(epoch_schedule_entry_is_valid(&schedule_entry) == 1);
    assert(epoch_schedule_request_is_customer_safe(&request) == 1);
    assert(epoch_availability_window_has_capacity(&window) == 1);
    assert(epoch_reminder_rule_is_sandbox_safe(&reminder) == 1);
    assert(epoch_recurrence_rule_is_sandbox_safe(&recurrence) == 1);
    assert(epoch_deadline_rule_is_customer_safe(&deadline) == 1);
    assert(epoch_revised_calendar_rulepack_has_required_approvals(&draft_rulepack) == 0);
    assert(epoch_revised_calendar_rulepack_conversion_ready(&draft_rulepack) == 0);
    assert(epoch_revised_calendar_rulepack_blocks_conversion(&draft_rulepack) == 1);
    assert(epoch_revised_calendar_rulepack_has_required_approvals(&approved_rulepack) == 1);
    assert(epoch_revised_calendar_rulepack_conversion_ready(&approved_rulepack) == 1);
    assert(epoch_revised_calendar_rulepack_blocks_conversion(&approved_rulepack) == 0);
    approved_rulepack.conversion_logic_enabled = 0;
    assert(epoch_revised_calendar_rulepack_conversion_ready(&approved_rulepack) == 0);
    assert(epoch_calendar_provider_gate_ready_for_live_toggle(&gate) == 1);
    assert(epoch_calendar_provider_gate_blocks_live_calls(&gate) == 1);
    gate.live_provider_calls_enabled = 1;
    assert(epoch_calendar_provider_gate_ready_for_live_toggle(&gate) == 0);
    assert(epoch_calendar_provider_gate_blocks_live_calls(&gate) == 0);

    return 0;
}
