using BankingPlatform.Domain.Common;

namespace BankingPlatform.Domain.Entities;

public sealed class WorkflowNodeField : EntityBase
{
    public Guid WorkflowNodeId { get; set; }

    public WorkflowNode WorkflowNode { get; set; } = null!;

    public string FieldKey { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string FieldType { get; set; } = "text";

    public string? Placeholder { get; set; }

    public bool IsRequired { get; set; }

    public int DisplayOrder { get; set; }

    public string? OptionsJson { get; set; }
}

public sealed class WorkflowFieldResponse : EntityBase
{
    public Guid ComplaintId { get; set; }

    public Complaint Complaint { get; set; } = null!;

    public Guid WorkflowTaskId { get; set; }

    public WorkflowTask WorkflowTask { get; set; } = null!;

    public Guid WorkflowNodeId { get; set; }

    public WorkflowNode WorkflowNode { get; set; } = null!;

    public Guid WorkflowNodeFieldId { get; set; }

    public WorkflowNodeField WorkflowNodeField { get; set; } = null!;

    public Guid SubmittedByUserId { get; set; }

    public AppUser SubmittedByUser { get; set; } = null!;

    public string? ValueJson { get; set; }
    
    public string? Label { get; set; }
    
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}