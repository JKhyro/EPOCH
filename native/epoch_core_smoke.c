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
    EpochTimingHandoff timing_handoff = {
        "time-handoff-001",
        "WORKSHOP",
        "workshop-handoff-001",
        "req-001",
        "2026-06-04T18:00:00+09:00/2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        "Timing handoff accepted into EPOCH; availability is being resolved locally.",
        EPOCH_STATUS_ACCEPTED,
        1,
        0,
    };
    EpochAvailabilityConflictDecision clear_decision = {
        "conflict-001",
        "time-handoff-001",
        "req-001",
        "win-001",
        "capacity-clear",
        "Availability is clear for a local booking hold.",
        EPOCH_STATUS_CLEAR,
        1,
        1,
        0,
    };
    EpochAvailabilityConflictDecision conflict_decision = {
        "conflict-002",
        "time-handoff-002",
        "req-002",
        "",
        "capacity-full",
        "Requested timing is not available; a new window is needed.",
        EPOCH_STATUS_NEEDS_RESCHEDULE,
        1,
        1,
        0,
    };
    EpochScheduleRequestAcceptance acceptance = {
        "accept-001",
        "req-001",
        "win-001",
        "Schedule request accepted; a local availability hold is being prepared.",
        EPOCH_STATUS_ACCEPTED,
        1,
        1,
        0,
    };
    EpochAvailabilityHold hold = {
        "hold-001",
        "accept-001",
        "req-001",
        "win-001",
        "2026-06-04T18:00:00+09:00",
        "2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        EPOCH_STATUS_HELD,
        1,
        0,
    };
    EpochBookingConfirmation booking = {
        "book-001",
        "accept-001",
        "hold-001",
        "sch-001",
        "req-001",
        "2026-06-04T18:00:00+09:00/2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        "Schedule confirmed locally for 2026-06-04T18:00:00+09:00.",
        EPOCH_STATUS_CONFIRMED,
        1,
        0,
    };
    EpochScheduleStatusEvent status_event = {
        "status-001",
        "book-001",
        "req-001",
        "confirmed",
        "Schedule confirmed locally; external calendar connection remains inactive.",
        EPOCH_STATUS_CONFIRMED,
        1,
    };
    EpochBookingReceipt booking_receipt = {
        "book-receipt-001",
        "book-001",
        "status-001",
        "Request acceptance, hold, confirmation, and customer-safe status event are recorded locally.",
        EPOCH_STATUS_COMPLETE,
        1,
        0,
    };
    EpochTimingReturnPayload timing_return_payload = {
        "time-return-001",
        "time-handoff-001",
        "conflict-001",
        "book-001",
        "req-001",
        "booking-confirmed",
        "Confirmed timing returned locally to the requesting workflow.",
        EPOCH_STATUS_RETURNED,
        1,
        0,
    };
    EpochTimingReturnPayload conflict_return_payload = {
        "time-return-002",
        "time-handoff-002",
        "conflict-002",
        "",
        "req-002",
        "availability-conflict",
        "No local availability is open for the requested timing; ask for a new window.",
        EPOCH_STATUS_NEEDS_RESCHEDULE,
        1,
        0,
    };
    EpochTimingReturnReceipt timing_return_receipt = {
        "time-return-receipt-001",
        "time-return-001",
        "conflict-001",
        "EPOCH returned a confirmed local booking payload without live provider calls.",
        EPOCH_STATUS_COMPLETE,
        1,
        0,
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
    assert(strcmp(epoch_status_label(EPOCH_STATUS_CLEAR), "clear") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_ACCEPTED), "accepted") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_HELD), "held") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_CONFIRMED), "confirmed") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_NEEDS_RESCHEDULE), "needs-reschedule") == 0);
    assert(epoch_status_from_label("reviewing", &status) == 1);
    assert(status == EPOCH_STATUS_REVIEWING);
    assert(epoch_status_from_label("in-progress", &status) == 1);
    assert(status == EPOCH_STATUS_IN_PROGRESS);
    assert(epoch_status_from_label("queued", &status) == 1);
    assert(status == EPOCH_STATUS_QUEUED);
    assert(epoch_status_from_label("confirmed", &status) == 1);
    assert(status == EPOCH_STATUS_CONFIRMED);
    assert(epoch_status_from_label("needs-reschedule", &status) == 1);
    assert(status == EPOCH_STATUS_NEEDS_RESCHEDULE);
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
    assert(epoch_timing_handoff_is_sandbox_safe(&timing_handoff) == 1);
    assert(epoch_availability_conflict_decision_is_customer_safe(&clear_decision) == 1);
    assert(epoch_availability_conflict_decision_is_customer_safe(&conflict_decision) == 1);
    clear_decision.availability_window_id = "";
    assert(epoch_availability_conflict_decision_is_customer_safe(&clear_decision) == 0);
    clear_decision.availability_window_id = "win-001";
    assert(epoch_schedule_request_acceptance_is_ready(&acceptance) == 1);
    assert(epoch_availability_hold_is_ready(&hold) == 1);
    assert(epoch_booking_confirmation_is_customer_safe(&booking) == 1);
    assert(epoch_schedule_status_event_is_customer_safe(&status_event) == 1);
    assert(epoch_booking_receipt_is_customer_safe(&booking_receipt) == 1);
    assert(epoch_timing_return_payload_is_customer_safe(&timing_return_payload) == 1);
    assert(epoch_timing_return_payload_is_customer_safe(&conflict_return_payload) == 1);
    assert(epoch_timing_return_receipt_is_customer_safe(&timing_return_receipt) == 1);
    timing_return_payload.provider_go_live_requested = 1;
    assert(epoch_timing_return_payload_is_customer_safe(&timing_return_payload) == 0);
    timing_return_payload.provider_go_live_requested = 0;
    booking.provider_go_live_requested = 1;
    assert(epoch_booking_confirmation_is_customer_safe(&booking) == 0);
    booking.provider_go_live_requested = 0;
    hold.status = EPOCH_STATUS_CANCELED;
    assert(epoch_availability_hold_is_ready(&hold) == 0);
    hold.status = EPOCH_STATUS_HELD;
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
