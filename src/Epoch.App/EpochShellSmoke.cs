using Epoch.App.Native;
using Epoch.App.Services;

namespace Epoch.App;

internal static class EpochShellSmoke
{
    public static int Run()
    {
        string? previousStateDirectory = Environment.GetEnvironmentVariable(
            EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable);
        string smokeStateDirectory = Path.Combine(
            Path.GetTempPath(),
            "Epoch.App.Smoke",
            Guid.NewGuid().ToString("N"));

        try
        {
            Environment.SetEnvironmentVariable(
                EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable,
                smokeStateDirectory);

            EpochShellSnapshot snapshot = EpochNative.LoadSnapshot();
            EpochScheduleCommandResult command = EpochNative.LoadScheduleCommand();
            EpochScheduleExecutionReceipt execution = EpochNative.ExecuteScheduleCommand("confirm-local-booking");
            EpochScheduleExecutionHistoryEntry historyEntry = EpochScheduleExecutionHistoryStore.Append(
                execution,
                "Epoch.App.Smoke");
            IReadOnlyList<EpochScheduleExecutionHistoryEntry> history = EpochScheduleExecutionHistoryStore.Load();
            EpochWebportalScheduleRequest inboxRequest = EpochScheduleRequestInboxStore.EnsureDefaultWebportalRequest();
            IReadOnlyList<EpochWebportalScheduleRequest> requestInbox = EpochScheduleRequestInboxStore.Load();
            EpochRequestScheduleCommandReceipt requestCommandReceipt =
                EpochRequestScheduleCommandReceiptStore.Append(inboxRequest, historyEntry, execution);
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
            EpochCustomerScheduleStatusRecord customerStatus =
                EpochCustomerScheduleStatusStore.Append(inboxRequest, requestCommandReceipt, historyEntry);
            IReadOnlyList<EpochCustomerScheduleStatusRecord> customerStatuses =
                EpochCustomerScheduleStatusStore.Load();
            EpochScheduleLifecycleAction lifecycleAction =
                EpochScheduleLifecycleActionStore.EnsureDefaultLifecycleAction();
            IReadOnlyList<EpochScheduleLifecycleAction> lifecycleActions =
                EpochScheduleLifecycleActionStore.Load();
            EpochScheduleLifecycleReceipt lifecycleReceipt =
                EpochScheduleLifecycleReceiptStore.Append(lifecycleAction, requestCommandReceipt, historyEntry);
            IReadOnlyList<EpochScheduleLifecycleReceipt> lifecycleReceipts =
                EpochScheduleLifecycleReceiptStore.Load();
            EpochScheduleLifecycleStatusRecord lifecycleStatus =
                EpochScheduleLifecycleStatusStore.Append(lifecycleAction, lifecycleReceipt);
            IReadOnlyList<EpochScheduleLifecycleStatusRecord> lifecycleStatuses =
                EpochScheduleLifecycleStatusStore.Load();
            EpochRevisedCalendarTimingExport revisedTimingExport =
                EpochRevisedCalendarTimingExportStore.EnsureDefaultExport(snapshot);
            IReadOnlyList<EpochRevisedCalendarTimingExport> revisedTimingExports =
                EpochRevisedCalendarTimingExportStore.Load();
            EpochRevisedRulepackOwnerDecision revisedRulepackOwnerDecision =
                EpochRevisedRulepackOwnerDecisionStore.EnsureDefaultDecision(snapshot);
            IReadOnlyList<EpochRevisedRulepackOwnerDecision> revisedRulepackOwnerDecisions =
                EpochRevisedRulepackOwnerDecisionStore.Load();
            EpochRevisedRulepackApprovalReceipt revisedRulepackApprovalReceipt =
                EpochRevisedRulepackApprovalReceiptStore.EnsureDefaultReceipt(revisedRulepackOwnerDecision);
            IReadOnlyList<EpochRevisedRulepackApprovalReceipt> revisedRulepackApprovalReceipts =
                EpochRevisedRulepackApprovalReceiptStore.Load();
            EpochRevisedAvailabilityException revisedAvailabilityException =
                EpochRevisedAvailabilityExceptionStore.Append(revisedTimingExport, command);
            IReadOnlyList<EpochRevisedAvailabilityException> revisedAvailabilityExceptions =
                EpochRevisedAvailabilityExceptionStore.Load();
            EpochRevisedAvailabilityExceptionReceipt revisedAvailabilityExceptionReceipt =
                EpochRevisedAvailabilityExceptionReceiptStore.Append(revisedAvailabilityException);
            IReadOnlyList<EpochRevisedAvailabilityExceptionReceipt> revisedAvailabilityExceptionReceipts =
                EpochRevisedAvailabilityExceptionReceiptStore.Load();
            EpochRevisedReminderExecution revisedReminderExecution =
                EpochRevisedReminderExecutionStore.Append(revisedTimingExport);
            IReadOnlyList<EpochRevisedReminderExecution> revisedReminderExecutions =
                EpochRevisedReminderExecutionStore.Load();
            EpochRevisedDeadlineExecution revisedDeadlineExecution =
                EpochRevisedDeadlineExecutionStore.Append(revisedTimingExport);
            IReadOnlyList<EpochRevisedDeadlineExecution> revisedDeadlineExecutions =
                EpochRevisedDeadlineExecutionStore.Load();
            EpochRevisedDeadlineEscalation revisedDeadlineEscalation =
                EpochRevisedDeadlineEscalationStore.Append(revisedReminderExecution, revisedDeadlineExecution);
            IReadOnlyList<EpochRevisedDeadlineEscalation> revisedDeadlineEscalations =
                EpochRevisedDeadlineEscalationStore.Load();
            EpochRevisedReminderDeadlineReceipt revisedReminderDeadlineReceipt =
                EpochRevisedReminderDeadlineReceiptStore.Append(
                    revisedReminderExecution,
                    revisedDeadlineExecution,
                    revisedDeadlineEscalation);
            IReadOnlyList<EpochRevisedReminderDeadlineReceipt> revisedReminderDeadlineReceipts =
                EpochRevisedReminderDeadlineReceiptStore.Load();

            if (snapshot.ProductName != "EPOCH" ||
                snapshot.CoreStatus != "native-core-ready" ||
                snapshot.RevisedMonthCount != 13 ||
                snapshot.RevisedDaysPerMonth != 28 ||
                snapshot.RevisedCommonIntercalaryDays != 1 ||
                snapshot.RevisedLeapIntercalaryDays != 2 ||
                !snapshot.RevisedConstraintsCustomerSafe ||
                snapshot.RevisedAnchorMethod != "measured-average-first-spring-day" ||
                snapshot.RevisedAnchorSource != "owner-physical-measurement-required" ||
                !snapshot.RevisedYearOpeningPolicy.Contains("outside the 13 months", StringComparison.Ordinal) ||
                !snapshot.RevisedLeapDayPolicy.Contains("end of year", StringComparison.Ordinal) ||
                !snapshot.RevisedIntercalaryPolicy.Contains("leap years have 2 days outside months", StringComparison.Ordinal) ||
                !snapshot.RevisedConversionGateReason.Contains("owner-approved physical spring anchor", StringComparison.Ordinal) ||
                snapshot.RevisedConversionReady ||
                !snapshot.MonitorBoundaryEnforced ||
                !command.NativeCommandReady ||
                command.TimingReturnStatus != "returned" ||
                command.BookingConfirmationId != "epoch-command-booking-001" ||
                command.ReceiptId != "epoch-command-receipt-001" ||
                !execution.NativeExecutionReady ||
                !execution.ExecutedLocally ||
                execution.ProviderCallsEnabled ||
                execution.MonitorWorkflowExposed ||
                execution.ExecutionStatus != "complete" ||
                execution.BookingReceiptId != "epoch-exec-receipt-001" ||
                history.Count != 1 ||
                history[0].HistoryId != historyEntry.HistoryId ||
                history[0].BookingReceiptId != "epoch-exec-receipt-001" ||
                history[0].ProviderCallsEnabled ||
                history[0].MonitorWorkflowExposed ||
                !File.Exists(EpochScheduleExecutionHistoryStore.HistoryPath) ||
                requestInbox.Count != 1 ||
                requestInbox[0].RequestId != inboxRequest.RequestId ||
                !requestInbox[0].CustomerSafe ||
                requestInbox[0].ProviderCallsEnabled ||
                requestInbox[0].MonitorWorkflowExposed ||
                !requestInbox[0].AppOwnedInboxState ||
                !File.Exists(EpochScheduleRequestInboxStore.InboxPath) ||
                requestCommandReceipts.Count != 1 ||
                requestCommandReceipts[0].ReceiptId != requestCommandReceipt.ReceiptId ||
                requestCommandReceipts[0].RequestId != inboxRequest.RequestId ||
                requestCommandReceipts[0].ExecutionHistoryId != historyEntry.HistoryId ||
                !requestCommandReceipts[0].CustomerSafe ||
                requestCommandReceipts[0].ProviderCallsEnabled ||
                requestCommandReceipts[0].MonitorWorkflowExposed ||
                !requestCommandReceipts[0].NativeExecutionReady ||
                !File.Exists(EpochRequestScheduleCommandReceiptStore.ReceiptPath) ||
                !operationsBoard.ReadyForOperatorReview ||
                operationsBoard.ProviderCallsEnabled ||
                operationsBoard.MonitorWorkflowExposed ||
                !operationsBoard.CustomerSafeChain ||
                operationsBoard.BoardStatus != "schedule operations board ready" ||
                !operationsBoard.OperatorNextAction.Contains("approve the next EPOCH-owned scheduling transition", StringComparison.Ordinal) ||
                !operationsBoard.QueueSummary.Contains("1 inbox request", StringComparison.Ordinal) ||
                !operationsBoard.SafetySummary.Contains("Provider calls enabled: false", StringComparison.Ordinal) ||
                !operationsBoard.LedgerSummary.Contains(EpochScheduleExecutionHistoryStore.HistoryPath, StringComparison.Ordinal) ||
                customerStatuses.Count != 1 ||
                customerStatuses[0].StatusId != customerStatus.StatusId ||
                customerStatuses[0].RequestId != inboxRequest.RequestId ||
                !customerStatuses[0].CustomerSafe ||
                !customerStatuses[0].WebportalExportReady ||
                customerStatuses[0].ProviderCallsEnabled ||
                customerStatuses[0].MonitorWorkflowExposed ||
                !customerStatuses[0].CustomerSafeMessage.Contains("External calendar provider calls remain disabled", StringComparison.Ordinal) ||
                !File.Exists(EpochCustomerScheduleStatusStore.StatusPath) ||
                lifecycleActions.Count != 1 ||
                lifecycleActions[0].ActionId != lifecycleAction.ActionId ||
                !lifecycleActions[0].CustomerSafe ||
                lifecycleActions[0].ProviderCallsEnabled ||
                lifecycleActions[0].MonitorWorkflowExposed ||
                !lifecycleActions[0].AppOwnedLifecycleState ||
                !File.Exists(EpochScheduleLifecycleActionStore.ActionPath) ||
                lifecycleReceipts.Count != 1 ||
                lifecycleReceipts[0].ReceiptId != lifecycleReceipt.ReceiptId ||
                lifecycleReceipts[0].ActionId != lifecycleAction.ActionId ||
                lifecycleReceipts[0].RequestCommandReceiptId != requestCommandReceipt.ReceiptId ||
                !lifecycleReceipts[0].CustomerSafe ||
                lifecycleReceipts[0].ProviderCallsEnabled ||
                lifecycleReceipts[0].MonitorWorkflowExposed ||
                !lifecycleReceipts[0].NativeExecutionReady ||
                !File.Exists(EpochScheduleLifecycleReceiptStore.ReceiptPath) ||
                lifecycleStatuses.Count != 1 ||
                lifecycleStatuses[0].StatusId != lifecycleStatus.StatusId ||
                lifecycleStatuses[0].ActionId != lifecycleAction.ActionId ||
                !lifecycleStatuses[0].CustomerSafe ||
                !lifecycleStatuses[0].WebportalExportReady ||
                lifecycleStatuses[0].ProviderCallsEnabled ||
                lifecycleStatuses[0].MonitorWorkflowExposed ||
                !lifecycleStatuses[0].CustomerSafeMessage.Contains("External calendar provider calls remain disabled", StringComparison.Ordinal) ||
                !File.Exists(EpochScheduleLifecycleStatusStore.StatusPath) ||
                revisedTimingExports.Count != 1 ||
                revisedTimingExports[0].PayloadId != revisedTimingExport.PayloadId ||
                revisedTimingExports[0].CalendarSystemLabel != "revised-13-month" ||
                revisedTimingExports[0].ProviderGoLiveRequested ||
                !revisedTimingExports[0].EpochTimingProviderOnly ||
                revisedTimingExports[0].WorkshopCalendarOwnership ||
                revisedTimingExports[0].MonitorWorkflowExposed ||
                !revisedTimingExports[0].CustomerSafe ||
                !revisedTimingExports[0].ConversionGateReason.Contains("owner-approved physical spring anchor", StringComparison.Ordinal) ||
                !File.Exists(EpochRevisedCalendarTimingExportStore.ExportPath) ||
                revisedRulepackOwnerDecisions.Count != 1 ||
                revisedRulepackOwnerDecisions[0].DecisionId != revisedRulepackOwnerDecision.DecisionId ||
                revisedRulepackOwnerDecisions[0].Status != "owner-decision-required" ||
                revisedRulepackOwnerDecisions[0].OwnerApproved ||
                revisedRulepackOwnerDecisions[0].MonthNamesApproved ||
                revisedRulepackOwnerDecisions[0].DayDistributionApproved ||
                revisedRulepackOwnerDecisions[0].IntercalaryDaysApproved ||
                revisedRulepackOwnerDecisions[0].LeapRuleApproved ||
                revisedRulepackOwnerDecisions[0].EpochAnchorApproved ||
                revisedRulepackOwnerDecisions[0].DayOfWeekMappingApproved ||
                revisedRulepackOwnerDecisions[0].FormattingRulesApproved ||
                revisedRulepackOwnerDecisions[0].TimezoneBoundaryApproved ||
                revisedRulepackOwnerDecisions[0].RecurrenceMappingApproved ||
                revisedRulepackOwnerDecisions[0].PublicDisplayWordingApproved ||
                revisedRulepackOwnerDecisions[0].StorageIdentifierApproved ||
                revisedRulepackOwnerDecisions[0].ConversionRulesApproved ||
                revisedRulepackOwnerDecisions[0].ConversionLogicEnabled ||
                revisedRulepackOwnerDecisions[0].RequiredApprovalsComplete ||
                revisedRulepackOwnerDecisions[0].ConversionReady ||
                revisedRulepackOwnerDecisions[0].ProviderCallsEnabled ||
                revisedRulepackOwnerDecisions[0].ProviderGoLiveRequested ||
                revisedRulepackOwnerDecisions[0].WorkshopCalendarOwnership ||
                revisedRulepackOwnerDecisions[0].MonitorWorkflowExposed ||
                !revisedRulepackOwnerDecisions[0].CustomerSafe ||
                !revisedRulepackOwnerDecisions[0].WebportalExportReady ||
                !revisedRulepackOwnerDecisions[0].MissingApprovalSummary.Contains("physical spring anchor", StringComparison.Ordinal) ||
                !File.Exists(EpochRevisedRulepackOwnerDecisionStore.DecisionPath) ||
                revisedRulepackApprovalReceipts.Count != 1 ||
                revisedRulepackApprovalReceipts[0].ReceiptId != revisedRulepackApprovalReceipt.ReceiptId ||
                revisedRulepackApprovalReceipts[0].DecisionId != revisedRulepackOwnerDecision.DecisionId ||
                revisedRulepackApprovalReceipts[0].Kind != "revised-rulepack-owner-decision" ||
                revisedRulepackApprovalReceipts[0].Status != "customer-safe-revised-rulepack-approval-held" ||
                revisedRulepackApprovalReceipts[0].RequiredApprovalsComplete ||
                revisedRulepackApprovalReceipts[0].ConversionLogicEnabled ||
                revisedRulepackApprovalReceipts[0].ConversionReady ||
                revisedRulepackApprovalReceipts[0].ProviderCallsEnabled ||
                revisedRulepackApprovalReceipts[0].ProviderGoLiveRequested ||
                revisedRulepackApprovalReceipts[0].WorkshopCalendarOwnership ||
                revisedRulepackApprovalReceipts[0].MonitorWorkflowExposed ||
                !revisedRulepackApprovalReceipts[0].CustomerSafe ||
                !revisedRulepackApprovalReceipts[0].CustomerVisibleReceiptReady ||
                !revisedRulepackApprovalReceipts[0].WebportalExportReady ||
                !revisedRulepackApprovalReceipts[0].NextAction.Contains("owner-approved rulepack", StringComparison.Ordinal) ||
                !File.Exists(EpochRevisedRulepackApprovalReceiptStore.ReceiptPath) ||
                revisedAvailabilityExceptions.Count != 1 ||
                revisedAvailabilityExceptions[0].ExceptionId != revisedAvailabilityException.ExceptionId ||
                revisedAvailabilityExceptions[0].RevisedTimingPayloadId != revisedTimingExport.PayloadId ||
                revisedAvailabilityExceptions[0].AvailabilityWindowId != command.AvailabilityWindowId ||
                revisedAvailabilityExceptions[0].NativeScheduleRequestId != command.RequestId ||
                revisedAvailabilityExceptions[0].ProviderCallsEnabled ||
                revisedAvailabilityExceptions[0].NotificationSendEnabled ||
                revisedAvailabilityExceptions[0].MonitorWorkflowExposed ||
                revisedAvailabilityExceptions[0].WorkshopCalendarOwnership ||
                revisedAvailabilityExceptions[0].RevisedConversionReady ||
                !revisedAvailabilityExceptions[0].CustomerSafe ||
                !revisedAvailabilityExceptions[0].WebportalExportReady ||
                !revisedAvailabilityExceptions[0].RecurringExceptionReady ||
                !revisedAvailabilityExceptions[0].AvailabilityExceptionReady ||
                !File.Exists(EpochRevisedAvailabilityExceptionStore.ExceptionPath) ||
                revisedAvailabilityExceptionReceipts.Count != 1 ||
                revisedAvailabilityExceptionReceipts[0].ReceiptId != revisedAvailabilityExceptionReceipt.ReceiptId ||
                revisedAvailabilityExceptionReceipts[0].ExceptionId != revisedAvailabilityException.ExceptionId ||
                revisedAvailabilityExceptionReceipts[0].Kind != "revised-availability-exception" ||
                revisedAvailabilityExceptionReceipts[0].Status != "customer-safe-revised-availability-exception-ready" ||
                revisedAvailabilityExceptionReceipts[0].ProviderCallsEnabled ||
                revisedAvailabilityExceptionReceipts[0].NotificationSendEnabled ||
                revisedAvailabilityExceptionReceipts[0].MonitorWorkflowExposed ||
                revisedAvailabilityExceptionReceipts[0].WorkshopCalendarOwnership ||
                revisedAvailabilityExceptionReceipts[0].RevisedConversionReady ||
                !revisedAvailabilityExceptionReceipts[0].CustomerSafe ||
                !revisedAvailabilityExceptionReceipts[0].WebportalExportReady ||
                !revisedAvailabilityExceptionReceipts[0].CustomerSafeMessage.Contains("owner-gated", StringComparison.Ordinal) ||
                !File.Exists(EpochRevisedAvailabilityExceptionReceiptStore.ReceiptPath) ||
                revisedReminderExecutions.Count != 1 ||
                revisedReminderExecutions[0].ExecutionId != revisedReminderExecution.ExecutionId ||
                revisedReminderExecutions[0].RevisedTimingPayloadId != revisedTimingExport.PayloadId ||
                revisedReminderExecutions[0].NotificationSendEnabled ||
                revisedReminderExecutions[0].ProviderCallsEnabled ||
                revisedReminderExecutions[0].MonitorWorkflowExposed ||
                revisedReminderExecutions[0].WorkshopCalendarOwnership ||
                !revisedReminderExecutions[0].CustomerSafe ||
                !revisedReminderExecutions[0].WebportalExportReady ||
                !File.Exists(EpochRevisedReminderExecutionStore.ExecutionPath) ||
                revisedDeadlineExecutions.Count != 1 ||
                revisedDeadlineExecutions[0].ExecutionId != revisedDeadlineExecution.ExecutionId ||
                revisedDeadlineExecutions[0].Health != "conversion-held-watch" ||
                revisedDeadlineExecutions[0].NotificationSendEnabled ||
                revisedDeadlineExecutions[0].ProviderCallsEnabled ||
                revisedDeadlineExecutions[0].MonitorWorkflowExposed ||
                revisedDeadlineExecutions[0].WorkshopCalendarOwnership ||
                !revisedDeadlineExecutions[0].CustomerSafe ||
                !revisedDeadlineExecutions[0].WebportalExportReady ||
                !File.Exists(EpochRevisedDeadlineExecutionStore.ExecutionPath) ||
                revisedDeadlineEscalations.Count != 1 ||
                revisedDeadlineEscalations[0].EscalationId != revisedDeadlineEscalation.EscalationId ||
                revisedDeadlineEscalations[0].ReminderExecutionId != revisedReminderExecution.ExecutionId ||
                revisedDeadlineEscalations[0].DeadlineExecutionId != revisedDeadlineExecution.ExecutionId ||
                revisedDeadlineEscalations[0].NotificationSendEnabled ||
                revisedDeadlineEscalations[0].ProviderCallsEnabled ||
                revisedDeadlineEscalations[0].MonitorWorkflowExposed ||
                revisedDeadlineEscalations[0].WorkshopCalendarOwnership ||
                !revisedDeadlineEscalations[0].CustomerSafe ||
                !revisedDeadlineEscalations[0].WebportalExportReady ||
                !File.Exists(EpochRevisedDeadlineEscalationStore.EscalationPath) ||
                revisedReminderDeadlineReceipts.Count != 1 ||
                revisedReminderDeadlineReceipts[0].ReceiptId != revisedReminderDeadlineReceipt.ReceiptId ||
                revisedReminderDeadlineReceipts[0].Kind != "revised-reminder-deadline-execution" ||
                revisedReminderDeadlineReceipts[0].Status != "customer-safe-revised-deadline-status-ready" ||
                revisedReminderDeadlineReceipts[0].NotificationSendEnabled ||
                revisedReminderDeadlineReceipts[0].ProviderCallsEnabled ||
                revisedReminderDeadlineReceipts[0].MonitorWorkflowExposed ||
                revisedReminderDeadlineReceipts[0].WorkshopCalendarOwnership ||
                !revisedReminderDeadlineReceipts[0].CustomerSafe ||
                !revisedReminderDeadlineReceipts[0].WebportalExportReady ||
                !revisedReminderDeadlineReceipts[0].CustomerSafeMessage.Contains("No notification was sent", StringComparison.Ordinal) ||
                !File.Exists(EpochRevisedReminderDeadlineReceiptStore.ReceiptPath))
            {
                return 2;
            }

            return 0;
        }
        catch
        {
            return 1;
        }
        finally
        {
            Environment.SetEnvironmentVariable(
                EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable,
                previousStateDirectory);

            try
            {
                if (Directory.Exists(smokeStateDirectory))
                {
                    Directory.Delete(smokeStateDirectory, true);
                }
            }
            catch (IOException)
            {
                // Smoke state is isolated under the temp directory and can be cleaned later.
            }
        }
    }
}
