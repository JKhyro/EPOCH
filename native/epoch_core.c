#include "epoch_core.h"

#include <string.h>

typedef struct EpochStatusName {
    EpochOperatingStatus status;
    const char *label;
} EpochStatusName;

typedef struct EpochProviderKindName {
    EpochProviderKind kind;
    const char *label;
} EpochProviderKindName;

typedef struct EpochCalendarSystemName {
    EpochCalendarSystem system;
    const char *label;
} EpochCalendarSystemName;

typedef struct EpochDeadlineHealthName {
    EpochDeadlineHealth health;
    const char *label;
} EpochDeadlineHealthName;

static const EpochStatusName EPOCH_STATUS_NAMES[] = {
    {EPOCH_STATUS_PLANNED, "planned"},
    {EPOCH_STATUS_WAITING, "waiting"},
    {EPOCH_STATUS_PROPOSED, "proposed"},
    {EPOCH_STATUS_DRAFT, "draft"},
    {EPOCH_STATUS_PRESENTED, "presented"},
    {EPOCH_STATUS_AVAILABLE, "available"},
    {EPOCH_STATUS_UNAVAILABLE, "unavailable"},
    {EPOCH_STATUS_QUEUED, "queued"},
    {EPOCH_STATUS_SUBMITTED, "submitted"},
    {EPOCH_STATUS_REVIEWING, "reviewing"},
    {EPOCH_STATUS_RETURNED, "returned"},
    {EPOCH_STATUS_OVERDUE, "overdue"},
    {EPOCH_STATUS_BLOCKED, "blocked"},
    {EPOCH_STATUS_APPROVED, "approved"},
    {EPOCH_STATUS_DISPATCHED, "dispatched"},
    {EPOCH_STATUS_ACKNOWLEDGED, "acknowledged"},
    {EPOCH_STATUS_IN_PROGRESS, "in-progress"},
    {EPOCH_STATUS_SENT, "sent"},
    {EPOCH_STATUS_FAILED, "failed"},
    {EPOCH_STATUS_SNOOZED, "snoozed"},
    {EPOCH_STATUS_RETRY_READY, "retry-ready"},
    {EPOCH_STATUS_PAYMENT_READY, "payment-ready"},
    {EPOCH_STATUS_PAYMENT_BLOCKED, "payment-blocked"},
    {EPOCH_STATUS_PAID_RECORDED, "paid-recorded"},
    {EPOCH_STATUS_DECLINED, "declined"},
    {EPOCH_STATUS_REJECTED, "rejected"},
    {EPOCH_STATUS_ROLLED_BACK, "rolled-back"},
    {EPOCH_STATUS_CANCELED, "canceled"},
    {EPOCH_STATUS_COMPLETE, "complete"},
};

static const EpochProviderKindName EPOCH_PROVIDER_KIND_NAMES[] = {
    {EPOCH_PROVIDER_CALENDAR, "calendar"},
    {EPOCH_PROVIDER_AVAILABILITY, "availability"},
    {EPOCH_PROVIDER_REMINDER, "reminder"},
    {EPOCH_PROVIDER_STATUS, "status"},
};

static const EpochCalendarSystemName EPOCH_CALENDAR_SYSTEM_NAMES[] = {
    {EPOCH_CALENDAR_GREGORIAN, "gregorian"},
    {EPOCH_CALENDAR_REVISED_13_MONTH, "revised-13-month"},
};

static const EpochDeadlineHealthName EPOCH_DEADLINE_HEALTH_NAMES[] = {
    {EPOCH_DEADLINE_ON_TRACK, "on-track"},
    {EPOCH_DEADLINE_AT_RISK, "at-risk"},
    {EPOCH_DEADLINE_OVERDUE, "overdue"},
    {EPOCH_DEADLINE_BLOCKED, "blocked"},
};

static int epoch_text_present(const char *value) {
    return value != 0 && value[0] != '\0';
}

const char *epoch_status_label(EpochOperatingStatus status) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_STATUS_NAMES) / sizeof(EPOCH_STATUS_NAMES[0]); i++) {
        if (EPOCH_STATUS_NAMES[i].status == status) {
            return EPOCH_STATUS_NAMES[i].label;
        }
    }

    return "unknown";
}

