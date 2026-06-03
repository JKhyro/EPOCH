using System.Text.Json;

namespace Epoch.App.Services;

internal static class EpochRevisedRulepackApprovalReceiptStore
{
    public const string ReceiptFileName = "revised-rulepack-approval-receipts.json";

    private const string DefaultReceiptId = "epoch-revised-rulepack-approval-receipt-001";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    public static string ReceiptPath => Path.Combine(ResolveStateDirectory(), ReceiptFileName);

    public static IReadOnlyList<EpochRevisedRulepackApprovalReceipt> Load()
    {
        string path = ReceiptPath;
        if (!File.Exists(path))
        {
            return Array.Empty<EpochRevisedRulepackApprovalReceipt>();
        }

        try
        {
            string json = File.ReadAllText(path);
            List<EpochRevisedRulepackApprovalReceipt>? entries =
                JsonSerializer.Deserialize<List<EpochRevisedRulepackApprovalReceipt>>(json, JsonOptions);

            return entries is not null ? entries : Array.Empty<EpochRevisedRulepackApprovalReceipt>();
        }
        catch (JsonException)
        {
            ArchiveInvalidReceipts(path);
            return Array.Empty<EpochRevisedRulepackApprovalReceipt>();
        }
        catch (IOException)
        {
            return Array.Empty<EpochRevisedRulepackApprovalReceipt>();
        }
    }

    public static EpochRevisedRulepackApprovalReceipt EnsureDefaultReceipt(
        EpochRevisedRulepackOwnerDecision decision)
    {
        List<EpochRevisedRulepackApprovalReceipt> receipts = Load().ToList();
        EpochRevisedRulepackApprovalReceipt? existing =
            receipts.FirstOrDefault(item => item.ReceiptId == DefaultReceiptId);
        if (existing is not null)
        {
            return existing;
        }

        EpochRevisedRulepackApprovalReceipt receipt =
            EpochRevisedRulepackApprovalReceipt.FromDecision(
                decision,
                DefaultReceiptId,
                DateTimeOffset.UtcNow);

        receipts.Add(receipt);
        Save(receipts);

        return receipt;
    }

    public static bool TryEnsureDefaultReceipt(
        EpochRevisedRulepackOwnerDecision decision,
        out EpochRevisedRulepackApprovalReceipt? receipt)
    {
        try
        {
            receipt = EnsureDefaultReceipt(decision);
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

    private static void Save(IReadOnlyList<EpochRevisedRulepackApprovalReceipt> receipts)
    {
        string path = ReceiptPath;
        string directory = Path.GetDirectoryName(path)
            ?? throw new InvalidOperationException("EPOCH App revised rulepack approval receipt path does not have a directory.");
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
            // Keep the App usable even if Windows has the invalid owner approval receipt ledger locked.
        }
        catch (UnauthorizedAccessException)
        {
            // The next load can try again; the shell should stay closed to conversion.
        }
    }
}
