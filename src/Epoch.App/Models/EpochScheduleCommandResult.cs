namespace Epoch.App;

public sealed record EpochScheduleCommandResult(
    string RequestId,
    string ScheduleEntryId,
    string AvailabilityWindowId,
    string BookingConfirmationId,
    string ReceiptId,
    string TimingReturnStatus,
    string CustomerSafeStatus,
    bool RequestCustomerSafe,
    bool AvailabilityHasCapacity,
    bool AcceptanceReady,
    bool HoldReady,
    bool BookingCustomerSafe,
    bool ReceiptCustomerSafe,
    bool TimingReturnCustomerSafe,
    bool NativeCommandReady);
