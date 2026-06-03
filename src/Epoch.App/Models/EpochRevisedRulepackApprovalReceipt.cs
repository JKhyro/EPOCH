namespace Epoch.App;

public sealed record EpochRevisedRulepackApprovalReceipt(
    string ReceiptId,
    string CreatedAtUtc,
    string SourceSurface,
    string DecisionId,
    string RulepackId,
    string CalendarSystem,
    string Kind,
    string Status,
    string Summary,
    string CustomerSafeMessage,
    string NextAction,
    bool CustomerSafe,
    bool CustomerVisibleReceiptReady,
    bool WebportalExportReady,
    bool RequiredApprovalsComplete,
    bool ConversionLogicEnabled,
    bool ConversionReady,
    bool ProviderCallsEnabled,
    bool ProviderGoLiveRequested,
    bool WorkshopCalendarOwnership,
    bool MonitorWorkflowExposed)
{
    public static EpochRevisedRulepackApprovalReceipt FromDecision(
        EpochRevisedRulepackOwnerDecision decision,
        string receiptId,
        DateTimeOffset createdAtUtc)
    {
        bool customerSafe =
            decision.CustomerSafe &&
            !decision.ProviderCallsEnabled &&
            !decision.ProviderGoLiveRequested &&
            !decision.WorkshopCalendarOwnership &&
            !decision.MonitorWorkflowExposed &&
            !decision.ConversionReady;

        return new EpochRevisedRulepackApprovalReceipt(
            receiptId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedRulepackApprovalReceipt",
            decision.DecisionId,
            decision.RulepackId,
            decision.CalendarSystem,
            "revised-rulepack-owner-decision",
            "customer-safe-revised-rulepack-approval-held",
            "EPOCH recorded the revised-calendar owner decision gate without enabling conversion, provider calls, WORKSHOP calendar ownership, or internal workflow exposure.",
            "Revised-calendar conversion is still held. EPOCH can show schedule-safe status, but authoritative revised-date conversion waits for owner-approved rules.",
            "Review the owner-approved rulepack decisions before enabling conversion logic or live provider calendar writes.",
            customerSafe,
            customerSafe,
            customerSafe,
            decision.RequiredApprovalsComplete,
            decision.ConversionLogicEnabled,
            decision.ConversionReady,
            decision.ProviderCallsEnabled,
            decision.ProviderGoLiveRequested,
            decision.WorkshopCalendarOwnership,
            decision.MonitorWorkflowExposed);
    }
}
