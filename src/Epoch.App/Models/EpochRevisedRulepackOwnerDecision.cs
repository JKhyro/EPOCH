namespace Epoch.App;

public sealed record EpochRevisedRulepackOwnerDecision(
    string DecisionId,
    string CreatedAtUtc,
    string SourceSurface,
    string RulepackId,
    string VersionId,
    string CalendarSystem,
    string Status,
    string DecisionSummary,
    string CustomerSafeStatus,
    string MissingApprovalSummary,
    string OperatorNextAction,
    int MissingApprovalCount,
    bool OwnerApproved,
    bool MonthNamesApproved,
    bool DayDistributionApproved,
    bool IntercalaryDaysApproved,
    bool LeapRuleApproved,
    bool EpochAnchorApproved,
    bool DayOfWeekMappingApproved,
    bool FormattingRulesApproved,
    bool TimezoneBoundaryApproved,
    bool RecurrenceMappingApproved,
    bool PublicDisplayWordingApproved,
    bool StorageIdentifierApproved,
    bool ConversionRulesApproved,
    bool ConversionLogicEnabled,
    bool RequiredApprovalsComplete,
    bool ConversionReady,
    bool CustomerSafe,
    bool WebportalExportReady,
    bool ProviderCallsEnabled,
    bool ProviderGoLiveRequested,
    bool WorkshopCalendarOwnership,
    bool MonitorWorkflowExposed)
{
    public static EpochRevisedRulepackOwnerDecision FromSnapshot(
        EpochShellSnapshot snapshot,
        string decisionId,
        DateTimeOffset createdAtUtc)
    {
        const int missingApprovalCount = 13;
        const bool conversionLogicEnabled = false;
        const bool requiredApprovalsComplete = false;
        bool customerSafe =
            snapshot.RevisedConstraintsCustomerSafe &&
            !snapshot.RevisedConversionReady &&
            snapshot.MonitorBoundaryEnforced;

        return new EpochRevisedRulepackOwnerDecision(
            decisionId,
            createdAtUtc.ToString("O"),
            "EPOCH.App.RevisedRulepackOwnerDecision",
            "EPOCH-RULEPACK-DRAFT-001",
            "owner-approved-rulepack-required",
            snapshot.CalendarSystem,
            "owner-decision-required",
            "EPOCH recorded the revised 13-month calendar rulepack as structurally represented but still blocked for authoritative conversion.",
            "Revised-calendar conversion remains inactive until the owner-approved physical spring anchor, display wording, recurrence behavior, storage identifier, and conversion rules are complete.",
            "Missing owner approvals include the physical spring anchor source, month and intercalary day names, leap rule, day-of-week mapping, timezone boundaries, recurrence mapping, public wording, storage identifier, and conversion rules.",
            "Record explicit owner approval decisions before enabling revised-calendar conversion logic or any live provider calendar write.",
            missingApprovalCount,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            conversionLogicEnabled,
            requiredApprovalsComplete,
            requiredApprovalsComplete &&
                conversionLogicEnabled &&
                snapshot.RevisedConversionReady,
            customerSafe,
            customerSafe,
            false,
            false,
            false,
            false);
    }
}
