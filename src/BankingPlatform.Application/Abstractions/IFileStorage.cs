namespace BankingPlatform.Application.Abstractions;

public interface IFileStorage
{
    Task<string> SaveAsync(
        Stream content,
        string relativePath,
        string contentType,
        CancellationToken ct = default);

    Task<Stream> OpenReadAsync(string relativePath, CancellationToken ct = default);

    Task DeleteAsync(string relativePath, CancellationToken ct = default);
}