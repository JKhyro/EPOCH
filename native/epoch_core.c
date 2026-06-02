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

int epoch_schedule_request_is_customer_safe(const EpochScheduleRequest *request) {
    if (request == 0) {
        return 0;
    }

    return request->customer_visible &&
           request->sandbox_only &&
           !request->provider_go_live_requested &&
           request->customer_safe_status != 0 &&
           request->customer_safe_status[0] != '\0' &&
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
           rule->customer_safe_label != 0 &&
           rule->customer_safe_label[0] != '\0' &&
           rule->status != EPOCH_STATUS_FAILED;
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
