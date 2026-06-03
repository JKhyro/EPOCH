using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochScheduleExecutionHistoryStore
{
    public const string StateDirectoryEnvironmentVariable = "EPOCH_APP_STATE_DIR";

    private const string HistoryFileName = "schedule-execution-history.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string HistoryPath => Path.Combine(ResolveStateDirectory(), HistoryFileName);

    public static IReadOnlyList<EpochScheduleExecutionHistoryEntry> Load()
    {
        string path = HistoryPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochScheduleExecutionHistoryEntry>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochScheduleExecutionHistoryEntry>? entries =
                JsonSerializer.Deserialize<List<EpochScheduleExecutionHistoryEntry>>(json, JsonOptions);

            if (entries is not null)
            {
                return entries;
            }

            return Array.Empty<EpochScheduleExecutionHistoryEntry>();
        }
        catch (JsonException)
        {
            ArchiveInvalidHistory(path);
            return Array.Empty<EpochScheduleExecutionHistoryEntry>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochScheduleExecutionHistoryEntry>();
        }
    }

    public static EpochScheduleExecutionHistoryEntry Append(
        EpochScheduleExecutionReceipt receipt,
        string sourceSurface)
    {
        List<EpochScheduleExecutionHistoryEntry> history = Load().ToList();
        EpochScheduleExecutionHistoryEntry entry = EpochScheduleExecutionHistoryEntry.FromReceipt(
            receipt,
            sourceSurface,
            DateTimeOffset.UtcNow);

        history.Add(entry);
        Save(history);

        return entry;
    }

    public static bool TryAppend(
        EpochScheduleExecutionReceipt receipt,
        string sourceSurface,
        out EpochScheduleExecutionHistoryEntry? entry)
    {
        try
        {
            entry = Append(receipt, sourceSurface);
            return true;
        }
        catch (IOException)
        {
            entry = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            entry = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochScheduleExecutionHistoryEntry> history)
    {
        string path = HistoryPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App history path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(history, JsonOptions));
        File.Move(tempPath, path, true);
    }

    private static string ResolveStateDirectory()
    {
        string? overrideDirectory = Environment.GetEnvironmentVariable(StateDirectoryEnvironmentVariable);
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

    private static void ArchiveInvalidHistory(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
