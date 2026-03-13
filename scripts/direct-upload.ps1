# Direct upload using server environment
Write-Host "Direct upload attempt..." -ForegroundColor Cyan

try {
    # Check if we can see the embeddings file
    $embeddingsPath = ".\data\local-embeddings.json"
    if (Test-Path $embeddingsPath) {
        $embeddings = Get-Content $embeddingsPath -Raw | ConvertFrom-Json
        Write-Host "Found $($embeddings.records.length) records in local file" -ForegroundColor Green
    } else {
        Write-Host "No local embeddings file found" -ForegroundColor Red
        exit 1
    }
    
    # Try a different API approach - check if there's a direct upload endpoint
    Write-Host "Attempting direct file upload..." -ForegroundColor Yellow
    
    # Read the embeddings file content
    $fileContent = Get-Content $embeddingsPath -Raw -Encoding UTF8
    
    # Try to upload as a file
    $boundary = [System.Guid]::NewGuid().ToString()
    $body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="local-embeddings.json"
Content-Type: application/json

$fileContent
--$boundary--
"@
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/upload" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($response) {
        Write-Host "Upload response:" -ForegroundColor Green
        $response | Format-List
    } else {
        Write-Host "Direct upload failed, trying alternative..." -ForegroundColor Yellow
        
        # Alternative: Trigger the migration with more detailed response
        $migrateBody = @{action="migrate"; force=$true} | ConvertTo-Json
        $migrateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/migrate" -Method POST -ContentType "application/json" -Body $migrateBody -UseBasicParsing
        
        Write-Host "Migration response:" -ForegroundColor Green
        $migrateResponse | Format-List
        
        if ($migrateResponse.result) {
            Write-Host "Migration details:" -ForegroundColor Cyan
            $migrateResponse.result | Format-List
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to missing OpenAI API key in server environment" -ForegroundColor Yellow
}

Write-Host "Done!" -ForegroundColor Green
