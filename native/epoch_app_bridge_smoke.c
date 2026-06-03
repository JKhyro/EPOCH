#include "epoch_app_bridge.h"

#include <assert.h>
#include <string.h>

int main(void) {
    EpochAppBridgeSnapshot snapshot;

    assert(epoch_app_bridge_get_snapshot(&snapshot) == 1);
    assert(strcmp(epoch_app_bridge_product_name(), "EPOCH") == 0);
    assert(strcmp(snapshot.product_name, "EPOCH") == 0);
    assert(strcmp(snapshot.core_status, "native-core-ready") == 0);
    assert(strcmp(snapshot.calendar_system, "revised-13-month") == 0);
    assert(strcmp(snapshot.revised_rulepack_status, "structure-ready-conversion-gated") == 0);
    assert(strcmp(snapshot.schedule_queue_status, "queued") == 0);
    assert(snapshot.schedule_module_count == 5);
    assert(snapshot.revised_month_count == 13);
    assert(snapshot.revised_days_per_month == 28);
    assert(snapshot.revised_conversion_ready == 0);
    assert(snapshot.monitor_boundary_enforced == 1);
    assert(epoch_app_bridge_get_snapshot(0) == 0);

    return 0;
}
