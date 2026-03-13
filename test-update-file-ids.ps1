# Test the Update File IDs API
# Run this in PowerShell

$body = @{
    fileMappings = @(
        @{
            topicId = "1"
            fileId = "file-abc123"
        },
        @{
            topicId = "2"
            fileId = "file-xyz789"
        }
    )
} | ConvertTo-Json

Write-Host "Testing Update File IDs API..."
Write-Host "Request Body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/embeddings/update-file-ids" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json

    Write-Host "✅ API Response:"
    Write-Host ($result | ConvertTo-Json -Depth 10)

    Write-Host "`n📊 Summary:"
    Write-Host "Updated: $($result.results.updated)"
    Write-Host "Created: $($result.results.created)"
    Write-Host "Already Present: $($result.results.alreadyPresent)"
    Write-Host "Skipped: $($result.results.skipped)"
    Write-Host "Errors: $($result.results.errors)"

} catch {
    Write-Host "❌ API Call Failed:"
    Write-Host $_.Exception.Message
    Write-Host "Response: $($_.Exception.Response)"
}
