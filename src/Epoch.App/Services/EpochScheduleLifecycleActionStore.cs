using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochScheduleLifecycleActionStore
{
    public const string ActionFileName = "schedule-lifecycle-actions.json";

    private const string DefaultActionId = "epoch-lifecycle-action-001";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ActionPath => Path.Combine(ResolveStateDirectory(), ActionFileName);

    public static IReadOnlyList<EpochScheduleLifecycleAction> Load()
    {
        string path = ActionPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochScheduleLifecycleAction>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochScheduleLifecycleAction>? entries =
                JsonSerializer.Deserialize<List<EpochScheduleLifecycleAction>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochScheduleLifecycleAction>();
        }
        catch (JsonException)
        {
            ArchiveInvalidActions(path);
            return Array.Empty<EpochScheduleLifecycleAction>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochScheduleLifecycleAction>();
        }
    }

    public static EpochScheduleLifecycleAction EnsureDefaultLifecycleAction()
    {
        List<EpochScheduleLifecycleAction> actions = Load().ToList();
        EpochScheduleLifecycleAction? existing = actions.FirstOrDefault(action => action.ActionId == DefaultActionId);
        if (existing is not null)
        {
            return existing;
        }

        EpochScheduleLifecycleAction action = EpochScheduleLifecycleAction.FromLocalWebportalIntent(
            DefaultActionId,
            "epoch-webportal-request-001",
            "reschedule",
            "Next weekday evening Japan time",
            "Customer asked for a new review window.",
            DateTimeOffset.UtcNow);

        actions.Add(action);
        Save(actions);

        return action;
    }

    public static bool TryEnsureDefaultLifecycleAction(out EpochScheduleLifecycleAction? action)
    {
        try
        {
            action = EnsureDefaultLifecycleAction();
            return true;
        }
        catch (IOException)
        {
            action = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            action = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochScheduleLifecycleAction> actions)
    {
        string path = ActionPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App lifecycle action path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(actions, JsonOptions));
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

    private static void ArchiveInvalidActions(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid lifecycle action ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
