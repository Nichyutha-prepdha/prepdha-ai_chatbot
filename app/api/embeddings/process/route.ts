import { NextRequest, NextResponse } from 'next/server';
import { initializeVectorDatabase, processChapterContent } from '@/lib/embeddings';

export async function POST() {
  try {
    // Initialize vector database (create tables, indexes, etc.)
    await initializeVectorDatabase();
    
    // Process all chapter content and create embeddings
    const result = await processChapterContent();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Chapter content processed and embedded successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error processing chapter content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process chapter content' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to process chapter content into embeddings' 
  });
}
