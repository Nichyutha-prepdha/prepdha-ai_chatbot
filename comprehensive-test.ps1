# Comprehensive Test for Update File IDs API
# This script will test all aspects of the API

$body = @{
    fileMappings = @(
        @{
            topicId = 1  # Use number, not string
            fileId = "file-abc123"
        },
        @{
            topicId = 2  # Use number, not string
            fileId = "file-xyz789"
        }
    )
} | ConvertTo-Json

Write-Host "=== UPDATE FILE IDS API TEST ===" -ForegroundColor Cyan
Write-Host "Request Body: $body" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/embeddings/update-file-ids" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json

    Write-Host "✅ API Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Results Summary:" -ForegroundColor Cyan
    Write-Host "  Updated: $($result.results.updated)"
    Write-Host "  Created: $($result.results.created)"
    Write-Host "  Already Present: $($result.results.alreadyPresent)"
    Write-Host "  Skipped: $($result.results.skipped)"
    Write-Host "  Errors: $($result.results.errors)"
    Write-Host ""
    Write-Host "📝 Full Response:" -ForegroundColor Cyan
    Write-Host ($result | ConvertTo-Json -Depth 10)

} catch {
    Write-Host "❌ API Call Failed:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Full Response:" -ForegroundColor Yellow
    try {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorResponse = $reader.ReadToEnd()
        Write-Host $errorResponse
    } catch {
        Write-Host "Could not read error response"
    }
}
