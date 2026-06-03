using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochScheduleLifecycleStatusStore
{
    public const string StatusFileName = "schedule-lifecycle-status.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string StatusPath => Path.Combine(ResolveStateDirectory(), StatusFileName);

    public static IReadOnlyList<EpochScheduleLifecycleStatusRecord> Load()
    {
        string path = StatusPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochScheduleLifecycleStatusRecord>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochScheduleLifecycleStatusRecord>? entries =
                JsonSerializer.Deserialize<List<EpochScheduleLifecycleStatusRecord>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochScheduleLifecycleStatusRecord>();
        }
        catch (JsonException)
        {
            ArchiveInvalidStatuses(path);
            return Array.Empty<EpochScheduleLifecycleStatusRecord>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochScheduleLifecycleStatusRecord>();
        }
    }

    public static EpochScheduleLifecycleStatusRecord Append(
        EpochScheduleLifecycleAction action,
        EpochScheduleLifecycleReceipt receipt)
    {
        List<EpochScheduleLifecycleStatusRecord> statuses = Load().ToList();
        EpochScheduleLifecycleStatusRecord status = EpochScheduleLifecycleStatusRecord.FromLifecycleChain(
            action,
            receipt,
            DateTimeOffset.UtcNow);

        statuses.Add(status);
        Save(statuses);

        return status;
    }

    public static bool TryAppend(
        EpochScheduleLifecycleAction action,
        EpochScheduleLifecycleReceipt receipt,
        out EpochScheduleLifecycleStatusRecord? status)
    {
        try
        {
            status = Append(action, receipt);
            return true;
        }
        catch (IOException)
        {
            status = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            status = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochScheduleLifecycleStatusRecord> statuses)
    {
        string path = StatusPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App schedule lifecycle status path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(statuses, JsonOptions));
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

    private static void ArchiveInvalidStatuses(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid lifecycle status ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
