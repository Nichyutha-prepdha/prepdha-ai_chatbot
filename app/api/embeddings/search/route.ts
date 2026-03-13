import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarDocumentsByQuery } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5, threshold = 0.7, chapterId = null } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Search for similar documents using query text directly
    const results = await searchSimilarDocumentsByQuery(query, limit, threshold, {
      chapterId: typeof chapterId === 'string' ? chapterId : null,
    });

    return NextResponse.json({
      success: true,
      query,
      chapterId: typeof chapterId === 'string' ? chapterId : null,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching embeddings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search embeddings' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to search for similar documents. Expected body: { query: string, limit?: number, threshold?: number, chapterId?: string }' 
  });
}
