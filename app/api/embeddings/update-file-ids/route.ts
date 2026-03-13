import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileMappings } = body; // Array of { topicId: string, fileId: string }

    if (!fileMappings || !Array.isArray(fileMappings)) {
      return NextResponse.json(
        { error: "fileMappings array is required" },
        { status: 400 }
      );
    }

    console.log(`📝 Starting to update ${fileMappings.length} file IDs...`);
    
    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let alreadyPresentCount = 0;
    const errors: string[] = [];

    for (const mapping of fileMappings) {
      try {
        let { topicId, fileId } = mapping;
        
        // Convert string topicId to number if necessary
        if (typeof topicId === 'string') {
          topicId = parseInt(topicId, 10);
          if (isNaN(topicId)) {
            console.error(`❌ Invalid topicId format: ${mapping.topicId} (must be number or numeric string)`);
            errors.push(`Invalid topicId format: ${mapping.topicId}`);
            continue;
          }
        }
        
        console.log(`🔍 Processing topic ${topicId} with file ID: ${fileId}`);
        
        // Check if topic exists
        const topicExists = await (prisma as any).topic.findFirst({
          where: { id: topicId },
          select: { id: true, title: true }
        });
        
        if (!topicExists) {
          console.warn(`⚠️ Topic with ID ${topicId} does not exist. Skipping.`);
          skippedCount++;
          continue;
        }
        
        console.log(`✅ Found topic: ${topicExists.title} (ID: ${topicExists.id})`);
        
        // Check if EducationalPage already exists
        const existingPage = await (prisma as any).educationalPage.findFirst({
          where: { topic_id: topicId }
        });
        
        if (existingPage) {
          // Check if the file ID is already the same
          if (existingPage.vector_file_id === fileId) {
            console.log(`⏭️ Topic ${topicId} already has file ID ${fileId}. Skipping.`);
            alreadyPresentCount++;
            continue;
          }
          
          // Update existing page with new file ID
          await (prisma as any).educationalPage.update({
            where: { id: existingPage.id },
            data: { vector_file_id: fileId }
          });
          console.log(`🔄 Updated existing page ${existingPage.id} with new file ID: ${fileId}`);
          updatedCount++;
        } else {
          // Create new page
          const newPage = await (prisma as any).educationalPage.create({
            data: {
              topic_id: topicId,
              vector_file_id: fileId,
              is_published: false
            }
          });
          console.log(`➕ Created new page with ID: ${newPage.id} and file ID: ${fileId}`);
          createdCount++;
        }
        
      } catch (error: any) {
        const errorMsg = `Failed to process topic ${mapping.topicId}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`🎉 Update completed!`);
    console.log(`📊 Results: ${updatedCount} updated, ${createdCount} created, ${alreadyPresentCount} already present, ${skippedCount} skipped (invalid topics)`);
    
    if (errors.length > 0) {
      console.error(`❌ ${errors.length} errors occurred:`, errors);
    }
    
    return NextResponse.json({
      success: true,
      message: "File IDs updated successfully",
      results: {
        updated: updatedCount,
        created: createdCount,
        alreadyPresent: alreadyPresentCount,
        skipped: skippedCount,
        errors: errors.length
      }
    });
    
  } catch (error) {
    console.error("❌ Update failed:", error);
    return NextResponse.json(
      { error: "Failed to update file IDs" },
      { status: 500 }
    );
  }
}
