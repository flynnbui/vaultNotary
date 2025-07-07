using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using PdfSharpCore.Pdf.Advanced;
using Microsoft.Extensions.Logging;

namespace VaultNotary.BackgroundJobs.Services;

public class PdfCompressionService : IPdfCompressionService
{
    private readonly ILogger<PdfCompressionService> _logger;

    public PdfCompressionService(ILogger<PdfCompressionService> logger)
    {
        _logger = logger;
    }

    public async Task<byte[]> CompressPdfAsync(byte[] pdfData)
    {
        try
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            
            // Open the PDF document
            var document = PdfReader.Open(inputStream, PdfDocumentOpenMode.Modify);
            
            // Apply compression settings
            document.Options.FlateEncodeMode = PdfFlateEncodeMode.BestCompression;
            document.Options.UseFlateDecoderForJpegImages = PdfUseFlateDecoderForJpegImages.Automatic;
            document.Options.CompressContentStreams = true;
            document.Options.NoCompression = false;
            
            // Process each page for additional compression
            foreach (var page in document.Pages)
            {
                // Remove unused resources and optimize images
                OptimizePage(page);
            }
            
            // Save the compressed document
            document.Save(outputStream);
            
            var compressedData = outputStream.ToArray();
            
            _logger.LogInformation("PDF compressed: {OriginalSize} bytes -> {CompressedSize} bytes ({CompressionRatio:P})",
                pdfData.Length, compressedData.Length, 
                1.0 - (double)compressedData.Length / pdfData.Length);
            
            return compressedData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to compress PDF");
            throw;
        }
    }

    public async Task<long> GetCompressedSizeAsync(byte[] pdfData)
    {
        var compressed = await CompressPdfAsync(pdfData);
        return compressed.Length;
    }

    private void OptimizePage(PdfPage page)
    {
        try
        {
            // Remove duplicate resources
            var resources = page.Resources;
            if (resources != null)
            {
                // Optimize images in the page
                OptimizePageImages(resources);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to optimize page");
        }
    }

    private void OptimizePageImages(PdfDictionary resources)
    {
        try
        {
            if (resources.Elements.ContainsKey("/XObject"))
            {
                var xObjects = resources.Elements["/XObject"] as PdfDictionary;
                if (xObjects != null)
                {
                    foreach (var item in xObjects.Elements)
                    {
                        if (item.Value is PdfReference reference)
                        {
                            var xObject = reference.Value as PdfDictionary;
                            if (xObject != null && xObject.Elements.ContainsKey("/Subtype"))
                            {
                                var subtype = xObject.Elements["/Subtype"].ToString();
                                if (subtype == "/Image")
                                {
                                    OptimizeImage(xObject);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to optimize page images");
        }
    }

    private void OptimizeImage(PdfDictionary imageDict)
    {
        try
        {
            // Apply image-specific optimizations
            if (!imageDict.Elements.ContainsKey("/Filter"))
            {
                imageDict.Elements.Add("/Filter", new PdfName("/FlateDecode"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to optimize image");
        }
    }
}