using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedDeadlineExecutionStore
{
    public const string ExecutionFileName = "revised-deadline-executions.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ExecutionPath => Path.Combine(ResolveStateDirectory(), ExecutionFileName);

    public static IReadOnlyList<EpochRevisedDeadlineExecution> Load()
    {
        string path = ExecutionPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedDeadlineExecution>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedDeadlineExecution>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedDeadlineExecution>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedDeadlineExecution>();
        }
        catch (JsonException)
        {
            ArchiveInvalidExecutions(path);
            return Array.Empty<EpochRevisedDeadlineExecution>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedDeadlineExecution>();
        }
    }

    public static EpochRevisedDeadlineExecution Append(EpochRevisedCalendarTimingExport timingExport)
    {
        List<EpochRevisedDeadlineExecution> executions = Load().ToList();
        EpochRevisedDeadlineExecution execution =
            EpochRevisedDeadlineExecution.FromRevisedTimingExport(timingExport, DateTimeOffset.UtcNow);

        executions.Add(execution);
        Save(executions);

        return execution;
    }

    public static bool TryAppend(
        EpochRevisedCalendarTimingExport timingExport,
        out EpochRevisedDeadlineExecution? execution)
    {
        try
        {
            execution = Append(timingExport);
            return true;
        }
        catch (IOException)
        {
            execution = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            execution = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedDeadlineExecution> executions)
    {
        string path = ExecutionPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised deadline execution path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(executions, JsonOptions));
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

    private static void ArchiveInvalidExecutions(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid deadline execution ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
