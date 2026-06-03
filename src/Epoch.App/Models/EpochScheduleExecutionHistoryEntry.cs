namespace Epoch.App;

public sealed record EpochScheduleExecutionHistoryEntry(
    string HistoryId,
    string RecordedAtUtc,
    string SourceSurface,
    string ExecutionId,
    string IntentKind,
    string ExecutionStatus,
    string RequestId,
    string HoldId,
    string BookingConfirmationId,
    string BookingReceiptId,
    string TimingReturnId,
    string CustomerSafeStatus,
    bool ExecutedLocally,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool NativeExecutionReady)
{
    public static EpochScheduleExecutionHistoryEntry FromReceipt(
        EpochScheduleExecutionReceipt receipt,
        string sourceSurface,
        DateTimeOffset recordedAtUtc)
    {
        string historyId = $"epoch-history-{recordedAtUtc:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}"[..43];

        return new EpochScheduleExecutionHistoryEntry(
            historyId,
            recordedAtUtc.ToString("O"),
            sourceSurface,
            receipt.ExecutionId,
            receipt.IntentKind,
            receipt.ExecutionStatus,
            receipt.RequestId,
            receipt.HoldId,
            receipt.BookingConfirmationId,
            receipt.BookingReceiptId,
            receipt.TimingReturnId,
            receipt.CustomerSafeStatus,
            receipt.ExecutedLocally,
            receipt.ProviderCallsEnabled,
            receipt.MonitorWorkflowExposed,
            receipt.NativeExecutionReady);
    }
}
