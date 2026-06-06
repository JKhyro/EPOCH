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
        string statusFeedbackPath,
        EpochScheduleLifecycleAction? lifecycleAction,
        IReadOnlyList<EpochScheduleLifecycleAction> lifecycleActions,
        string lifecycleActionPath,
        EpochScheduleLifecycleReceipt? lifecycleReceipt,
        IReadOnlyList<EpochScheduleLifecycleReceipt> lifecycleReceipts,
        string lifecycleReceiptPath,
        EpochScheduleLifecycleStatusRecord? lifecycleStatus,
        IReadOnlyList<EpochScheduleLifecycleStatusRecord> lifecycleStatuses,
        string lifecycleStatusPath,
        EpochRevisedCalendarTimingExport? revisedTimingExport,
        IReadOnlyList<EpochRevisedCalendarTimingExport> revisedTimingExports,
        string revisedTimingExportPath,
        EpochRevisedRulepackOwnerDecision? revisedRulepackOwnerDecision,
        IReadOnlyList<EpochRevisedRulepackOwnerDecision> revisedRulepackOwnerDecisions,
        string revisedRulepackOwnerDecisionPath,
        EpochRevisedRulepackApprovalReceipt? revisedRulepackApprovalReceipt,
        IReadOnlyList<EpochRevisedRulepackApprovalReceipt> revisedRulepackApprovalReceipts,
        string revisedRulepackApprovalReceiptPath,
        EpochRevisedAvailabilityException? revisedAvailabilityException,
        IReadOnlyList<EpochRevisedAvailabilityException> revisedAvailabilityExceptions,
        string revisedAvailabilityExceptionPath,
        EpochRevisedAvailabilityExceptionReceipt? revisedAvailabilityExceptionReceipt,
        IReadOnlyList<EpochRevisedAvailabilityExceptionReceipt> revisedAvailabilityExceptionReceipts,
        string revisedAvailabilityExceptionReceiptPath,
        EpochRevisedReminderExecution? revisedReminderExecution,
        IReadOnlyList<EpochRevisedReminderExecution> revisedReminderExecutions,
        string revisedReminderExecutionPath,
        EpochRevisedDeadlineExecution? revisedDeadlineExecution,
        IReadOnlyList<EpochRevisedDeadlineExecution> revisedDeadlineExecutions,
        string revisedDeadlineExecutionPath,
        EpochRevisedDeadlineEscalation? revisedDeadlineEscalation,
        IReadOnlyList<EpochRevisedDeadlineEscalation> revisedDeadlineEscalations,
        string revisedDeadlineEscalationPath,
        EpochRevisedReminderDeadlineReceipt? revisedReminderDeadlineReceipt,
        IReadOnlyList<EpochRevisedReminderDeadlineReceipt> revisedReminderDeadlineReceipts,
        string revisedReminderDeadlineReceiptPath)
    {
        ProductName = snapshot.ProductName;
        CoreStatus = snapshot.CoreStatus;
        CalendarSystem = snapshot.CalendarSystem;
        RevisedRulepackStatus = snapshot.RevisedRulepackStatus;
        ScheduleQueueStatus = snapshot.ScheduleQueueStatus;
        CustomerSafeStatus = snapshot.CustomerSafeStatus;
        ModuleSummary = $"{snapshot.ScheduleModuleCount} scheduling product modules are native-bridge visible: audit, receipts, log, search, and templates.";
        RevisedCalendarShape = $"{snapshot.RevisedMonthCount} months x {snapshot.RevisedDaysPerMonth} days, with {snapshot.RevisedCommonIntercalaryDays} common-year day and {snapshot.RevisedLeapIntercalaryDays} leap-year days outside the months.";
        RevisedCalendarAnchor = $"{snapshot.RevisedAnchorMethod}; source: {snapshot.RevisedAnchorSource}.";
        RevisedCalendarIntercalaryPolicy = snapshot.RevisedIntercalaryPolicy;
        RevisedCalendarGateReason = $"{snapshot.RevisedConversionGateReason}; conversion ready: {snapshot.RevisedConversionReady.ToString().ToLowerInvariant()}; customer-safe constraints: {snapshot.RevisedConstraintsCustomerSafe.ToString().ToLowerInvariant()}.";
        RevisedCalendarBoundaryPolicies = $"{snapshot.RevisedYearOpeningPolicy}; {snapshot.RevisedLeapDayPolicy}.";
        BoundaryStatus = snapshot.MonitorBoundaryEnforced ? "monitor boundary enforced" : "monitor boundary blocked";
        NativeSchedulerRelationshipSummary = "Native scheduler map keeps requests, availability, holds, bookings, reminders, recurrence, timing returns, and receipts connected in the Avalonia operator shell.";
        NativeSchedulerRequestRelationship = $"Request {command.RequestId} links to availability {command.AvailabilityWindowId}, hold {execution.HoldId}, booking {command.BookingConfirmationId}, and receipt {command.ReceiptId}.";
        NativeSchedulerAvailabilityRelationship = "Availability connects to capacity snapshots, waitlist state, hold releases, booking candidates, overload warnings, and customer-safe options.";
        NativeSchedulerRecurrenceRelationship = "Recurring schedules connect to exceptions, revised availability, reminder/deadline execution, rulepack decisions, and approval receipts.";
        NativeSchedulerPortalRelationship = "Webportal exports remain customer-safe: schedule status, booking options, waitlist/capacity, reminders/deadlines, recurring schedule, and receipts/imports only.";
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
        ScheduleLifecycleActionCount = lifecycleActions.Count;
        ScheduleLifecycleActionSummary = $"{lifecycleActions.Count} customer-safe schedule lifecycle action(s) in the EPOCH App queue.";
        ScheduleLifecycleActionLocation = lifecycleActionPath;
        ScheduleLifecycleActionStatus = lifecycleAction is not null
            ? $"Latest lifecycle action {lifecycleAction.ActionId}: {lifecycleAction.ActionKind} for {lifecycleAction.RequestId}; provider calls enabled: {lifecycleAction.ProviderCallsEnabled.ToString().ToLowerInvariant()}."
            : "No Webportal schedule lifecycle action was imported into the local EPOCH App queue.";
        ScheduleLifecycleReceiptCount = lifecycleReceipts.Count;
        ScheduleLifecycleReceiptSummary = $"{lifecycleReceipts.Count} schedule lifecycle receipt(s) linked to native command evidence.";
        ScheduleLifecycleReceiptLocation = lifecycleReceiptPath;
        ScheduleLifecycleReceiptStatus = lifecycleReceipt is not null
            ? $"Latest lifecycle receipt {lifecycleReceipt.ReceiptId}: {lifecycleReceipt.ActionKind} -> {lifecycleReceipt.Status}; native ready: {lifecycleReceipt.NativeExecutionReady.ToString().ToLowerInvariant()}."
            : "No schedule lifecycle action has been linked to a native scheduling command receipt in this shell load.";
        ScheduleLifecycleStatusCount = lifecycleStatuses.Count;
        ScheduleLifecycleStatusSummary = $"{lifecycleStatuses.Count} customer-safe schedule lifecycle status export(s) in the EPOCH App ledger.";
        ScheduleLifecycleStatusLocation = lifecycleStatusPath;
        ScheduleLifecycleStatusStatus = lifecycleStatus is not null
            ? $"Latest lifecycle status {lifecycleStatus.StatusId}: {lifecycleStatus.Status}; Webportal export ready: {lifecycleStatus.WebportalExportReady.ToString().ToLowerInvariant()}."
            : "No customer-safe schedule lifecycle status feedback was exported in this shell load.";
        ScheduleLifecycleStatusMessage = lifecycleStatus is not null
            ? lifecycleStatus.CustomerSafeMessage
            : "The schedule lifecycle Webportal status loop is waiting for a linked lifecycle action and native execution.";
        RevisedTimingExportCount = revisedTimingExports.Count;
        RevisedTimingExportSummary = $"{revisedTimingExports.Count} EPOCH revised timing export payload(s) available for WORKSHOP timing-provider consumption.";
        RevisedTimingExportLocation = revisedTimingExportPath;
        RevisedTimingExportStatus = revisedTimingExport is not null
            ? $"Latest export {revisedTimingExport.PayloadId}: {revisedTimingExport.CalendarSystemLabel}; customer-safe: {revisedTimingExport.CustomerSafe.ToString().ToLowerInvariant()}; WORKSHOP calendar ownership: {revisedTimingExport.WorkshopCalendarOwnership.ToString().ToLowerInvariant()}."
            : "No EPOCH revised timing export was written in this shell load.";
        RevisedRulepackOwnerDecisionCount = revisedRulepackOwnerDecisions.Count;
        RevisedRulepackOwnerDecisionSummary = $"{revisedRulepackOwnerDecisions.Count} revised-calendar owner decision gate record(s) in the EPOCH App ledger.";
        RevisedRulepackOwnerDecisionLocation = revisedRulepackOwnerDecisionPath;
        RevisedRulepackOwnerDecisionStatus = revisedRulepackOwnerDecision is not null
            ? $"Latest owner decision {revisedRulepackOwnerDecision.DecisionId}: {revisedRulepackOwnerDecision.Status}; conversion logic enabled: {revisedRulepackOwnerDecision.ConversionLogicEnabled.ToString().ToLowerInvariant()}; missing approvals: {revisedRulepackOwnerDecision.MissingApprovalCount}."
            : "No revised-calendar owner decision gate record was written in this shell load.";
        RevisedRulepackOwnerDecisionMessage = revisedRulepackOwnerDecision is not null
            ? revisedRulepackOwnerDecision.CustomerSafeStatus
            : "The revised-calendar rulepack stays held until owner decisions are recorded.";
        RevisedRulepackApprovalReceiptCount = revisedRulepackApprovalReceipts.Count;
        RevisedRulepackApprovalReceiptSummary = $"{revisedRulepackApprovalReceipts.Count} revised-calendar approval receipt(s) ready for customer-safe Webportal import.";
        RevisedRulepackApprovalReceiptLocation = revisedRulepackApprovalReceiptPath;
        RevisedRulepackApprovalReceiptStatus = revisedRulepackApprovalReceipt is not null
            ? $"Latest approval receipt {revisedRulepackApprovalReceipt.ReceiptId}: {revisedRulepackApprovalReceipt.Status}; Webportal export ready: {revisedRulepackApprovalReceipt.WebportalExportReady.ToString().ToLowerInvariant()}."
            : "No customer-safe revised-calendar approval receipt was prepared in this shell load.";
        RevisedRulepackApprovalReceiptMessage = revisedRulepackApprovalReceipt is not null
            ? revisedRulepackApprovalReceipt.CustomerSafeMessage
            : "The revised-calendar approval Webportal status loop is waiting for an App-owned owner decision gate record.";
        RevisedAvailabilityExceptionCount = revisedAvailabilityExceptions.Count;
        RevisedAvailabilityExceptionSummary = $"{revisedAvailabilityExceptions.Count} recurring revised-calendar availability exception(s) in the EPOCH App ledger.";
        RevisedAvailabilityExceptionLocation = revisedAvailabilityExceptionPath;
        RevisedAvailabilityExceptionStatus = revisedAvailabilityException is not null
            ? $"Latest availability exception {revisedAvailabilityException.ExceptionId}: {revisedAvailabilityException.Status}; revised conversion ready: {revisedAvailabilityException.RevisedConversionReady.ToString().ToLowerInvariant()}."
            : "No recurring revised-calendar availability exception was prepared from EPOCH revised timing context.";
        RevisedAvailabilityExceptionReceiptCount = revisedAvailabilityExceptionReceipts.Count;
        RevisedAvailabilityExceptionReceiptSummary = $"{revisedAvailabilityExceptionReceipts.Count} revised availability exception receipt(s) ready for customer-safe Webportal import.";
        RevisedAvailabilityExceptionReceiptLocation = revisedAvailabilityExceptionReceiptPath;
        RevisedAvailabilityExceptionReceiptStatus = revisedAvailabilityExceptionReceipt is not null
            ? $"Latest availability exception receipt {revisedAvailabilityExceptionReceipt.ReceiptId}: {revisedAvailabilityExceptionReceipt.Status}; Webportal export ready: {revisedAvailabilityExceptionReceipt.WebportalExportReady.ToString().ToLowerInvariant()}."
            : "No customer-safe revised availability exception receipt was prepared in this shell load.";
        RevisedAvailabilityExceptionReceiptMessage = revisedAvailabilityExceptionReceipt is not null
            ? revisedAvailabilityExceptionReceipt.CustomerSafeMessage
            : "The revised availability exception Webportal status loop is waiting for customer-safe revised timing context.";
        RevisedReminderExecutionCount = revisedReminderExecutions.Count;
        RevisedReminderExecutionSummary = $"{revisedReminderExecutions.Count} revised-calendar reminder execution(s) in the EPOCH App ledger.";
        RevisedReminderExecutionLocation = revisedReminderExecutionPath;
        RevisedReminderExecutionStatus = revisedReminderExecution is not null
            ? $"Latest reminder execution {revisedReminderExecution.ExecutionId}: {revisedReminderExecution.Status}; notification sends enabled: {revisedReminderExecution.NotificationSendEnabled.ToString().ToLowerInvariant()}."
            : "No revised-calendar reminder execution was prepared from EPOCH revised timing context.";
        RevisedDeadlineExecutionCount = revisedDeadlineExecutions.Count;
        RevisedDeadlineExecutionSummary = $"{revisedDeadlineExecutions.Count} revised-calendar deadline execution(s) in the EPOCH App ledger.";
        RevisedDeadlineExecutionLocation = revisedDeadlineExecutionPath;
        RevisedDeadlineExecutionStatus = revisedDeadlineExecution is not null
            ? $"Latest deadline execution {revisedDeadlineExecution.ExecutionId}: {revisedDeadlineExecution.Health}; provider calls enabled: {revisedDeadlineExecution.ProviderCallsEnabled.ToString().ToLowerInvariant()}."
            : "No revised-calendar deadline execution was prepared from EPOCH revised timing context.";
        RevisedDeadlineEscalationCount = revisedDeadlineEscalations.Count;
        RevisedDeadlineEscalationSummary = $"{revisedDeadlineEscalations.Count} revised-calendar deadline escalation(s) in the EPOCH App ledger.";
        RevisedDeadlineEscalationLocation = revisedDeadlineEscalationPath;
        RevisedDeadlineEscalationStatus = revisedDeadlineEscalation is not null
            ? $"Latest escalation {revisedDeadlineEscalation.EscalationId}: {revisedDeadlineEscalation.Status}; MONITOR workflow exposed: {revisedDeadlineEscalation.MonitorWorkflowExposed.ToString().ToLowerInvariant()}."
            : "No revised-calendar deadline escalation was prepared from EPOCH revised timing context.";
        RevisedReminderDeadlineReceiptCount = revisedReminderDeadlineReceipts.Count;
        RevisedReminderDeadlineReceiptSummary = $"{revisedReminderDeadlineReceipts.Count} revised reminder/deadline receipt(s) ready for customer-safe Webportal import.";
        RevisedReminderDeadlineReceiptLocation = revisedReminderDeadlineReceiptPath;
        RevisedReminderDeadlineReceiptStatus = revisedReminderDeadlineReceipt is not null
            ? $"Latest receipt {revisedReminderDeadlineReceipt.ReceiptId}: {revisedReminderDeadlineReceipt.Status}; Webportal export ready: {revisedReminderDeadlineReceipt.WebportalExportReady.ToString().ToLowerInvariant()}."
            : "No customer-safe revised reminder/deadline receipt was prepared in this shell load.";
    }

    public string ProductName { get; }
    public string CoreStatus { get; }
    public string CalendarSystem { get; }
    public string RevisedRulepackStatus { get; }
    public string ScheduleQueueStatus { get; }
    public string CustomerSafeStatus { get; }
    public string ModuleSummary { get; }
    public string RevisedCalendarShape { get; }
    public string RevisedCalendarAnchor { get; }
    public string RevisedCalendarIntercalaryPolicy { get; }
    public string RevisedCalendarGateReason { get; }
    public string RevisedCalendarBoundaryPolicies { get; }
    public string BoundaryStatus { get; }
    public string NativeSchedulerRelationshipSummary { get; }
    public string NativeSchedulerRequestRelationship { get; }
    public string NativeSchedulerAvailabilityRelationship { get; }
    public string NativeSchedulerRecurrenceRelationship { get; }
    public string NativeSchedulerPortalRelationship { get; }
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
    public int ScheduleLifecycleActionCount { get; }
    public string ScheduleLifecycleActionSummary { get; }
    public string ScheduleLifecycleActionLocation { get; }
    public string ScheduleLifecycleActionStatus { get; }
    public int ScheduleLifecycleReceiptCount { get; }
    public string ScheduleLifecycleReceiptSummary { get; }
    public string ScheduleLifecycleReceiptLocation { get; }
    public string ScheduleLifecycleReceiptStatus { get; }
    public int ScheduleLifecycleStatusCount { get; }
    public string ScheduleLifecycleStatusSummary { get; }
    public string ScheduleLifecycleStatusLocation { get; }
    public string ScheduleLifecycleStatusStatus { get; }
    public string ScheduleLifecycleStatusMessage { get; }
    public int RevisedTimingExportCount { get; }
    public string RevisedTimingExportSummary { get; }
    public string RevisedTimingExportLocation { get; }
    public string RevisedTimingExportStatus { get; }
    public int RevisedRulepackOwnerDecisionCount { get; }
    public string RevisedRulepackOwnerDecisionSummary { get; }
    public string RevisedRulepackOwnerDecisionLocation { get; }
    public string RevisedRulepackOwnerDecisionStatus { get; }
    public string RevisedRulepackOwnerDecisionMessage { get; }
    public int RevisedRulepackApprovalReceiptCount { get; }
    public string RevisedRulepackApprovalReceiptSummary { get; }
    public string RevisedRulepackApprovalReceiptLocation { get; }
    public string RevisedRulepackApprovalReceiptStatus { get; }
    public string RevisedRulepackApprovalReceiptMessage { get; }
    public int RevisedAvailabilityExceptionCount { get; }
    public string RevisedAvailabilityExceptionSummary { get; }
    public string RevisedAvailabilityExceptionLocation { get; }
    public string RevisedAvailabilityExceptionStatus { get; }
    public int RevisedAvailabilityExceptionReceiptCount { get; }
    public string RevisedAvailabilityExceptionReceiptSummary { get; }
    public string RevisedAvailabilityExceptionReceiptLocation { get; }
    public string RevisedAvailabilityExceptionReceiptStatus { get; }
    public string RevisedAvailabilityExceptionReceiptMessage { get; }
    public int RevisedReminderExecutionCount { get; }
    public string RevisedReminderExecutionSummary { get; }
    public string RevisedReminderExecutionLocation { get; }
    public string RevisedReminderExecutionStatus { get; }
    public int RevisedDeadlineExecutionCount { get; }
    public string RevisedDeadlineExecutionSummary { get; }
    public string RevisedDeadlineExecutionLocation { get; }
    public string RevisedDeadlineExecutionStatus { get; }
    public int RevisedDeadlineEscalationCount { get; }
    public string RevisedDeadlineEscalationSummary { get; }
    public string RevisedDeadlineEscalationLocation { get; }
    public string RevisedDeadlineEscalationStatus { get; }
    public int RevisedReminderDeadlineReceiptCount { get; }
    public string RevisedReminderDeadlineReceiptSummary { get; }
    public string RevisedReminderDeadlineReceiptLocation { get; }
    public string RevisedReminderDeadlineReceiptStatus { get; }

    public static MainWindowViewModel Load()
    {
        EpochWebportalScheduleRequest? inboxRequest = null;
        EpochScheduleRequestInboxStore.TryEnsureDefaultWebportalRequest(out inboxRequest);
        IReadOnlyList<EpochWebportalScheduleRequest> requestInbox = EpochScheduleRequestInboxStore.Load();
        EpochScheduleLifecycleAction? lifecycleAction = null;
        EpochScheduleLifecycleActionStore.TryEnsureDefaultLifecycleAction(out lifecycleAction);
        IReadOnlyList<EpochScheduleLifecycleAction> lifecycleActions = EpochScheduleLifecycleActionStore.Load();

        EpochScheduleCommandResult commandPreview = EpochNative.LoadScheduleCommandOrFallback();
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
        EpochScheduleLifecycleReceipt? lifecycleReceipt = null;
        if (lifecycleAction is not null &&
            requestCommandReceipt is not null &&
            historyEntry is not null)
        {
            EpochScheduleLifecycleReceiptStore.TryAppend(
                lifecycleAction,
                requestCommandReceipt,
                historyEntry,
                out lifecycleReceipt);
        }

        IReadOnlyList<EpochScheduleLifecycleReceipt> lifecycleReceipts =
            EpochScheduleLifecycleReceiptStore.Load();
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
        EpochScheduleLifecycleStatusRecord? lifecycleStatus = null;
        if (lifecycleAction is not null && lifecycleReceipt is not null)
        {
            EpochScheduleLifecycleStatusStore.TryAppend(
                lifecycleAction,
                lifecycleReceipt,
                out lifecycleStatus);
        }

        IReadOnlyList<EpochScheduleLifecycleStatusRecord> lifecycleStatuses =
            EpochScheduleLifecycleStatusStore.Load();

        EpochShellSnapshot snapshot = EpochNative.LoadSnapshotOrFallback();
        EpochRevisedCalendarTimingExport? revisedTimingExport = null;
        EpochRevisedCalendarTimingExportStore.TryEnsureDefaultExport(
            snapshot,
            out revisedTimingExport);
        IReadOnlyList<EpochRevisedCalendarTimingExport> revisedTimingExports =
            EpochRevisedCalendarTimingExportStore.Load();
        EpochRevisedRulepackOwnerDecision? revisedRulepackOwnerDecision = null;
        EpochRevisedRulepackApprovalReceipt? revisedRulepackApprovalReceipt = null;
        EpochRevisedRulepackOwnerDecisionStore.TryEnsureDefaultDecision(
            snapshot,
            out revisedRulepackOwnerDecision);
        if (revisedRulepackOwnerDecision is not null)
        {
            EpochRevisedRulepackApprovalReceiptStore.TryEnsureDefaultReceipt(
                revisedRulepackOwnerDecision,
                out revisedRulepackApprovalReceipt);
        }

        IReadOnlyList<EpochRevisedRulepackOwnerDecision> revisedRulepackOwnerDecisions =
            EpochRevisedRulepackOwnerDecisionStore.Load();
        IReadOnlyList<EpochRevisedRulepackApprovalReceipt> revisedRulepackApprovalReceipts =
            EpochRevisedRulepackApprovalReceiptStore.Load();
        EpochRevisedAvailabilityException? revisedAvailabilityException = null;
        EpochRevisedAvailabilityExceptionReceipt? revisedAvailabilityExceptionReceipt = null;
        EpochRevisedReminderExecution? revisedReminderExecution = null;
        EpochRevisedDeadlineExecution? revisedDeadlineExecution = null;
        EpochRevisedDeadlineEscalation? revisedDeadlineEscalation = null;
        EpochRevisedReminderDeadlineReceipt? revisedReminderDeadlineReceipt = null;
        if (revisedTimingExport is not null && revisedTimingExport.CustomerSafe)
        {
            EpochRevisedAvailabilityExceptionStore.TryAppend(
                revisedTimingExport,
                commandPreview,
                out revisedAvailabilityException);
            EpochRevisedReminderExecutionStore.TryAppend(
                revisedTimingExport,
                out revisedReminderExecution);
            EpochRevisedDeadlineExecutionStore.TryAppend(
                revisedTimingExport,
                out revisedDeadlineExecution);
        }

        if (revisedAvailabilityException is not null)
        {
            EpochRevisedAvailabilityExceptionReceiptStore.TryAppend(
                revisedAvailabilityException,
                out revisedAvailabilityExceptionReceipt);
        }

        if (revisedReminderExecution is not null && revisedDeadlineExecution is not null)
        {
            EpochRevisedDeadlineEscalationStore.TryAppend(
                revisedReminderExecution,
                revisedDeadlineExecution,
                out revisedDeadlineEscalation);
        }

        if (revisedReminderExecution is not null &&
            revisedDeadlineExecution is not null &&
            revisedDeadlineEscalation is not null)
        {
            EpochRevisedReminderDeadlineReceiptStore.TryAppend(
                revisedReminderExecution,
                revisedDeadlineExecution,
                revisedDeadlineEscalation,
                out revisedReminderDeadlineReceipt);
        }

        IReadOnlyList<EpochRevisedReminderExecution> revisedReminderExecutions =
            EpochRevisedReminderExecutionStore.Load();
        IReadOnlyList<EpochRevisedAvailabilityException> revisedAvailabilityExceptions =
            EpochRevisedAvailabilityExceptionStore.Load();
        IReadOnlyList<EpochRevisedAvailabilityExceptionReceipt> revisedAvailabilityExceptionReceipts =
            EpochRevisedAvailabilityExceptionReceiptStore.Load();
        IReadOnlyList<EpochRevisedDeadlineExecution> revisedDeadlineExecutions =
            EpochRevisedDeadlineExecutionStore.Load();
        IReadOnlyList<EpochRevisedDeadlineEscalation> revisedDeadlineEscalations =
            EpochRevisedDeadlineEscalationStore.Load();
        IReadOnlyList<EpochRevisedReminderDeadlineReceipt> revisedReminderDeadlineReceipts =
            EpochRevisedReminderDeadlineReceiptStore.Load();

        return new MainWindowViewModel(
            snapshot,
            commandPreview,
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
            EpochCustomerScheduleStatusStore.StatusPath,
            lifecycleAction,
            lifecycleActions,
            EpochScheduleLifecycleActionStore.ActionPath,
            lifecycleReceipt,
            lifecycleReceipts,
            EpochScheduleLifecycleReceiptStore.ReceiptPath,
            lifecycleStatus,
            lifecycleStatuses,
            EpochScheduleLifecycleStatusStore.StatusPath,
            revisedTimingExport,
            revisedTimingExports,
            EpochRevisedCalendarTimingExportStore.ExportPath,
            revisedRulepackOwnerDecision,
            revisedRulepackOwnerDecisions,
            EpochRevisedRulepackOwnerDecisionStore.DecisionPath,
            revisedRulepackApprovalReceipt,
            revisedRulepackApprovalReceipts,
            EpochRevisedRulepackApprovalReceiptStore.ReceiptPath,
            revisedAvailabilityException,
            revisedAvailabilityExceptions,
            EpochRevisedAvailabilityExceptionStore.ExceptionPath,
            revisedAvailabilityExceptionReceipt,
            revisedAvailabilityExceptionReceipts,
            EpochRevisedAvailabilityExceptionReceiptStore.ReceiptPath,
            revisedReminderExecution,
            revisedReminderExecutions,
            EpochRevisedReminderExecutionStore.ExecutionPath,
            revisedDeadlineExecution,
            revisedDeadlineExecutions,
            EpochRevisedDeadlineExecutionStore.ExecutionPath,
            revisedDeadlineEscalation,
            revisedDeadlineEscalations,
            EpochRevisedDeadlineEscalationStore.EscalationPath,
            revisedReminderDeadlineReceipt,
            revisedReminderDeadlineReceipts,
            EpochRevisedReminderDeadlineReceiptStore.ReceiptPath);
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
