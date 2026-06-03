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
        string historyPath,
        EpochWebportalScheduleRequest? inboxRequest,
        IReadOnlyList<EpochWebportalScheduleRequest> requestInbox,
        string requestInboxPath,
        EpochRequestScheduleCommandReceipt? requestCommandReceipt,
        IReadOnlyList<EpochRequestScheduleCommandReceipt> requestCommandReceipts,
        string requestCommandReceiptPath,
        EpochScheduleOperationsBoardSnapshot operationsBoard,
        EpochCustomerScheduleStatusRecord? statusFeedback,
        IReadOnlyList<EpochCustomerScheduleStatusRecord> statusFeedbackRecords,
        string statusFeedbackPath)
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
        RequestInboxCount = requestInbox.Count;
        RequestInboxSummary = $"{requestInbox.Count} customer-safe Webportal schedule request(s) in the EPOCH App inbox.";
        RequestInboxLocation = requestInboxPath;
        RequestInboxStatus = inboxRequest is not null
            ? $"Latest request {inboxRequest.RequestId}: {inboxRequest.NeedKind} is {inboxRequest.Status}; provider calls enabled: {inboxRequest.ProviderCallsEnabled.ToString().ToLowerInvariant()}."
            : "No Webportal request was imported into the local EPOCH App inbox.";
        RequestCommandReceiptCount = requestCommandReceipts.Count;
        RequestCommandReceiptSummary = $"{requestCommandReceipts.Count} Webportal request-to-native command receipt(s) in the EPOCH App ledger.";
        RequestCommandReceiptLocation = requestCommandReceiptPath;
        RequestCommandReceiptStatus = requestCommandReceipt is not null
            ? $"Latest request command {requestCommandReceipt.RequestId} -> {requestCommandReceipt.BookingReceiptId}; native ready: {requestCommandReceipt.NativeExecutionReady.ToString().ToLowerInvariant()}."
            : "No Webportal request has been linked to a native scheduling command receipt in this shell load.";
        OperationsBoardStatus = operationsBoard.BoardStatus;
        OperationsBoardNextAction = operationsBoard.OperatorNextAction;
        OperationsBoardQueueSummary = operationsBoard.QueueSummary;
        OperationsBoardLatestRequestStatus = operationsBoard.LatestRequestStatus;
        OperationsBoardLatestCommandStatus = operationsBoard.LatestCommandStatus;
        OperationsBoardLatestExecutionStatus = operationsBoard.LatestExecutionStatus;
        OperationsBoardSafetySummary = operationsBoard.SafetySummary;
        OperationsBoardLedgerSummary = operationsBoard.LedgerSummary;
        OperationsBoardReadyForOperatorReview = operationsBoard.ReadyForOperatorReview
            ? "operator review ready"
            : "operator review blocked";
        CustomerStatusFeedbackCount = statusFeedbackRecords.Count;
        CustomerStatusFeedbackSummary = $"{statusFeedbackRecords.Count} customer-safe schedule status export(s) in the EPOCH App ledger.";
        CustomerStatusFeedbackLocation = statusFeedbackPath;
        CustomerStatusFeedbackStatus = statusFeedback is not null
            ? $"Latest status {statusFeedback.StatusId}: {statusFeedback.Status}; Webportal export ready: {statusFeedback.WebportalExportReady.ToString().ToLowerInvariant()}."
            : "No customer-safe schedule status feedback was exported in this shell load.";
        CustomerStatusFeedbackMessage = statusFeedback is not null
            ? statusFeedback.CustomerSafeMessage
            : "The customer-safe Webportal status loop is waiting for a linked request and native execution.";
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
    public int RequestInboxCount { get; }
    public string RequestInboxSummary { get; }
    public string RequestInboxLocation { get; }
    public string RequestInboxStatus { get; }
    public int RequestCommandReceiptCount { get; }
    public string RequestCommandReceiptSummary { get; }
    public string RequestCommandReceiptLocation { get; }
    public string RequestCommandReceiptStatus { get; }
    public string OperationsBoardStatus { get; }
    public string OperationsBoardNextAction { get; }
    public string OperationsBoardQueueSummary { get; }
    public string OperationsBoardLatestRequestStatus { get; }
    public string OperationsBoardLatestCommandStatus { get; }
    public string OperationsBoardLatestExecutionStatus { get; }
    public string OperationsBoardSafetySummary { get; }
    public string OperationsBoardLedgerSummary { get; }
    public string OperationsBoardReadyForOperatorReview { get; }
    public int CustomerStatusFeedbackCount { get; }
    public string CustomerStatusFeedbackSummary { get; }
    public string CustomerStatusFeedbackLocation { get; }
    public string CustomerStatusFeedbackStatus { get; }
    public string CustomerStatusFeedbackMessage { get; }

    public static MainWindowViewModel Load()
    {
        EpochWebportalScheduleRequest? inboxRequest = null;
        EpochScheduleRequestInboxStore.TryEnsureDefaultWebportalRequest(out inboxRequest);
        IReadOnlyList<EpochWebportalScheduleRequest> requestInbox = EpochScheduleRequestInboxStore.Load();

        EpochScheduleExecutionReceipt execution = ExecuteNativeOrFallback("confirm-local-booking");
        EpochScheduleExecutionHistoryEntry? historyEntry = null;
        EpochRequestScheduleCommandReceipt? requestCommandReceipt = null;

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
        if (inboxRequest is not null && historyEntry is not null)
        {
            EpochRequestScheduleCommandReceiptStore.TryAppend(
                inboxRequest,
                historyEntry,
                execution,
                out requestCommandReceipt);
        }

        IReadOnlyList<EpochRequestScheduleCommandReceipt> requestCommandReceipts =
            EpochRequestScheduleCommandReceiptStore.Load();
        EpochScheduleOperationsBoardSnapshot operationsBoard =
            EpochScheduleOperationsBoardSnapshot.FromLedgers(
                requestInbox,
                requestCommandReceipts,
                history,
                EpochScheduleRequestInboxStore.InboxPath,
                EpochRequestScheduleCommandReceiptStore.ReceiptPath,
                EpochScheduleExecutionHistoryStore.HistoryPath);
        EpochCustomerScheduleStatusRecord? statusFeedback = null;
        if (operationsBoard.ReadyForOperatorReview &&
            inboxRequest is not null &&
            requestCommandReceipt is not null &&
            historyEntry is not null)
        {
            EpochCustomerScheduleStatusStore.TryAppend(
                inboxRequest,
                requestCommandReceipt,
                historyEntry,
                out statusFeedback);
        }

        IReadOnlyList<EpochCustomerScheduleStatusRecord> statusFeedbackRecords =
            EpochCustomerScheduleStatusStore.Load();

        return new MainWindowViewModel(
            EpochNative.LoadSnapshotOrFallback(),
            EpochNative.LoadScheduleCommandOrFallback(),
            execution,
            historyEntry,
            history,
            EpochScheduleExecutionHistoryStore.HistoryPath,
            inboxRequest,
            requestInbox,
            EpochScheduleRequestInboxStore.InboxPath,
            requestCommandReceipt,
            requestCommandReceipts,
            EpochRequestScheduleCommandReceiptStore.ReceiptPath,
            operationsBoard,
            statusFeedback,
            statusFeedbackRecords,
            EpochCustomerScheduleStatusStore.StatusPath);
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
