namespace Epoch.App;

public sealed record EpochCustomerScheduleStatusRecord(
    string StatusId,
    string CreatedAtUtc,
    string SourceSurface,
    string RequestId,
    string ExecutionHistoryId,
    string BookingReceiptId,
    string TimingReturnId,
    string RequestedWindow,
    string Timezone,
    string Status,
    string CustomerSafeMessage,
    string NextAction,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed)
{
    public static EpochCustomerScheduleStatusRecord FromScheduleChain(
        EpochWebportalScheduleRequest request,
        EpochRequestScheduleCommandReceipt commandReceipt,
        EpochScheduleExecutionHistoryEntry historyEntry,
        DateTimeOffset createdAtUtc)
    {
        string statusId = $"epoch-customer-status-{createdAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..51];

        bool customerSafe =
            request.CustomerSafe &&
            commandReceipt.CustomerSafe &&
            historyEntry.NativeExecutionReady &&
            !request.ProviderCallsEnabled &&
            !commandReceipt.ProviderCallsEnabled &&
            !historyEntry.ProviderCallsEnabled &&
            !request.MonitorWorkflowExposed &&
            !commandReceipt.MonitorWorkflowExposed &&
            !historyEntry.MonitorWorkflowExposed;

        return new EpochCustomerScheduleStatusRecord(
            statusId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.CustomerSafeStatusExport",
            request.RequestId,
            historyEntry.HistoryId,
            historyEntry.BookingReceiptId,
            historyEntry.TimingReturnId,
            request.RequestedWindow,
            request.Timezone,
            "local-schedule-status-ready",
            "Your schedule request has a local EPOCH scheduling update. External calendar provider calls remain disabled.",
            "Review the returned timing status in the customer-safe Webportal view.",
            customerSafe,
            customerSafe,
            commandReceipt.ProviderCallsEnabled || historyEntry.ProviderCallsEnabled || request.ProviderCallsEnabled,
            commandReceipt.MonitorWorkflowExposed || historyEntry.MonitorWorkflowExposed || request.MonitorWorkflowExposed);
    }
}
