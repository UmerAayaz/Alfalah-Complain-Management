using BankingPlatform.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace BankingPlatform.Application.Abstractions;

public interface IWorkflowTaskService
{
    Task<IReadOnlyList<WorkflowTaskDto>> GetMyBucketAsync(
        CancellationToken cancellationToken);

    Task<IReadOnlyList<WorkflowTaskActionDto>> GetActionsAsync(
        Guid taskId,
        CancellationToken cancellationToken);

    Task CompleteAsync(
        Guid taskId,
        CompleteWorkflowTaskRequest request,
        IReadOnlyList<IFormFile>? files,
        CancellationToken cancellationToken);

    Task ReassignAsync(
        Guid taskId,
        ReassignWorkflowTaskRequest request,
        CancellationToken cancellationToken);

    Task<WorkflowTaskFormDto> GetFormAsync(
        Guid taskId,
        CancellationToken cancellationToken);
}