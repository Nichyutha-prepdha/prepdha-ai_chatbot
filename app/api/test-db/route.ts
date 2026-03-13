import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    const schoolCount = await prisma.school.count();
    console.log(`Schools in database: ${schoolCount}`);
    
    // Check Page table
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        chapterId: true,
        vector_file_id: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Pages in database: ${pages.length}`);
    
    // Check Document table
    const documentCount = await prisma.document.count();
    console.log(`Documents in database: ${documentCount}`);
    
    return NextResponse.json({
      success: true,
      data: {
        schoolCount,
        pageCount: pages.length,
        documentCount,
        pages: pages.map(p => ({
          id: p.id,
          chapterId: p.chapterId,
          hasVectorFile: !!p.vector_file_id,
          vectorFileId: p.vector_file_id,
          createdAt: p.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
