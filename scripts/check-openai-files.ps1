# Check OpenAI files directly
Write-Host "Checking OpenAI files directly..." -ForegroundColor Cyan

try {
    # Check if we can list files in OpenAI directly
    $body = @{
        action = "check-files"
    } | ConvertTo-Json
    
    Write-Host "Checking OpenAI file list..." -ForegroundColor Yellow
    
    # Try to get file list through a custom endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/migrate" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($response -and $response.files) {
        Write-Host "Files found in OpenAI:" -ForegroundColor Green
        $response.files | ForEach-Object {
            Write-Host "  - ID: $($_.id), Purpose: $($_.purpose), Status: $($_.status)" -ForegroundColor White
        }
    } else {
        Write-Host "No files endpoint or no files found" -ForegroundColor Yellow
        
        # Try direct vector store files check
        Write-Host "Checking vector store files directly..." -ForegroundColor Yellow
        $vsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/vector-store/status" -UseBasicParsing
        
        if ($vsResponse.vectorStore.files -and $vsResponse.vectorStore.files.Count -gt 0) {
            Write-Host "Files in vector store:" -ForegroundColor Green
            $vsResponse.vectorStore.files | ForEach-Object {
                Write-Host "  - ID: $($_.id), Status: $($_.status), Created: $($_.created_at)" -ForegroundColor White
                if ($_.last_error) {
                    Write-Host "    Error: $($_.last_error)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "No files found in vector store" -ForegroundColor Red
        }
    }
    
    # Show vector store details
    Write-Host "`nVector Store Details:" -ForegroundColor Cyan
    $vsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/vector-store/status" -UseBasicParsing
    Write-Host "ID: $($vsResponse.vectorStore.details.id)" -ForegroundColor White
    Write-Host "Name: $($vsResponse.vectorStore.details.name)" -ForegroundColor White
    Write-Host "Status: $($vsResponse.vectorStore.details.status)" -ForegroundColor White
    Write-Host "File Counts: $($vsResponse.vectorStore.details.file_counts | ConvertTo-Json -Compress)" -ForegroundColor White
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Done!" -ForegroundColor Green
