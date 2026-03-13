# Simple upload script
Write-Host "Uploading embeddings..." -ForegroundColor Cyan

try {
    $body = @{action="migrate"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/migrate" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Response:" -ForegroundColor Green
    $response | Format-List
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Done!" -ForegroundColor Green
