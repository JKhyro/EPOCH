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

    assert(strcmp(epoch_status_label(EPOCH_STATUS_SUBMITTED), "submitted") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_PROPOSED), "proposed") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_RETRY_READY), "retry-ready") == 0);
    assert(strcmp(epoch_status_label(EPOCH_STATUS_ACKNOWLEDGED), "acknowledged") == 0);
    assert(epoch_status_from_label("reviewing", &status) == 1);
    assert(status == EPOCH_STATUS_REVIEWING);
    assert(epoch_status_from_label("in-progress", &status) == 1);
    assert(status == EPOCH_STATUS_IN_PROGRESS);
    assert(epoch_status_from_label("queued", &status) == 1);
    assert(status == EPOCH_STATUS_QUEUED);
    assert(epoch_status_is_terminal(EPOCH_STATUS_RETURNED) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_SENT) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_REJECTED) == 1);
    assert(epoch_status_is_terminal(EPOCH_STATUS_REVIEWING) == 0);
    assert(epoch_operating_entry_needs_attention(&overdue) == 1);

    return 0;
}