int epoch_status_from_label(const char *label, EpochOperatingStatus *out_status) {
    size_t i;

    if (label == 0 || out_status == 0) {
        return 0;
    }

    for (i = 0; i < sizeof(EPOCH_STATUS_NAMES) / sizeof(EPOCH_STATUS_NAMES[0]); i++) {
        if (strcmp(EPOCH_STATUS_NAMES[i].label, label) == 0) {
            *out_status = EPOCH_STATUS_NAMES[i].status;
            return 1;
        }
    }

    return 0;
}

int epoch_status_is_terminal(EpochOperatingStatus status) {
    return status == EPOCH_STATUS_RETURNED ||
           status == EPOCH_STATUS_SENT ||
           status == EPOCH_STATUS_PAID_RECORDED ||
           status == EPOCH_STATUS_DECLINED ||
           status == EPOCH_STATUS_REJECTED ||
           status == EPOCH_STATUS_ROLLED_BACK ||
           status == EPOCH_STATUS_CANCELED ||
           status == EPOCH_STATUS_COMPLETE;
}

int epoch_operating_entry_needs_attention(const EpochOperatingEntry *entry) {
    if (entry == 0) {
        return 0;
    }

    return entry->status == EPOCH_STATUS_OVERDUE ||
           entry->status == EPOCH_STATUS_BLOCKED ||
           entry->status == EPOCH_STATUS_PROPOSED ||
           entry->status == EPOCH_STATUS_DRAFT ||
           entry->status == EPOCH_STATUS_PRESENTED ||
           entry->status == EPOCH_STATUS_UNAVAILABLE ||
           entry->status == EPOCH_STATUS_QUEUED ||
           entry->status == EPOCH_STATUS_DISPATCHED ||
           entry->status == EPOCH_STATUS_FAILED ||
           entry->status == EPOCH_STATUS_SNOOZED ||
           entry->status == EPOCH_STATUS_RETRY_READY ||
           entry->status == EPOCH_STATUS_PAYMENT_READY ||
           entry->status == EPOCH_STATUS_PAYMENT_BLOCKED ||
           entry->status == EPOCH_STATUS_SUBMITTED ||
           entry->status == EPOCH_STATUS_REVIEWING ||
           entry->status == EPOCH_STATUS_IN_PROGRESS;
}

const char *epoch_provider_kind_label(EpochProviderKind kind) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_PROVIDER_KIND_NAMES) / sizeof(EPOCH_PROVIDER_KIND_NAMES[0]); i++) {
        if (EPOCH_PROVIDER_KIND_NAMES[i].kind == kind) {
            return EPOCH_PROVIDER_KIND_NAMES[i].label;
        }
    }

    return "unknown";
}

const char *epoch_calendar_system_label(EpochCalendarSystem system) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_CALENDAR_SYSTEM_NAMES) / sizeof(EPOCH_CALENDAR_SYSTEM_NAMES[0]); i++) {
        if (EPOCH_CALENDAR_SYSTEM_NAMES[i].system == system) {
            return EPOCH_CALENDAR_SYSTEM_NAMES[i].label;
        }
    }

    return "unknown";
}

const char *epoch_deadline_health_label(EpochDeadlineHealth health) {
    size_t i;

    for (i = 0; i < sizeof(EPOCH_DEADLINE_HEALTH_NAMES) / sizeof(EPOCH_DEADLINE_HEALTH_NAMES[0]); i++) {
        if (EPOCH_DEADLINE_HEALTH_NAMES[i].health == health) {
            return EPOCH_DEADLINE_HEALTH_NAMES[i].label;
        }
    }

    return "unknown";
}

int epoch_schedule_entry_is_valid(const EpochScheduleEntry *entry) {
    if (entry == 0) {
        return 0;
    }

    return epoch_text_present(entry->id) &&
           epoch_text_present(entry->title) &&
           epoch_text_present(entry->start_iso) &&
           epoch_text_present(entry->end_iso) &&
           epoch_text_present(entry->timezone) &&
           entry->status != EPOCH_STATUS_FAILED &&
           entry->status != EPOCH_STATUS_REJECTED &&
           entry->status != EPOCH_STATUS_ROLLED_BACK &&
           entry->status != EPOCH_STATUS_CANCELED;
}

