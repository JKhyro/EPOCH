using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochScheduleRequestInboxStore
{
    public const string InboxFileName = "schedule-request-inbox.json";

    private const string DefaultRequestId = "epoch-webportal-request-001";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string InboxPath => Path.Combine(ResolveStateDirectory(), InboxFileName);

    public static IReadOnlyList<EpochWebportalScheduleRequest> Load()
    {
        string path = InboxPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochWebportalScheduleRequest>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochWebportalScheduleRequest>? entries =
                JsonSerializer.Deserialize<List<EpochWebportalScheduleRequest>>(json, JsonOptions);

            if (entries is not null)
            {
                return entries;
            }

            return Array.Empty<EpochWebportalScheduleRequest>();
        }
        catch (JsonException)
        {
            ArchiveInvalidInbox(path);
            return Array.Empty<EpochWebportalScheduleRequest>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochWebportalScheduleRequest>();
        }
    }

    public static EpochWebportalScheduleRequest EnsureDefaultWebportalRequest()
    {
        List<EpochWebportalScheduleRequest> inbox = Load().ToList();
        EpochWebportalScheduleRequest? existing = inbox.FirstOrDefault(request => request.RequestId == DefaultRequestId);
        if (existing is not null)
        {
            return existing;
        }

        EpochWebportalScheduleRequest request = EpochWebportalScheduleRequest.FromLocalWebportalIntent(
            DefaultRequestId,
            "Remote schedule requester",
            "schedule-review-window",
            "Weekday evening Japan time",
            "Asia/Tokyo",
            DateTimeOffset.UtcNow);

        inbox.Add(request);
        Save(inbox);

        return request;
    }

    public static bool TryEnsureDefaultWebportalRequest(out EpochWebportalScheduleRequest? request)
    {
        try
        {
            request = EnsureDefaultWebportalRequest();
            return true;
        }
        catch (IOException)
        {
            request = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            request = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochWebportalScheduleRequest> inbox)
    {
        string path = InboxPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App request inbox path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(inbox, JsonOptions));
        File.Move(tempPath, path, true);
    }

    private static string ResolveStateDirectory()
    {
        string? overrideDirectory = Environment.GetEnvironmentVariable(
            EpochScheduleExecutionHistoryStore.StateDirectoryEnvironmentVariable);
        if (!string.IsNullOrWhiteSpace(overrideDirectory))
        {
            return overrideDirectory;
        }

        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        if (string.IsNullOrWhiteSpace(localAppData))
        {
            localAppData = Path.Combine(Path.GetTempPath(), "KHYRON");
        }

        return Path.Combine(localAppData, "KHYRON", "EPOCH", "App");
    }

    private static void ArchiveInvalidInbox(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid inbox locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
