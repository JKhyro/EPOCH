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
                !File.Exists(EpochRevisedCalendarTimingExportStore.ExportPath))
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
