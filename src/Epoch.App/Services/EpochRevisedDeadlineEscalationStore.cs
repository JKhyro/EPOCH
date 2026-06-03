using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedDeadlineEscalationStore
{
    public const string EscalationFileName = "revised-deadline-escalations.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string EscalationPath => Path.Combine(ResolveStateDirectory(), EscalationFileName);

    public static IReadOnlyList<EpochRevisedDeadlineEscalation> Load()
    {
        string path = EscalationPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedDeadlineEscalation>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedDeadlineEscalation>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedDeadlineEscalation>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedDeadlineEscalation>();
        }
        catch (JsonException)
        {
            ArchiveInvalidEscalations(path);
            return Array.Empty<EpochRevisedDeadlineEscalation>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedDeadlineEscalation>();
        }
    }

    public static EpochRevisedDeadlineEscalation Append(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution)
    {
        List<EpochRevisedDeadlineEscalation> escalations = Load().ToList();
        EpochRevisedDeadlineEscalation escalation = EpochRevisedDeadlineEscalation.FromExecutions(
            reminderExecution,
            deadlineExecution,
            DateTimeOffset.UtcNow);

        escalations.Add(escalation);
        Save(escalations);

        return escalation;
    }

    public static bool TryAppend(
        EpochRevisedReminderExecution reminderExecution,
        EpochRevisedDeadlineExecution deadlineExecution,
        out EpochRevisedDeadlineEscalation? escalation)
    {
        try
        {
            escalation = Append(reminderExecution, deadlineExecution);
            return true;
        }
        catch (IOException)
        {
            escalation = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            escalation = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedDeadlineEscalation> escalations)
    {
        string path = EscalationPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised deadline escalation path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(escalations, JsonOptions));
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

    private static void ArchiveInvalidEscalations(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid deadline escalation ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
