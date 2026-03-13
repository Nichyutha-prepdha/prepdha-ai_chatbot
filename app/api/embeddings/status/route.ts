import { NextResponse } from 'next/server';
import { getLocalEmbeddingStatus } from '@/lib/embeddings';

export async function GET() {
  try {
    const localStatus = await getLocalEmbeddingStatus();

    return NextResponse.json({
      success: true,
      status: localStatus.status,
      statistics: localStatus.statistics,
      bookStatistics: localStatus.bookStatistics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking embedding status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check embedding status' 
      },
      { status: 500 }
    );
  }
}
