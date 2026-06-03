using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedAvailabilityExceptionStore
{
    public const string ExceptionFileName = "revised-availability-exceptions.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ExceptionPath => Path.Combine(ResolveStateDirectory(), ExceptionFileName);

    public static IReadOnlyList<EpochRevisedAvailabilityException> Load()
    {
        string path = ExceptionPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedAvailabilityException>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedAvailabilityException>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedAvailabilityException>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedAvailabilityException>();
        }
        catch (JsonException)
        {
            ArchiveInvalidExceptions(path);
            return Array.Empty<EpochRevisedAvailabilityException>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedAvailabilityException>();
        }
    }

    public static EpochRevisedAvailabilityException Append(
        EpochRevisedCalendarTimingExport timingExport,
        EpochScheduleCommandResult command)
    {
        List<EpochRevisedAvailabilityException> exceptions = Load().ToList();
        EpochRevisedAvailabilityException availabilityException =
            EpochRevisedAvailabilityException.FromRevisedTimingExport(
                timingExport,
                command,
                DateTimeOffset.UtcNow);

        exceptions.Add(availabilityException);
        Save(exceptions);

        return availabilityException;
    }

    public static bool TryAppend(
        EpochRevisedCalendarTimingExport timingExport,
        EpochScheduleCommandResult command,
        out EpochRevisedAvailabilityException? availabilityException)
    {
        try
        {
            availabilityException = Append(timingExport, command);
            return true;
        }
        catch (IOException)
        {
            availabilityException = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            availabilityException = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedAvailabilityException> exceptions)
    {
        string path = ExceptionPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised availability exception path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(exceptions, JsonOptions));
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

    private static void ArchiveInvalidExceptions(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid revised availability exception ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
