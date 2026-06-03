using Epoch.App.Native;
using Epoch.App.Services;

namespace Epoch.App.ViewModels;

public sealed class MainWindowViewModel
{
    private MainWindowViewModel(
        EpochShellSnapshot snapshot,
        EpochScheduleCommandResult command,
        EpochScheduleExecutionReceipt execution,
        EpochScheduleExecutionHistoryEntry? historyEntry,
        IReadOnlyList<EpochScheduleExecutionHistoryEntry> history,
        string historyPath)
    {
        ProductName = snapshot.ProductName;
        CoreStatus = snapshot.CoreStatus;
        CalendarSystem = snapshot.CalendarSystem;
        RevisedRulepackStatus = snapshot.RevisedRulepackStatus;
        ScheduleQueueStatus = snapshot.ScheduleQueueStatus;
        CustomerSafeStatus = snapshot.CustomerSafeStatus;
        ModuleSummary = $"{snapshot.ScheduleModuleCount} scheduling product modules are native-bridge visible: audit, receipts, log, search, and templates.";
        RevisedCalendarShape = $"{snapshot.RevisedMonthCount} months x {snapshot.RevisedDaysPerMonth} days, with conversion ready: {snapshot.RevisedConversionReady.ToString().ToLowerInvariant()}.";
        BoundaryStatus = snapshot.MonitorBoundaryEnforced ? "monitor boundary enforced" : "monitor boundary blocked";
        CommandSummary = $"{command.RequestId} -> {command.BookingConfirmationId} via {command.AvailabilityWindowId}";
        CommandReceiptStatus = $"Receipt {command.ReceiptId}; timing return status: {command.TimingReturnStatus}.";
        CommandCustomerSafeStatus = command.CustomerSafeStatus;
        CommandReadiness = command.NativeCommandReady &&
            command.RequestCustomerSafe &&
            command.AvailabilityHasCapacity &&
            command.AcceptanceReady &&
            command.HoldReady &&
            command.BookingCustomerSafe &&
            command.ReceiptCustomerSafe &&
            command.TimingReturnCustomerSafe
                ? "native scheduling command ready"
                : "native scheduling command blocked";
        ExecutionReceiptSummary = $"{execution.IntentKind}: {execution.RequestId} -> {execution.HoldId} -> {execution.BookingConfirmationId}";
        ExecutionReceiptEvidence = $"Receipt {execution.BookingReceiptId}; timing return {execution.TimingReturnId}; status {execution.ExecutionStatus}.";
        ExecutionSafetyStatus = execution.NativeExecutionReady &&
            execution.ExecutedLocally &&
            !execution.ProviderCallsEnabled &&
            !execution.MonitorWorkflowExposed &&
            execution.ScheduleStatusCustomerSafe
                ? "native execution receipt ready"
                : "native execution receipt blocked";
        ExecutionCustomerSafeStatus = execution.CustomerSafeStatus;
        ExecutionHistoryCount = history.Count;
        ExecutionHistorySummary = $"{history.Count} local scheduling execution receipt(s) persisted in the EPOCH App ledger.";
        ExecutionHistoryLocation = historyPath;
        LastExecutionHistoryStatus = historyEntry is not null
            ? $"Last history {historyEntry.HistoryId}: {historyEntry.IntentKind} -> {historyEntry.ExecutionStatus}; provider calls enabled: {historyEntry.ProviderCallsEnabled.ToString().ToLowerInvariant()}."
            : "No new native execution history was persisted in this shell load.";
    }

    public string ProductName { get; }
    public string CoreStatus { get; }
    public string CalendarSystem { get; }
    public string RevisedRulepackStatus { get; }
    public string ScheduleQueueStatus { get; }
    public string CustomerSafeStatus { get; }
    public string ModuleSummary { get; }
    public string RevisedCalendarShape { get; }
    public string BoundaryStatus { get; }
    public string CommandSummary { get; }
    public string CommandReceiptStatus { get; }
    public string CommandCustomerSafeStatus { get; }
    public string CommandReadiness { get; }
    public string ExecutionReceiptSummary { get; }
    public string ExecutionReceiptEvidence { get; }
    public string ExecutionSafetyStatus { get; }
    public string ExecutionCustomerSafeStatus { get; }
    public int ExecutionHistoryCount { get; }
    public string ExecutionHistorySummary { get; }
    public string ExecutionHistoryLocation { get; }
    public string LastExecutionHistoryStatus { get; }

    public static MainWindowViewModel Load()
    {
        EpochScheduleExecutionReceipt execution = ExecuteNativeOrFallback("confirm-local-booking");
        EpochScheduleExecutionHistoryEntry? historyEntry = null;
        if (execution.NativeExecutionReady &&
            execution.ExecutedLocally &&
            !execution.ProviderCallsEnabled &&
            !execution.MonitorWorkflowExposed)
        {
            EpochScheduleExecutionHistoryStore.TryAppend(
                execution,
                "Epoch.App.Avalonia",
                out historyEntry);
        }

        IReadOnlyList<EpochScheduleExecutionHistoryEntry> history = EpochScheduleExecutionHistoryStore.Load();

        return new MainWindowViewModel(
            EpochNative.LoadSnapshotOrFallback(),
            EpochNative.LoadScheduleCommandOrFallback(),
            execution,
            historyEntry,
            history,
            EpochScheduleExecutionHistoryStore.HistoryPath);
    }

    private static EpochScheduleExecutionReceipt ExecuteNativeOrFallback(string intentKind)
    {
        try
        {
            return EpochNative.ExecuteScheduleCommand(intentKind);
        }
        catch
        {
            return EpochNative.ExecuteScheduleCommandOrFallback(intentKind);
        }
    }
}
