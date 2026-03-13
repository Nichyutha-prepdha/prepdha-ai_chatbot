import { NextRequest, NextResponse } from "next/server";
import { migrateEmbeddings, checkMigrationStatus } from "@/scripts/migrate-to-openai-vector-store";
import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, chapters, autoEmbed } = body;

    if (action === "status") {
      const status = await checkMigrationStatus();
      return NextResponse.json({ success: true, status });
    } else if (action === "direct-upload" && chapters && autoEmbed) {
      // Direct chapter content upload to vector store
      const result = await uploadChaptersDirectly(chapters);
      return NextResponse.json({ 
        success: true, 
        message: "Direct upload completed successfully",
        result 
      });
    } else if (action === "migrate") {
      const result = await migrateEmbeddings();
      return NextResponse.json({ 
        success: true, 
        message: "Migration completed successfully",
        result 
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}

async function uploadChaptersDirectly(chaptersData: any) {
  try {
    console.log("📤 Starting direct chapter upload...");
    
    // Test database connection first
    try {
      console.log("🔍 Testing database connection...");
      const pageCount = await (prisma as any).educationalPage.count();
      console.log(`✅ Database connection working. Current EducationalPage count: ${pageCount}`);
    } catch (connError: any) {
      console.error("❌ Database connection failed:", connError);
      throw new Error(`Database connection failed: ${connError.message}`);
    }
    
    const openai = new OpenAI();
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    
    // Parse chapters data
    const chapters = typeof chaptersData === 'string' ? JSON.parse(chaptersData) : chaptersData;
    let uploadCount = 0;
    const uploadedFiles: { chapterId: string; fileId: string }[] = [];
    
    for (const chapter of chapters) {
      // Combine all chapter content
      let fullContent = `Chapter: ${chapter.title}\n`;
      fullContent += `Subtitle: ${chapter.subtitle || ''}\n\n`;
      
      if (chapter.sections && Array.isArray(chapter.sections)) {
        chapter.sections.forEach((section: any) => {
          fullContent += `Section: ${section.title}\n`;
          fullContent += `${section.body}\n\n`;
        });
      }
      
      if (chapter.vocabulary && Array.isArray(chapter.vocabulary)) {
        fullContent += `Vocabulary:\n`;
        chapter.vocabulary.forEach((vocab: any) => {
          fullContent += `- ${vocab.word}: ${vocab.definition}\n`;
        });
      }
      
      // Create file directly in vector store using File object
      const fileName = `chapter-${chapter.id}.json`;
      const file = await openai.files.create({
        file: new File([fullContent], fileName, { type: 'application/json' }),
        purpose: "assistants",
      });
      
      // Associate with vector store
      await openai.vectorStores.files.create(vectorStoreId, {
        file_id: file.id,
      });
      
      // Store file ID in database
      try {
        console.log(`🔍 Looking for existing EducationalPage with topic_id: ${chapter.id}`);
        
        // Check if topic exists first
        const topicExists = await (prisma as any).topic.findFirst({
          where: { id: chapter.id },
          select: { id: true, title: true }
        });
        
        if (!topicExists) {
          console.warn(`⚠️ Topic with ID ${chapter.id} does not exist. Skipping database storage for this chapter.`);
          uploadedFiles.push({ chapterId: chapter.id, fileId: file.id });
          continue;
        }
        
        console.log(`✅ Found topic: ${topicExists.title} (ID: ${topicExists.id})`);
        
        // First try to update existing EducationalPage record
        const existingPage = await (prisma as any).educationalPage.findFirst({
          where: { topic_id: chapter.id }
        });
        
        console.log(`📄 Found existing page:`, existingPage ? 'YES' : 'NO');
        
        if (existingPage) {
          console.log(`🔄 Updating existing page ${existingPage.id} with file ID: ${file.id}`);
          await (prisma as any).educationalPage.update({
            where: { id: existingPage.id },
            data: { vector_file_id: file.id }
          });
          console.log(`✅ Successfully updated page ${existingPage.id}`);
        } else {
          console.log(`➕ Creating new EducationalPage with topic_id: ${chapter.id}, file ID: ${file.id}`);
          // Create new EducationalPage record if it doesn't exist
          const newPage = await (prisma as any).educationalPage.create({
            data: {
              topic_id: chapter.id,
              content_text: fullContent,
              vector_file_id: file.id,
              is_published: false
            }
          });
          console.log(`✅ Successfully created new page with ID: ${newPage.id}`);
        }
        
        uploadedFiles.push({ chapterId: chapter.id, fileId: file.id });
      } catch (dbError: any) {
        console.error(`❌ Database error for chapter ${chapter.id}:`, dbError);
        console.error(`Error details:`, {
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta
        });
        // Continue with upload even if database storage fails
      }
      
      uploadCount++;
      console.log(`✅ Uploaded chapter ${uploadCount}: ${chapter.title} (File ID: ${file.id})`);
      
      // Small delay between uploads
      if (uploadCount < chapters.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎉 Direct upload completed! ${uploadCount} chapters uploaded.`);
    console.log(`📁 Stored ${uploadedFiles.length} file IDs in database`);
    return { 
      uploadedChapters: uploadCount,
      uploadedFiles: uploadedFiles
    };
    
  } catch (error) {
    console.error("❌ Direct upload failed:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const status = await checkMigrationStatus();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check status", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
