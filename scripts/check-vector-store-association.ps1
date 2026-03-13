# Check vector store association
Write-Host "Checking vector store file association..." -ForegroundColor Cyan

try {
    # Get current vector store status
    $status = Invoke-RestMethod -Uri "http://localhost:3000/api/vector-store/status" -UseBasicParsing
    
    Write-Host "Vector Store ID: $($status.vectorStore.details.id)" -ForegroundColor White
    Write-Host "Current files in vector store: $($status.vectorStore.totalFiles)" -ForegroundColor White
    
    # Try to trigger a check of OpenAI files directly through the server
    $checkBody = @{
        action = "check-association"
        vectorStoreId = $status.vectorStore.details.id
    } | ConvertTo-Json
    
    Write-Host "Checking file association..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/migrate" -Method POST -ContentType "application/json" -Body $checkBody -UseBasicParsing -ErrorAction Stop
        Write-Host "Association check response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        Write-Host "Association check not available, trying alternative..." -ForegroundColor Yellow
        
        # Try to manually associate files if they exist
        Write-Host "Manual association attempt..." -ForegroundColor Yellow
        
        # First, let's see if we can get more details about the migration
        $migrateBody = @{
            action = "migrate"
            checkOnly = $true
        } | ConvertTo-Json
        
        try {
            $migrateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/embeddings/migrate" -Method POST -ContentType "application/json" -Body $migrateBody -UseBasicParsing -ErrorAction Stop
            Write-Host "Migration check response:" -ForegroundColor Green
            $migrateResponse | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "Migration check also failed" -ForegroundColor Red
        }
    }
    
    # Show final status
    Write-Host "`nFinal status check..." -ForegroundColor Yellow
    $finalStatus = Invoke-RestMethod -Uri "http://localhost:3000/api/vector-store/status" -UseBasicParsing
    
    Write-Host "Final file count: $($finalStatus.vectorStore.totalFiles)" -ForegroundColor $(if($finalStatus.vectorStore.totalFiles -gt 0) { 'Green' } else { 'Red' })
    
    if ($finalStatus.vectorStore.totalFiles -eq 0) {
        Write-Host "`n❌ ISSUE: Files are not being associated with the vector store" -ForegroundColor Red
        Write-Host "This could be due to:" -ForegroundColor Yellow
        Write-Host "1. Files are created but not associated with vector store" -ForegroundColor Gray
        Write-Host "2. Vector store association step is failing silently" -ForegroundColor Gray
        Write-Host "3. OpenAI API permissions issue" -ForegroundColor Gray
        Write-Host "4. Rate limiting or API limits" -ForegroundColor Gray
    } else {
        Write-Host "`n✅ SUCCESS: Files are now in the vector store!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Check completed!" -ForegroundColor Green
