#include "epoch_app_bridge.h"

#include "epoch_core.h"

#include <string.h>

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
        "codex/local-epoch-avalonia-shell-boundary",
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
