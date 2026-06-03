namespace Epoch.App;

public sealed record EpochScheduleOperationsBoardSnapshot(
    string BoardStatus,
    string OperatorNextAction,
    string QueueSummary,
    string LatestRequestStatus,
    string LatestCommandStatus,
    string LatestExecutionStatus,
    string SafetySummary,
    string LedgerSummary,
    bool ReadyForOperatorReview,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool CustomerSafeChain)
{
    public static EpochScheduleOperationsBoardSnapshot FromLedgers(
        IReadOnlyList<EpochWebportalScheduleRequest> requestInbox,
        IReadOnlyList<EpochRequestScheduleCommandReceipt> requestCommandReceipts,
        IReadOnlyList<EpochScheduleExecutionHistoryEntry> executionHistory,
        string requestInboxPath,
        string requestCommandReceiptPath,
        string executionHistoryPath)
    {
        EpochWebportalScheduleRequest? latestRequest = requestInbox.LastOrDefault();
        EpochRequestScheduleCommandReceipt? latestCommand = requestCommandReceipts.LastOrDefault();
        EpochScheduleExecutionHistoryEntry? latestExecution = executionHistory.LastOrDefault();

        bool providerCallsEnabled =
            requestInbox.Any(request => request.ProviderCallsEnabled) ||
            requestCommandReceipts.Any(receipt => receipt.ProviderCallsEnabled) ||
            executionHistory.Any(entry => entry.ProviderCallsEnabled);

        bool monitorWorkflowExposed =
            requestInbox.Any(request => request.MonitorWorkflowExposed) ||
            requestCommandReceipts.Any(receipt => receipt.MonitorWorkflowExposed) ||
            executionHistory.Any(entry => entry.MonitorWorkflowExposed);

        bool customerSafeChain =
            requestInbox.Count > 0 &&
            requestCommandReceipts.Count > 0 &&
            executionHistory.Count > 0 &&
            requestInbox.All(request => request.CustomerSafe) &&
            requestCommandReceipts.All(receipt => receipt.CustomerSafe) &&
            executionHistory.All(entry => entry.NativeExecutionReady);

        bool readyForOperatorReview =
            customerSafeChain &&
            !providerCallsEnabled &&
            !monitorWorkflowExposed &&
            latestRequest is not null &&
            latestCommand is not null &&
            latestExecution is not null &&
            latestCommand.RequestId == latestRequest.RequestId &&
            latestCommand.ExecutionHistoryId == latestExecution.HistoryId;

        string boardStatus = readyForOperatorReview
            ? "schedule operations board ready"
            : "schedule operations board awaiting local scheduling records";

        string nextAction = ResolveNextAction(
            latestRequest,
            latestCommand,
            latestExecution,
            providerCallsEnabled,
            monitorWorkflowExposed,
            customerSafeChain);

        return new EpochScheduleOperationsBoardSnapshot(
            boardStatus,
            nextAction,
            $"{requestInbox.Count} inbox request(s), {requestCommandReceipts.Count} request-command receipt(s), {executionHistory.Count} native execution history item(s).",
            latestRequest is not null
                ? $"Latest request {latestRequest.RequestId}: {latestRequest.NeedKind}; {latestRequest.Status}; {latestRequest.RequestedWindow}."
                : "No Webportal schedule request is available in the App inbox.",
            latestCommand is not null
                ? $"Latest command link {latestCommand.ReceiptId}: request {latestCommand.RequestId} -> native history {latestCommand.ExecutionHistoryId}; status {latestCommand.Status}."
                : "No request-to-native command receipt is available.",
            latestExecution is not null
                ? $"Latest native execution {latestExecution.HistoryId}: {latestExecution.IntentKind}; {latestExecution.ExecutionStatus}; booking receipt {latestExecution.BookingReceiptId}."
                : "No native scheduling execution history is available.",
            $"Provider calls enabled: {providerCallsEnabled.ToString().ToLowerInvariant()}; MONITOR workflow exposed: {monitorWorkflowExposed.ToString().ToLowerInvariant()}; customer-safe chain: {customerSafeChain.ToString().ToLowerInvariant()}.",
            $"Inbox: {requestInboxPath}; command links: {requestCommandReceiptPath}; execution history: {executionHistoryPath}.",
            readyForOperatorReview,
            providerCallsEnabled,
            monitorWorkflowExposed,
            customerSafeChain);
    }

    private static string ResolveNextAction(
        EpochWebportalScheduleRequest? latestRequest,
        EpochRequestScheduleCommandReceipt? latestCommand,
        EpochScheduleExecutionHistoryEntry? latestExecution,
        bool providerCallsEnabled,
        bool monitorWorkflowExposed,
        bool customerSafeChain)
    {
        if (providerCallsEnabled)
        {
            return "Block live provider calls and return the schedule path to local-only App review.";
        }

        if (monitorWorkflowExposed)
        {
            return "Move scheduling workflow exposure out of MONITOR and back into the EPOCH App/Webportal.";
        }

        if (latestRequest is null)
        {
            return "Import or create a customer-safe Webportal schedule request in the EPOCH App inbox.";
        }

        if (latestExecution is null)
        {
            return "Run the local native scheduling command before linking the request to a command receipt.";
        }

        if (latestCommand is null)
        {
            return "Link the Webportal request to the native scheduling execution receipt.";
        }

        if (!customerSafeChain)
        {
            return "Review the request, command link, and execution history for customer-safe status before operator approval.";
        }

        if (latestCommand.RequestId != latestRequest.RequestId ||
            latestCommand.ExecutionHistoryId != latestExecution.HistoryId)
        {
            return "Reconcile the latest request-command link with the latest native execution history item.";
        }

        return "Review the linked request and native execution, then approve the next EPOCH-owned scheduling transition.";
    }
}
