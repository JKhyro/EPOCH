using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedCalendarTimingExportStore
{
    public const string ExportFileName = "epoch-revised-calendar-timing.json";

    private const string DefaultPayloadId = "epoch-revised-timing-export-001";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ExportPath => Path.Combine(ResolveStateDirectory(), ExportFileName);

    public static IReadOnlyList<EpochRevisedCalendarTimingExport> Load()
    {
        string path = ExportPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedCalendarTimingExport>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedCalendarTimingExport>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedCalendarTimingExport>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedCalendarTimingExport>();
        }
        catch (JsonException)
        {
            ArchiveInvalidExports(path);
            return Array.Empty<EpochRevisedCalendarTimingExport>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedCalendarTimingExport>();
        }
    }

    public static EpochRevisedCalendarTimingExport EnsureDefaultExport(EpochShellSnapshot snapshot)
    {
        List<EpochRevisedCalendarTimingExport> exports = Load().ToList();
        EpochRevisedCalendarTimingExport? existing =
            exports.FirstOrDefault(item => item.PayloadId == DefaultPayloadId);
        if (existing is not null)
        {
            return existing;
        }

        EpochRevisedCalendarTimingExport export =
            EpochRevisedCalendarTimingExport.FromSnapshot(
                snapshot,
                DefaultPayloadId,
                DateTimeOffset.UtcNow);

        exports.Add(export);
        Save(exports);

        return export;
    }

    public static bool TryEnsureDefaultExport(
        EpochShellSnapshot snapshot,
        out EpochRevisedCalendarTimingExport? export)
    {
        try
        {
            export = EnsureDefaultExport(snapshot);
            return true;
        }
        catch (IOException)
        {
            export = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            export = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedCalendarTimingExport> exports)
    {
        string path = ExportPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised timing export path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(exports, JsonOptions));
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

    private static void ArchiveInvalidExports(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid revised timing export ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
