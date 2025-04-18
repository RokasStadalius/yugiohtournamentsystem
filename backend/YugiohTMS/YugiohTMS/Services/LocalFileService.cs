using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public class LocalFileService
{
    private readonly string _localStoragePath;
    private readonly HttpClient _httpClient;

    public LocalFileService(IWebHostEnvironment env, IConfiguration configuration, HttpClient httpClient)
    {
        _localStoragePath = Path.Combine(env.ContentRootPath,
                                        configuration["LocalStorage:Path"]);
        _httpClient = httpClient;

        Directory.CreateDirectory(_localStoragePath);
    }

    public async Task<string> UploadImageToLocal(string imageUrl, string fileName)
    {


        var response = await _httpClient.GetAsync(imageUrl);
        response.EnsureSuccessStatusCode();

        var filePath = Path.Combine(_localStoragePath, fileName);

        await using var stream = await response.Content.ReadAsStreamAsync();
        await using var fileStream = File.Create(filePath);
        await stream.CopyToAsync(fileStream);
        return $"http://localhost:5042/images/{fileName}";
    }
}