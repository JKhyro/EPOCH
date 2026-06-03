namespace Epoch.App;

public sealed record EpochScheduleLifecycleStatusRecord(
    string StatusId,
    string CreatedAtUtc,
    string SourceSurface,
    string ActionId,
    string RequestId,
    string ActionKind,
    string RequestedWindow,
    string Status,
    string CustomerSafeMessage,
    string NextAction,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed)
{
    public static EpochScheduleLifecycleStatusRecord FromLifecycleChain(
        EpochScheduleLifecycleAction action,
        EpochScheduleLifecycleReceipt receipt,
        DateTimeOffset createdAtUtc)
    {
        string statusId = $"epoch-lifecycle-status-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..51];
        bool customerSafe =
            action.CustomerSafe &&
            receipt.CustomerSafe &&
            !action.ProviderCallsEnabled &&
            !receipt.ProviderCallsEnabled &&
            !action.MonitorWorkflowExposed &&
            !receipt.MonitorWorkflowExposed;

        return new EpochScheduleLifecycleStatusRecord(
            statusId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.ScheduleLifecycleStatusExport",
            action.ActionId,
            action.RequestId,
            action.ActionKind,
            action.RequestedWindow,
            "local-schedule-lifecycle-ready",
            "Your schedule change request has a local EPOCH lifecycle update. External calendar provider calls remain disabled.",
            "Review the customer-safe lifecycle update in the Webportal before any provider handoff is approved.",
            customerSafe,
            customerSafe,
            action.ProviderCallsEnabled || receipt.ProviderCallsEnabled,
            action.MonitorWorkflowExposed || receipt.MonitorWorkflowExposed);
    }
}
