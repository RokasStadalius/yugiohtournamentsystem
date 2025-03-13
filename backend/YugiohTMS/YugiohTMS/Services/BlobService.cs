using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading.Tasks;

public class BlobService
{
    private readonly BlobContainerClient _containerClient;
    private readonly HttpClient _httpClient;

    public BlobService(IConfiguration configuration, HttpClient httpClient)
    {
        string connectionString = configuration["AzureBlobStorage:ConnectionString"];
        string containerName = configuration["AzureBlobStorage:ContainerName"];

        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists(); // Ensures the container exists

        _httpClient = httpClient;
    }

    public async Task<string> UploadImageToAzure(string imageUrl, string fileName)
    {
        var response = await _httpClient.GetAsync(imageUrl);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        var blobClient = _containerClient.GetBlobClient(fileName);

        await blobClient.UploadAsync(stream, overwrite: true);
        return blobClient.Uri.ToString(); // Returns the URL of the uploaded image
    }
}
