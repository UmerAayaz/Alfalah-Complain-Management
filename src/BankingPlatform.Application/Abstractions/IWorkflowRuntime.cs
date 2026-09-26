using BankingPlatform.Application.DTOs;
using BankingPlatform.Domain.Entities;
using Microsoft.AspNetCore.Http;


namespace BankingPlatform.Application.Abstractions;

public interface IWorkflowRuntime
{
    Task StartAsync(
        Complaint complaint,
        CancellationToken cancellationToken);

    Task CompleteTaskAsync(
        Guid taskId,
        Guid actorUserId,
        CompleteWorkflowTaskRequest request,
        IReadOnlyList<IFormFile>? files,
        CancellationToken cancellationToken);
}