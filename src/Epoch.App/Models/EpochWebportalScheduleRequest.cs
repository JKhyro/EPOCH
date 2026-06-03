namespace Epoch.App;

public sealed record EpochWebportalScheduleRequest(
    string RequestId,
    string SubmittedAtUtc,
    string SourceSurface,
    string RequesterLabel,
    string NeedKind,
    string RequestedWindow,
    string Timezone,
    string Status,
    string CustomerSafeStatus,
    bool CustomerSafe,
    bool ProviderCallsEnabled,
    bool MonitorWorkflowExposed,
    bool AppOwnedInboxState)
{
    public static EpochWebportalScheduleRequest FromLocalWebportalIntent(
        string requestId,
        string requesterLabel,
        string needKind,
        string requestedWindow,
        string timezone,
        DateTimeOffset submittedAtUtc)
    {
        return new EpochWebportalScheduleRequest(
            requestId,
            submittedAtUtc.ToString("O"),
            "EPOCH.Webportal.LocalAdapter",
            requesterLabel,
            needKind,
            requestedWindow,
            timezone,
            "queued-for-app-review",
            "Your schedule request is in the EPOCH scheduling inbox. Provider calls remain disabled until operator approval.",
            true,
            false,
            false,
            true);
    }
}
