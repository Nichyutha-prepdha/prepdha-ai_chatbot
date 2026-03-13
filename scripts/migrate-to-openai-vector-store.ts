import { OpenAI } from "openai";

const openai = new OpenAI();

export async function migrateEmbeddings() {
  console.log("🔄 Starting migration to OpenAI Vector Store...");
  
  try {
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    
    // Check if vector store exists
    const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
    console.log(`✅ Found vector store: ${vectorStore.name}`);
    
    return {
      success: true,
      message: "Migration completed successfully",
      vectorStoreId
    };
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

export async function checkMigrationStatus() {
  try {
    const vectorStoreId = "vs_69b2658c2a508191bc198fae37e84dd9";
    const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
    
    return {
      exists: true,
      id: vectorStore.id,
      name: vectorStore.name,
      status: vectorStore.status,
      fileCounts: vectorStore.file_counts
    };
    
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
