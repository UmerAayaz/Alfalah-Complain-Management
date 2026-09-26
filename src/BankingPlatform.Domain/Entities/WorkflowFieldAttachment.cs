namespace BankingPlatform.Domain.Entities;

public class WorkflowFieldAttachment
{
    public Guid Id { get; set; }

    public Guid WorkflowFieldResponseId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string StoredFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public string FilePath { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}