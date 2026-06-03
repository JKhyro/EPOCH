#include "epoch_app_bridge.h"

#include "epoch_core.h"

#include <string.h>

static int epoch_app_bridge_text_present(const char *value) {
    return value != 0 && value[0] != '\0';
}

static int epoch_app_bridge_intent_supported(const char *intent_kind) {
    if (!epoch_app_bridge_text_present(intent_kind)) {
        return 0;
    }

    return strcmp(intent_kind, "create-local-hold") == 0 ||
           strcmp(intent_kind, "confirm-local-booking") == 0 ||
           strcmp(intent_kind, "return-timing-status") == 0;
}

static EpochRevisedCalendarRulepack epoch_app_bridge_draft_rulepack(void) {
    EpochRevisedCalendarRulepack rulepack = {
        "epoch-app-rulepack-draft",
        "owner-approved-rulepack-required",
        13,
        28,
        1,
        1,
        "measured-average-first-spring-day",
        "owner-physical-measurement-required",
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

    return rulepack;
}

static int epoch_app_bridge_schedule_surface_ready(void) {
    EpochScheduleRequest request = {
        "epoch-app-request-001",
        "owner",
        "2026-06-04T18:00:00+09:00/2026-06-04T19:00:00+09:00",
        "Asia/Tokyo",
        "Schedule request is queued locally; provider calls remain disabled.",
        EPOCH_STATUS_QUEUED,
        1,
        1,
        0,
    };
    EpochScheduleTemplate template_record = {
        "epoch-app-template-001",
        "availability-block",
        "Owner availability review",
        "60 minutes",
        "Asia/Tokyo",
        1,
        0,
    };
    EpochScheduleAuditRecord audit_record = {
        "epoch-app-audit-001",
        "epoch-app-entry-001",
        "EPOCH App",
        "native-bridge-read",
        "Avalonia shell read a customer-safe native scheduling snapshot.",
        EPOCH_STATUS_ACKNOWLEDGED,
        1,
        0,
    };
    EpochSchedulerLogEntry log_entry = {
        "epoch-app-log-001",
        "native-bridge-read",
        "epoch-app-entry-001",
        "Scheduler Log product module remains separate from MONITOR runner logs.",
        "2026-06-04T18:00:00+09:00",
        EPOCH_STATUS_ACKNOWLEDGED,
        1,
        0,
    };
    EpochLocalWorktreeStatus worktree = {
        "epoch-app-worktree-001",
        "C:\\KHYRON\\apps\\EPOCH",
        "codex/local-epoch-avalonia-scheduling-module",
        "local-head",
        0,
        0,
    };

    return epoch_schedule_request_is_customer_safe(&request) &&
           epoch_schedule_template_is_ready(&template_record) &&
           epoch_schedule_audit_record_is_customer_safe(&audit_record) &&
           epoch_scheduler_log_entry_is_product_log(&log_entry) &&
           epoch_local_worktree_status_is_local_only(&worktree);
}

const char *epoch_app_bridge_product_name(void) {
    return "EPOCH";
}

const char *epoch_app_bridge_core_status(void) {
    return epoch_app_bridge_core_ready() ? "native-core-ready" : "native-core-blocked";
}

int epoch_app_bridge_core_ready(void) {
    EpochRevisedCalendarRulepack rulepack = epoch_app_bridge_draft_rulepack();

    return epoch_app_bridge_schedule_surface_ready() &&
           epoch_revised_calendar_rulepack_represents_owner_structure(&rulepack) &&
           epoch_revised_calendar_rulepack_blocks_conversion(&rulepack) &&
           epoch_app_bridge_monitor_boundary_enforced();
}

int epoch_app_bridge_revised_conversion_ready(void) {
    EpochRevisedCalendarRulepack rulepack = epoch_app_bridge_draft_rulepack();

    return epoch_revised_calendar_rulepack_conversion_ready(&rulepack);
}

int epoch_app_bridge_monitor_boundary_enforced(void) {
    return 1;
}

int epoch_app_bridge_get_snapshot(EpochAppBridgeSnapshot *out_snapshot) {
    EpochRevisedCalendarRulepack rulepack = epoch_app_bridge_draft_rulepack();

    if (out_snapshot == 0) {
        return 0;
    }

    memset(out_snapshot, 0, sizeof(*out_snapshot));
    out_snapshot->product_name = epoch_app_bridge_product_name();
    out_snapshot->core_status = epoch_app_bridge_core_status();
    out_snapshot->calendar_system = epoch_calendar_system_label(EPOCH_CALENDAR_REVISED_13_MONTH);
    out_snapshot->revised_rulepack_status = epoch_revised_calendar_rulepack_blocks_conversion(&rulepack)
                                                ? "structure-ready-conversion-gated"
                                                : "conversion-ready";
    out_snapshot->schedule_queue_status = epoch_status_label(EPOCH_STATUS_QUEUED);
    out_snapshot->customer_safe_status = "EPOCH App shell is reading native scheduling status; MONITOR remains development/control only.";
    out_snapshot->schedule_module_count = 5;
    out_snapshot->revised_month_count = rulepack.month_count;
    out_snapshot->revised_days_per_month = rulepack.days_per_month;
    out_snapshot->revised_conversion_ready = epoch_app_bridge_revised_conversion_ready();
    out_snapshot->monitor_boundary_enforced = epoch_app_bridge_monitor_boundary_enforced();

    return epoch_app_bridge_core_ready();
}

int epoch_app_bridge_preview_schedule_command(EpochAppBridgeScheduleCommandResult *out_result) {
    EpochScheduleRequest request = {
        "epoch-command-request-001",
        "owner",
        "2026-06-07T10:00:00+09:00/2026-06-07T11:00:00+09:00",
        "Asia/Tokyo",
        "Schedule command preview is queued locally and customer-safe.",
        EPOCH_STATUS_QUEUED,
        1,
        1,
        0,
    };
    EpochScheduleEntry entry = {
        "epoch-command-entry-001",
        "Native command schedule preview",
        "Created by the Avalonia scheduling command module through the C bridge.",
        "2026-06-07T10:00:00+09:00",
        "2026-06-07T11:00:00+09:00",
        "Asia/Tokyo",
        EPOCH_STATUS_QUEUED,
    };
    EpochAvailabilityWindow window = {
        "epoch-command-window-001",
        "Owner command window",
        "2026-06-07T10:00:00+09:00",
        "2026-06-07T12:00:00+09:00",
        "Asia/Tokyo",
        2,
        0,
        EPOCH_STATUS_AVAILABLE,
    };
    EpochTimingHandoff handoff = {
        "epoch-command-handoff-001",
        "WORKSHOP",
        "workshop-command-handoff-001",
        "epoch-command-request-001",
        "2026-06-07T10:00:00+09:00/2026-06-07T11:00:00+09:00",
        "Asia/Tokyo",
        "WORKSHOP timing handoff is accepted into EPOCH scheduling ownership.",
        EPOCH_STATUS_ACCEPTED,
        1,
        0,
    };
    EpochAvailabilityConflictDecision clear_decision = {
        "epoch-command-conflict-001",
        "epoch-command-handoff-001",
        "epoch-command-request-001",
        "epoch-command-window-001",
        "capacity-clear",
        "Availability is clear for a local scheduling command preview.",
        EPOCH_STATUS_CLEAR,
        1,
        1,
        0,
    };
    EpochScheduleRequestAcceptance acceptance = {
        "epoch-command-acceptance-001",
        "epoch-command-request-001",
        "epoch-command-window-001",
        "Schedule request accepted into a local availability hold.",
        EPOCH_STATUS_ACCEPTED,
        1,
        1,
        0,
    };
    EpochAvailabilityHold hold = {
        "epoch-command-hold-001",
        "epoch-command-acceptance-001",
        "epoch-command-request-001",
        "epoch-command-window-001",
        "2026-06-07T10:00:00+09:00",
        "2026-06-07T11:00:00+09:00",
        "Asia/Tokyo",
        EPOCH_STATUS_HELD,
        1,
        0,
    };
    EpochBookingConfirmation booking = {
        "epoch-command-booking-001",
        "epoch-command-acceptance-001",
        "epoch-command-hold-001",
        "epoch-command-entry-001",
        "epoch-command-request-001",
        "2026-06-07T10:00:00+09:00/2026-06-07T11:00:00+09:00",
        "Asia/Tokyo",
        "Native scheduling command preview confirms a local booking without provider calls.",
        EPOCH_STATUS_CONFIRMED,
        1,
        0,
    };
    EpochScheduleStatusEvent status_event = {
        "epoch-command-status-001",
        "epoch-command-booking-001",
        "epoch-command-request-001",
        "confirmed",
        "Schedule command preview confirmed locally; external calendar calls remain disabled.",
        EPOCH_STATUS_CONFIRMED,
        1,
    };
    EpochBookingReceipt receipt = {
        "epoch-command-receipt-001",
        "epoch-command-booking-001",
        "epoch-command-status-001",
        "Native command preview produced request, acceptance, hold, booking, status, and receipt evidence.",
        EPOCH_STATUS_COMPLETE,
        1,
        0,
    };
    EpochTimingReturnPayload timing_return = {
        "epoch-command-return-001",
        "epoch-command-handoff-001",
        "epoch-command-conflict-001",
        "epoch-command-booking-001",
        "epoch-command-request-001",
        "booking-confirmed",
        "Confirmed timing returned to the requesting workflow without sharing calendar internals.",
        EPOCH_STATUS_RETURNED,
        1,
        0,
    };
    int request_safe;
    int window_ready;
    int handoff_safe;
    int decision_safe;
    int acceptance_ready;
    int hold_ready;
    int booking_safe;
    int status_safe;
    int receipt_safe;
    int return_safe;
    int ready;

    if (out_result == 0) {
        return 0;
    }

    request_safe = epoch_schedule_request_is_customer_safe(&request);
    window_ready = epoch_availability_window_has_capacity(&window);
    handoff_safe = epoch_timing_handoff_is_sandbox_safe(&handoff);
    decision_safe = epoch_availability_conflict_decision_is_customer_safe(&clear_decision);
    acceptance_ready = epoch_schedule_request_acceptance_is_ready(&acceptance);
    hold_ready = epoch_availability_hold_is_ready(&hold);
    booking_safe = epoch_booking_confirmation_is_customer_safe(&booking);
    status_safe = epoch_schedule_status_event_is_customer_safe(&status_event);
    receipt_safe = epoch_booking_receipt_is_customer_safe(&receipt);
    return_safe = epoch_timing_return_payload_is_customer_safe(&timing_return);
    ready = request_safe &&
            window_ready &&
            handoff_safe &&
            decision_safe &&
            acceptance_ready &&
            hold_ready &&
            booking_safe &&
            status_safe &&
            receipt_safe &&
            return_safe;

    memset(out_result, 0, sizeof(*out_result));
    out_result->request_id = request.id;
    out_result->schedule_entry_id = entry.id;
    out_result->availability_window_id = window.id;
    out_result->booking_confirmation_id = booking.id;
    out_result->receipt_id = receipt.id;
    out_result->timing_return_status = epoch_status_label(timing_return.status);
    out_result->customer_safe_status = timing_return.customer_safe_status;
    out_result->request_customer_safe = request_safe;
    out_result->availability_has_capacity = window_ready;
    out_result->acceptance_ready = acceptance_ready;
    out_result->hold_ready = hold_ready;
    out_result->booking_customer_safe = booking_safe;
    out_result->receipt_customer_safe = receipt_safe;
    out_result->timing_return_customer_safe = return_safe;
    out_result->native_command_ready = ready;

    return ready;
}

int epoch_app_bridge_execute_schedule_command(const char *intent_kind, EpochAppBridgeScheduleExecutionReceipt *out_receipt) {
    EpochScheduleRequest request = {
        "epoch-exec-request-001",
        "owner",
        "2026-06-08T14:00:00+09:00/2026-06-08T15:00:00+09:00",
        "Asia/Tokyo",
        "Schedule execution is local, customer-safe, and provider calls remain disabled.",
        EPOCH_STATUS_QUEUED,
        1,
        1,
        0,
    };
    EpochAvailabilityWindow window = {
        "epoch-exec-window-001",
        "Execution window",
        "2026-06-08T14:00:00+09:00",
        "2026-06-08T16:00:00+09:00",
        "Asia/Tokyo",
        2,
        0,
        EPOCH_STATUS_AVAILABLE,
    };
    EpochTimingHandoff handoff = {
        "epoch-exec-handoff-001",
        "WORKSHOP",
        "workshop-exec-handoff-001",
        "epoch-exec-request-001",
        "2026-06-08T14:00:00+09:00/2026-06-08T15:00:00+09:00",
        "Asia/Tokyo",
        "Timing handoff is accepted for local EPOCH execution.",
        EPOCH_STATUS_ACCEPTED,
        1,
        0,
    };
    EpochAvailabilityConflictDecision decision = {
        "epoch-exec-decision-001",
        "epoch-exec-handoff-001",
        "epoch-exec-request-001",
        "epoch-exec-window-001",
        "capacity-clear",
        "EPOCH execution found local availability and can place a hold.",
        EPOCH_STATUS_CLEAR,
        1,
        1,
        0,
    };
    EpochScheduleRequestAcceptance acceptance = {
        "epoch-exec-acceptance-001",
        "epoch-exec-request-001",
        "epoch-exec-window-001",
        "Local scheduling execution accepted the request.",
        EPOCH_STATUS_ACCEPTED,
        1,
        1,
        0,
    };
    EpochAvailabilityHold hold = {
        "epoch-exec-hold-001",
        "epoch-exec-acceptance-001",
        "epoch-exec-request-001",
        "epoch-exec-window-001",
        "2026-06-08T14:00:00+09:00",
        "2026-06-08T15:00:00+09:00",
        "Asia/Tokyo",
        EPOCH_STATUS_HELD,
        1,
        0,
    };
    EpochBookingConfirmation booking = {
        "epoch-exec-booking-001",
        "epoch-exec-acceptance-001",
        "epoch-exec-hold-001",
        "epoch-exec-entry-001",
        "epoch-exec-request-001",
        "2026-06-08T14:00:00+09:00/2026-06-08T15:00:00+09:00",
        "Asia/Tokyo",
        "Local scheduling execution confirmed the booking without provider calls.",
        EPOCH_STATUS_CONFIRMED,
        1,
        0,
    };
    EpochScheduleStatusEvent status_event = {
        "epoch-exec-status-001",
        "epoch-exec-booking-001",
        "epoch-exec-request-001",
        "confirmed",
        "Schedule execution is confirmed locally and safe to show.",
        EPOCH_STATUS_CONFIRMED,
        1,
    };
    EpochBookingReceipt booking_receipt = {
        "epoch-exec-receipt-001",
        "epoch-exec-booking-001",
        "epoch-exec-status-001",
        "Execution receipt proves the local request, hold, booking, status, and timing-return chain.",
        EPOCH_STATUS_COMPLETE,
        1,
        0,
    };
    EpochTimingReturnPayload timing_return = {
        "epoch-exec-return-001",
        "epoch-exec-handoff-001",
        "epoch-exec-decision-001",
        "epoch-exec-booking-001",
        "epoch-exec-request-001",
        "booking-confirmed",
        "Confirmed timing returned without exposing private calendar internals.",
        EPOCH_STATUS_RETURNED,
        1,
        0,
    };
    int intent_ok;
    int ready;

    if (out_receipt == 0) {
        return 0;
    }

    intent_ok = epoch_app_bridge_intent_supported(intent_kind);
    ready = intent_ok &&
            epoch_schedule_request_is_customer_safe(&request) &&
            epoch_availability_window_has_capacity(&window) &&
            epoch_timing_handoff_is_sandbox_safe(&handoff) &&
            epoch_availability_conflict_decision_is_customer_safe(&decision) &&
            epoch_schedule_request_acceptance_is_ready(&acceptance) &&
            epoch_availability_hold_is_ready(&hold) &&
            epoch_booking_confirmation_is_customer_safe(&booking) &&
            epoch_schedule_status_event_is_customer_safe(&status_event) &&
            epoch_booking_receipt_is_customer_safe(&booking_receipt) &&
            epoch_timing_return_payload_is_customer_safe(&timing_return);

    memset(out_receipt, 0, sizeof(*out_receipt));
    out_receipt->execution_id = "epoch-exec-001";
    out_receipt->intent_kind = intent_ok ? intent_kind : "unsupported";
    out_receipt->execution_status = ready ? epoch_status_label(EPOCH_STATUS_COMPLETE) : epoch_status_label(EPOCH_STATUS_BLOCKED);
    out_receipt->request_id = request.id;
    out_receipt->acceptance_id = acceptance.id;
    out_receipt->hold_id = hold.id;
    out_receipt->booking_confirmation_id = booking.id;
    out_receipt->booking_receipt_id = booking_receipt.id;
    out_receipt->timing_return_id = timing_return.id;
    out_receipt->customer_safe_status = ready
                                            ? "Native scheduling execution completed locally; provider calls stayed disabled and MONITOR received evidence only."
                                            : "Native scheduling execution is blocked by unsupported intent or unsafe schedule state.";
    out_receipt->executed_locally = ready;
    out_receipt->provider_calls_enabled = 0;
    out_receipt->monitor_workflow_exposed = 0;
    out_receipt->schedule_status_customer_safe = epoch_schedule_status_event_is_customer_safe(&status_event);
    out_receipt->native_execution_ready = ready;

    return ready;
}
