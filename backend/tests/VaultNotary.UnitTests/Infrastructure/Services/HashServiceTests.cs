using FluentAssertions;
using System.Text;
using VaultNotary.Infrastructure.Services;

namespace VaultNotary.UnitTests.Infrastructure.Services;

public class HashServiceTests
{
    private readonly HashService _hashService;

    public HashServiceTests()
    {
        _hashService = new HashService();
    }

    [Fact]
    public async Task ComputeSha256HashAsync_WithStream_ShouldReturnCorrectHash()
    {
        var testData = "Hello, World!";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(testData));
        var expectedHash = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";

        var result = await _hashService.ComputeSha256HashAsync(stream);

        result.Should().Be(expectedHash);
    }

    [Fact]
    public async Task ComputeSha256HashAsync_WithByteArray_ShouldReturnCorrectHash()
    {
        var testData = "Hello, World!";
        var bytes = Encoding.UTF8.GetBytes(testData);
        var expectedHash = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";

        var result = await _hashService.ComputeSha256HashAsync(bytes);

        result.Should().Be(expectedHash);
    }

    [Fact]
    public void VerifyHash_WithStream_ShouldReturnTrue_WhenHashMatches()
    {
        var testData = "Hello, World!";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(testData));
        var hash = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";

        var result = _hashService.VerifyHash(hash, stream);

        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyHash_WithStream_ShouldReturnFalse_WhenHashDoesNotMatch()
    {
        var testData = "Hello, World!";
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(testData));
        var wrongHash = "wrong_hash";

        var result = _hashService.VerifyHash(wrongHash, stream);

        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyHash_WithByteArray_ShouldReturnTrue_WhenHashMatches()
    {
        var testData = "Hello, World!";
        var bytes = Encoding.UTF8.GetBytes(testData);
        var hash = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";

        var result = _hashService.VerifyHash(hash, bytes);

        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyHash_WithByteArray_ShouldReturnFalse_WhenHashDoesNotMatch()
    {
        var testData = "Hello, World!";
        var bytes = Encoding.UTF8.GetBytes(testData);
        var wrongHash = "wrong_hash";

        var result = _hashService.VerifyHash(wrongHash, bytes);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ComputeSha256HashAsync_WithEmptyData_ShouldReturnEmptyStringHash()
    {
        var emptyBytes = Array.Empty<byte>();
        var expectedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

        var result = await _hashService.ComputeSha256HashAsync(emptyBytes);

        result.Should().Be(expectedHash);
    }

    [Fact]
    public async Task ComputeSha256HashAsync_ShouldBeCaseInsensitive()
    {
        var testData = "Test Data";
        var bytes = Encoding.UTF8.GetBytes(testData);

        var result = await _hashService.ComputeSha256HashAsync(bytes);

        result.Should().MatchRegex("^[a-f0-9]+$");
    }
}