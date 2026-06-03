using Epoch.App.Native;

namespace Epoch.App.ViewModels;

public sealed class MainWindowViewModel
{
    private MainWindowViewModel(
        EpochShellSnapshot snapshot,
        EpochScheduleCommandResult command,
        EpochScheduleExecutionReceipt execution)
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

    public static MainWindowViewModel Load()
    {
        return new MainWindowViewModel(
            EpochNative.LoadSnapshotOrFallback(),
            EpochNative.LoadScheduleCommandOrFallback(),
            EpochNative.ExecuteScheduleCommandOrFallback("confirm-local-booking"));
    }
}
