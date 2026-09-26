namespace BankingPlatform.Domain.Entities;

public class ComplaintAttachment
{
    public Guid Id { get; set; }
    public Guid ComplaintId { get; set; }
    public Guid? WorkflowTaskId { get; set; }
    public Guid? FieldId { get; set; }          // the dynamic field this answers
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public long SizeBytes { get; set; }
    public string StoragePath { get; set; } = default!;   // for Pattern A
    // public byte[] Content { get; set; } = default!;    // for Pattern B
    public string? UploadedByUserId { get; set; }
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}