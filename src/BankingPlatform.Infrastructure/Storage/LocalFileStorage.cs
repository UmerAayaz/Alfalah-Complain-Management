using BankingPlatform.Application.Abstractions;

namespace BankingPlatform.Infrastructure.Storage;

public sealed class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(string root)
    {
        _root = root;
        Directory.CreateDirectory(_root);
    }

    public async Task<string> SaveAsync(
        Stream content,
        string relativePath,
        string contentType,
        CancellationToken ct = default)
    {
        var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var full = Path.Combine(_root, normalized);

        Directory.CreateDirectory(Path.GetDirectoryName(full)!);

        await using var fs = File.Create(full);
        await content.CopyToAsync(fs, ct);

        return relativePath.Replace('\\', '/');
    }

    public Task<Stream> OpenReadAsync(string relativePath, CancellationToken ct = default)
    {
        var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var full = Path.Combine(_root, normalized);

        if (!File.Exists(full))
            throw new FileNotFoundException($"Attachment not found: {relativePath}", full);

        return Task.FromResult<Stream>(File.OpenRead(full));
    }

    public Task DeleteAsync(string relativePath, CancellationToken ct = default)
    {
        var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var full = Path.Combine(_root, normalized);

        if (File.Exists(full))
            File.Delete(full);

        return Task.CompletedTask;
    }
}