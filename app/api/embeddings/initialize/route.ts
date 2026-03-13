import { NextRequest, NextResponse } from 'next/server';
import { initializeVectorDatabase } from '@/lib/embeddings';

export async function POST() {
  try {
    // Initialize vector database (create extension, tables, indexes)
    await initializeVectorDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vector database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing vector database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize vector database' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize the vector database with PGVector extension and tables' 
  });
}
