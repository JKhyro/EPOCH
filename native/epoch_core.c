#include "epoch_core.h"

#include <string.h>

typedef struct EpochStatusName {
    EpochOperatingStatus status;
    const char *label;
} EpochStatusName;

static const EpochStatusName EPOCH_STATUS_NAMES[] = {
    {EPOCH_STATUS_PLANNED, "planned"},
    {EPOCH_STATUS_WAITING, "waiting"},
    {EPOCH_STATUS_PROPOSED, "proposed"},
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
    {EPOCH_STATUS_RETRY_READY, "retry-ready"},
    {EPOCH_STATUS_REJECTED, "rejected"},
    {EPOCH_STATUS_ROLLED_BACK, "rolled-back"},
    {EPOCH_STATUS_CANCELED, "canceled"},
    {EPOCH_STATUS_COMPLETE, "complete"},
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
           entry->status == EPOCH_STATUS_QUEUED ||
           entry->status == EPOCH_STATUS_DISPATCHED ||
           entry->status == EPOCH_STATUS_FAILED ||
           entry->status == EPOCH_STATUS_RETRY_READY ||
           entry->status == EPOCH_STATUS_SUBMITTED ||
           entry->status == EPOCH_STATUS_REVIEWING ||
           entry->status == EPOCH_STATUS_IN_PROGRESS;
}
