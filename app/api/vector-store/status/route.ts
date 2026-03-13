import { NextRequest, NextResponse } from "next/server"
import { openaiVectorStore } from "@/lib/openai-vector-store"

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Checking vector store status...")
    
    // Get comprehensive status
    const status = await openaiVectorStore.checkEmbeddingStatus()
    
    // Get vector store details
    const vectorStoreStatus = await openaiVectorStore.getVectorStoreStatus()
    
    // Get file details
    const files = await openaiVectorStore.listFiles()
    
    return NextResponse.json({
      success: true,
      vectorStore: {
        ...status,
        details: vectorStoreStatus,
        files: files.map(file => ({
          id: file.id,
          status: file.status,
          created_at: file.created_at,
          has_error: !!file.last_error,
          error: file.last_error
        }))
      },
      diagnostics: {
        totalFiles: files.length,
        completedFiles: files.filter(f => f.status === 'completed').length,
        failedFiles: files.filter(f => f.last_error).length,
        processingFiles: files.filter(f => f.status === 'processing').length,
        isReadyForSearch: status.isReady
      },
      recommendations: status.recommendations,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Error checking vector store status:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check vector store status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