int epoch_schedule_request_is_customer_safe(const EpochScheduleRequest *request) {
    if (request == 0) {
        return 0;
    }

    return request->customer_visible &&
           request->sandbox_only &&
           !request->provider_go_live_requested &&
           epoch_text_present(request->customer_safe_status) &&
           request->status != EPOCH_STATUS_BLOCKED &&
           request->status != EPOCH_STATUS_FAILED;
}

int epoch_availability_window_has_capacity(const EpochAvailabilityWindow *window) {
    if (window == 0 || window->capacity <= 0 || window->holds < 0) {
        return 0;
    }

    return window->holds < window->capacity &&
           window->status == EPOCH_STATUS_AVAILABLE;
}

int epoch_reminder_rule_is_sandbox_safe(const EpochReminderRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->sandbox_only &&
           epoch_text_present(rule->customer_safe_label) &&
           rule->status != EPOCH_STATUS_FAILED;
}

int epoch_recurrence_rule_is_sandbox_safe(const EpochRecurrenceRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->sandbox_only &&
           !rule->creates_future_entries &&
           epoch_text_present(rule->id) &&
           epoch_text_present(rule->schedule_entry_id) &&
           epoch_text_present(rule->rrule) &&
           rule->status != EPOCH_STATUS_FAILED &&
           rule->status != EPOCH_STATUS_BLOCKED &&
           rule->status != EPOCH_STATUS_CANCELED &&
           (rule->calendar_system != EPOCH_CALENDAR_REVISED_13_MONTH || rule->operator_approved);
}

int epoch_deadline_rule_is_customer_safe(const EpochDeadlineRule *rule) {
    if (rule == 0) {
        return 0;
    }

    return rule->customer_visible &&
           epoch_text_present(rule->id) &&
           epoch_text_present(rule->linked_entry_id) &&
           epoch_text_present(rule->due_iso) &&
           epoch_text_present(rule->timezone) &&
           epoch_text_present(rule->customer_safe_status) &&
           rule->status != EPOCH_STATUS_FAILED &&
           rule->status != EPOCH_STATUS_BLOCKED &&
           rule->health != EPOCH_DEADLINE_BLOCKED;
}

int epoch_revised_calendar_rulepack_has_required_approvals(const EpochRevisedCalendarRulepack *rulepack) {
    if (rulepack == 0) {
        return 0;
    }

    return epoch_text_present(rulepack->id) &&
           epoch_text_present(rulepack->version_id) &&
           rulepack->month_count == 13 &&
           rulepack->month_names_approved &&
           rulepack->day_distribution_approved &&
           rulepack->intercalary_days_approved &&
           rulepack->leap_rule_approved &&
           rulepack->epoch_anchor_approved &&
           rulepack->day_of_week_mapping_approved &&
           rulepack->formatting_rules_approved &&
           rulepack->timezone_boundary_approved &&
           rulepack->recurrence_mapping_approved &&
           rulepack->public_display_wording_approved &&
           rulepack->storage_identifier_approved &&
           rulepack->conversion_rules_approved &&
           rulepack->owner_approved;
}

int epoch_revised_calendar_rulepack_conversion_ready(const EpochRevisedCalendarRulepack *rulepack) {
    return epoch_revised_calendar_rulepack_has_required_approvals(rulepack) &&
           rulepack->conversion_logic_enabled;
}

int epoch_revised_calendar_rulepack_blocks_conversion(const EpochRevisedCalendarRulepack *rulepack) {
    return !epoch_revised_calendar_rulepack_conversion_ready(rulepack);
}

static int epoch_calendar_provider_gate_prerequisites_passed(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 0;
    }

    return gate->sandbox_prototype_passed &&
           gate->local_records_verified &&
           gate->customer_safe_status_verified &&
           gate->revised_calendar_mapping_verified &&
           gate->operator_approval_recorded &&
           gate->status != EPOCH_STATUS_BLOCKED &&
           gate->status != EPOCH_STATUS_FAILED;
}

int epoch_calendar_provider_gate_ready_for_live_toggle(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 0;
    }

    return epoch_calendar_provider_gate_prerequisites_passed(gate) &&
           !gate->live_provider_calls_enabled;
}

int epoch_calendar_provider_gate_blocks_live_calls(const EpochCalendarProviderReadinessGate *gate) {
    if (gate == 0) {
        return 1;
    }

    return !epoch_calendar_provider_gate_prerequisites_passed(gate) ||
           !gate->live_provider_calls_enabled;
}
