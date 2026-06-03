using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedAvailabilityExceptionReceiptStore
{
    public const string ReceiptFileName = "revised-availability-exception-receipts.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ReceiptPath => Path.Combine(ResolveStateDirectory(), ReceiptFileName);

    public static IReadOnlyList<EpochRevisedAvailabilityExceptionReceipt> Load()
    {
        string path = ReceiptPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedAvailabilityExceptionReceipt>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedAvailabilityExceptionReceipt>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedAvailabilityExceptionReceipt>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedAvailabilityExceptionReceipt>();
        }
        catch (JsonException)
        {
            ArchiveInvalidReceipts(path);
            return Array.Empty<EpochRevisedAvailabilityExceptionReceipt>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedAvailabilityExceptionReceipt>();
        }
    }

    public static EpochRevisedAvailabilityExceptionReceipt Append(
        EpochRevisedAvailabilityException availabilityException)
    {
        List<EpochRevisedAvailabilityExceptionReceipt> receipts = Load().ToList();
        EpochRevisedAvailabilityExceptionReceipt receipt =
            EpochRevisedAvailabilityExceptionReceipt.FromException(
                availabilityException,
                DateTimeOffset.UtcNow);

        receipts.Add(receipt);
        Save(receipts);

        return receipt;
    }

    public static bool TryAppend(
        EpochRevisedAvailabilityException availabilityException,
        out EpochRevisedAvailabilityExceptionReceipt? receipt)
    {
        try
        {
            receipt = Append(availabilityException);
            return true;
        }
        catch (IOException)
        {
            receipt = null;
            return false;
        }
        catch (UnauthorizedAccessException)
        {
            receipt = null;
            return false;
        }
    }

    private static void Save(IReadOnlyList<EpochRevisedAvailabilityExceptionReceipt> receipts)
    {
        string path = ReceiptPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised availability exception receipt path does not have a directory.");
        Directory.CreateDirectory(directory);

        string tempPath = $"{path}.tmp";
        File.WriteAllText(tempPath, JsonSerializer.Serialize(receipts, JsonOptions));
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

    private static void ArchiveInvalidReceipts(string path)
    {
        try
        {
            string archivePath = $"{path}.invalid-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
            File.Move(path, archivePath, true);
        }
        catch (IOException)
        {
            // Keep the app usable even if Windows has the invalid revised availability exception receipt ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should not fail open into MONITOR.
        }
    }
}
