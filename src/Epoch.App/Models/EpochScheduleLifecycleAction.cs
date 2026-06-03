namespace Epoch.App;

public sealed record EpochScheduleLifecycleAction(
    string ActionId,
    string SubmittedAtUtc,
    string SourceSurface,
    string RequestId,
    string ActionKind,
    string RequestedWindow,
    string CustomerSafeReason,
    string Status,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool AppOwnedLifecycleState)
{
    public static EpochScheduleLifecycleAction FromLocalWebportalIntent(
        string actionId,
        string requestId,
        string actionKind,
        string requestedWindow,
        string customerSafeReason,
        DateTimeOffset submittedAtUtc)
    {
        return new EpochScheduleLifecycleAction(
            actionId,
            submittedAtUtc.ToString("O"),
            "EPOCH.Webportal.ScheduleLifecycleAdapter",
            requestId,
            actionKind,
            requestedWindow,
            customerSafeReason,
            $"{actionKind}-queued-for-app-review",
            "Schedule lifecycle action is queued for EPOCH App review. Provider calls remain disabled until operator approval.",
            true,
            false,
            false,
            true);
    }
}
