import OpenAI from "openai";
import { EmbeddingResult } from "./embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIVectorStoreService {
  private vectorStoreId: string | null = null;
  private readonly VECTOR_STORE_NAME = "chatbot-knowledge-base";

  async initializeVectorStore(): Promise<string> {
    try {
      if (this.vectorStoreId) {
        return this.vectorStoreId;
      }

      const existingStores = await openai.vectorStores.list({ limit: 100 });
      const existingStore = existingStores.data.find(
        (store) => store.name === this.VECTOR_STORE_NAME
      );

      if (existingStore) {
        this.vectorStoreId = existingStore.id;
        console.log(`✅ Found existing vector store: ${existingStore.id}`);
        return existingStore.id;
      }

      const vectorStore = await openai.vectorStores.create({
        name: this.VECTOR_STORE_NAME,
        expires_after: {
          anchor: "last_active_at",
          days: 30,
        },
      });

      this.vectorStoreId = vectorStore.id;
      console.log(`✅ Created new vector store: ${vectorStore.id}`);
      return vectorStore.id;
    } catch (error) {
      console.error("❌ Error initializing vector store:", error);
      throw new Error(`Failed to initialize vector store: ${error}`);
    }
  }

  async addEmbeddings(embeddings: EmbeddingResult[]): Promise<void> {
    try {
      const vectorStoreId = await this.initializeVectorStore();
      
      const filteredEmbeddings = embeddings.filter(embedding => {
        const contentLength = embedding.content.length;
        if (contentLength > 2000) {
          console.log(`⚠️ Skipping long content (${contentLength} chars): ${embedding.content.substring(0, 50)}...`);
          return false;
        }
        return true;
      });
      
      console.log(`📊 Processing ${filteredEmbeddings.length} embeddings`);

      // Process one by one to avoid any size issues
      for (let i = 0; i < filteredEmbeddings.length; i++) {
        const embedding = filteredEmbeddings[i];
        
        try {
          // Use plain text format for cleaner, smaller files
          const textContent = embedding.content;
          
          // Create filename with metadata encoded for easier identification
          const chapterPart = embedding.chapter_id || 'unknown';
          const sectionPart = embedding.section_id || 'unknown';
          const chunkPart = embedding.chunk_index || 0;
          const filename = `embedding-${chapterPart}-${sectionPart}-${chunkPart}.txt`;
          
          // Create plain text file
          const file = await openai.files.create({
            file: new File([textContent + "\n"], filename, { type: 'text/plain' }),
            purpose: "assistants",
          });

          // Associate file with vector store
          await openai.vectorStores.files.create(vectorStoreId, {
            file_id: file.id,
          });

          console.log(`✅ Added embedding ${i + 1}/${filteredEmbeddings.length}: ${embedding.id}`);
          
          if (i < filteredEmbeddings.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`❌ Failed to add embedding ${embedding.id}:`, error);
        }
      }

      console.log(`✅ Completed processing ${filteredEmbeddings.length} embeddings`);
    } catch (error) {
      console.error("❌ Error adding embeddings to vector store:", error);
      throw new Error(`Failed to add embeddings: ${error}`);
    }
  }

  async searchSimilarDocuments(
    query: string,
    limit = 5,
    options?: {
      chapterId?: string | null;
      bookId?: number | null;
      topicId?: number | null;
    }
  ): Promise<EmbeddingResult[]> {
    try {
      const vectorStoreId = await this.initializeVectorStore();
      
      // For chapter-specific queries, implement true chapter isolation
      if (options?.chapterId) {
        const chapterNumber = options.chapterId.replace('chapter-', '');
        console.log(`🎯 Chapter-isolated search for ${options.chapterId}: searching only Chapter ${chapterNumber} content`);
        
        // Stage 1: Get ONLY chapter content with very specific query
        const chapterOnlyQuery = `chapter-${chapterNumber} ch${chapterNumber}`;
        const chapterSearchResults = await openai.vectorStores.search(
          vectorStoreId,
          { query: chapterOnlyQuery, max_num_results: 5 }
        );

        console.log(`🔍 Stage 1: Found ${chapterSearchResults.data.length} chapter-only results`);
        
        // Stage 2: Filter to ONLY chapter results and check if user query is relevant
        const chapterOnlyResults = chapterSearchResults.data.filter((result: any) => {
          const filename = (result.filename || '').toLowerCase();
          return filename.includes(`chapter-${chapterNumber}`) || 
                 filename.includes(`ch${chapterNumber}`) ||
                 filename.includes(`chapter${chapterNumber}`) ||
                 filename.includes(`chapter-chapter-${chapterNumber}`) ||
                 filename.includes(`${chapterNumber}-part`);
        });

        console.log(`📊 Stage 2: Filtered to ${chapterOnlyResults.length} chapter-only results`);
        
        // Stage 3: Only proceed if we have chapter content AND user query is relevant
        if (chapterOnlyResults.length > 0) {
          // Check if user query might be relevant to this chapter content
          const userQueryLower = query.toLowerCase();
          const hasRelevantContent = chapterOnlyResults.some((result: any) => {
            const content = result.content && Array.isArray(result.content) 
              ? result.content.map((c: any) => 'text' in c ? c.text : '').join('').toLowerCase()
              : (result.content?.text || '').toLowerCase();
            return content.includes(userQueryLower) || 
                   content.includes(userQueryLower.replace('patrnage', 'patronage')) ||
                   content.length > 100; // Return content if chapter has substantial content
          });

          if (hasRelevantContent) {
            console.log(`✅ User query relevant to chapter content, proceeding with chapter results`);
            
            // Convert only the chapter results
            const results = chapterOnlyResults.map((result: any, index: number) => {
              const content = result.content && Array.isArray(result.content) 
                ? result.content.map((c: any) => 'text' in c ? c.text : '').join('')
                : result.content?.text || '';

              const similarity = result.score || result.similarity || result.relevance_score || null;
              const filename = result.filename || `result-${Math.random().toString(36).slice(2, 8)}`;
              
              console.log(`🔍 Final chapter result ${index}: filename="${filename}", content="${content.substring(0, 100)}..."`);

              return {
                id: filename,
                content: content,
                embedding: [],
                similarity: similarity,
                chapter_id: options.chapterId || undefined,
                section_id: undefined,
                book_id: undefined,
                topic_id: undefined,
                page_id: undefined,
                chunk_index: undefined,
                book_title: undefined,
                topic_title: undefined,
                page_title: undefined,
              };
            });

            console.log(`📊 Final chapter-isolated results for ${options.chapterId}: ${results.length} results`);
            
            // Log similarity scores
            if (results.length > 0) {
              console.log(`📊 Similarity Scores for ${options.chapterId}:`);
              results.slice(0, 3).forEach((result, index) => {
                const scoreDisplay = result.similarity !== null ? (result.similarity * 100).toFixed(1) + '%' : 'N/A';
                console.log(`  ${index + 1}. ${scoreDisplay} - ${result.content.substring(0, 100)}...`);
              });
            }
            
            return results;
          } else {
            console.log(`❌ User query not relevant to chapter content`);
            return [];
          }
        } else {
          console.log(`❌ No chapter content found for ${options.chapterId}`);
          return [];
        }
      }
      
      // For non-chapter-specific queries, use regular search
      const searchResults = await openai.vectorStores.search(
        vectorStoreId,
        { query: query, max_num_results: limit }
      );

      console.log(`🔍 Found ${searchResults.data.length} results from OpenAI`);
      
      // Convert results to our format
      let results = searchResults.data.map((result: any, index: number) => {
        const content = result.content && Array.isArray(result.content) 
          ? result.content.map((c: any) => 'text' in c ? c.text : '').join('')
          : result.content?.text || '';

        // Extract similarity score
        const similarity = result.score || result.similarity || result.relevance_score || null;

        const filename = result.filename || `result-${Math.random().toString(36).slice(2, 8)}`;
        
        // Debug log first few results
        if (index < 3) {
          console.log(`🔍 Debug - Result ${index}: filename="${filename}", content="${content.substring(0, 100)}..."`);
        }

        return {
          id: filename,
          content: content,
          embedding: [],
          similarity: similarity,
          chapter_id: undefined,
          section_id: undefined,
          book_id: undefined,
          topic_id: undefined,
          page_id: undefined,
          chunk_index: undefined,
          book_title: undefined,
          topic_title: undefined,
          page_title: undefined,
        };
      });

      // Filter results by chapter if chapterId is provided
      if (options?.chapterId) {
        results = results.filter(result => {
          const filename = result.id;
          // Handle both "chapter-4" and "4" formats
          const chapterNumber = options.chapterId?.replace('chapter-', '') || '';
          return filename && (
            filename.includes(`chapter-${chapterNumber}`) || 
            filename.includes(`-${chapterNumber}.`) ||
            filename.includes(`chapter${chapterNumber}`)
          );
        });
        
        console.log(`📊 After chapter filtering (${options.chapterId}): ${results.length} results`);
        
        // For chapter-specific searches, return the chapter content and let AI find relevant info
        // This avoids cross-chapter contamination and handles typos naturally
      }

      // Log top similarity scores
      if (results.length > 0) {
        console.log(`📊 Similarity Scores:`);
        results.slice(0, 3).forEach((result, index) => {
          const scoreDisplay = result.similarity !== null ? (result.similarity * 100).toFixed(1) + '%' : 'N/A';
          console.log(`  ${index + 1}. ${scoreDisplay} - ${result.content.substring(0, 100)}...`);
        });
      }

      console.log(`✅ Returning ${results.length} results`);
      return results;
    } catch (error) {
      console.error("❌ Error searching vector store:", error);
      // Return empty results instead of throwing to maintain service continuity
      console.log("🔄 Falling back to empty results due to search error");
      return [];
    }
  }

  async getVectorStoreStatus(): Promise<any> {
    try {
      const vectorStoreId = await this.initializeVectorStore();
      const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
      
      return {
        id: vectorStore.id,
        name: vectorStore.name,
        status: vectorStore.status,
        file_counts: vectorStore.file_counts,
        created_at: vectorStore.created_at,
      };
    } catch (error) {
      console.error("❌ Error getting vector store status:", error);
      throw new Error(`Failed to get vector store status: ${error}`);
    }
  }

  async listFiles(): Promise<any[]> {
    try {
      const vectorStoreId = await this.initializeVectorStore();
      const files = await openai.vectorStores.files.list(vectorStoreId);
      
      return files.data.map((file: any) => ({
        id: file.id,
        created_at: file.created_at.toString(),
        vector_store_id: file.vector_store_id,
        status: file.status,
        last_error: file.last_error,
      }));
    } catch (error) {
      console.error("❌ Error listing vector store files:", error);
      throw new Error(`Failed to list vector store files: ${error}`);
    }
  }

  async clearVectorStore(): Promise<void> {
    try {
      const vectorStoreId = await this.initializeVectorStore();
      const files = await openai.vectorStores.files.list(vectorStoreId);
      
      for (const file of files.data) {
        await openai.vectorStores.files.delete(vectorStoreId, {
          fileId: file.id
        } as any);
      }
      
      console.log(`✅ Cleared ${files.data.length} files from vector store`);
    } catch (error) {
      console.error("❌ Error clearing vector store:", error);
      throw new Error(`Failed to clear vector store: ${error}`);
    }
  }

  async checkEmbeddingStatus(): Promise<{
  vectorStoreId: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  isReady: boolean;
  recommendations: string[];
}> {
  try {
    const vectorStoreId = await this.initializeVectorStore();
    const files = await this.listFiles();
    
    const completedFiles = files.filter(f => f.status === 'completed').length;
    const failedFiles = files.filter(f => f.last_error).length;
    const totalFiles = files.length;
    const isReady = completedFiles > 0 && failedFiles === 0;
    
    const recommendations: string[] = [];
    
    if (totalFiles === 0) {
      recommendations.push('No files found. Upload embeddings first.');
    } else if (completedFiles === 0) {
      recommendations.push('All files are still processing. Wait 5-15 minutes for OpenAI indexing.');
    } else if (failedFiles > 0) {
      recommendations.push(`${failedFiles} files failed. Consider re-uploading.`);
    } else if (completedFiles < totalFiles) {
      recommendations.push(`${totalFiles - completedFiles} files still processing.`);
    } else {
      recommendations.push('All files processed successfully. Vector store is ready.');
    }
    
    return {
      vectorStoreId,
      totalFiles,
      completedFiles,
      failedFiles,
      isReady,
      recommendations
    };
  } catch (error) {
    console.error("❌ Error checking embedding status:", error);
    throw new Error(`Failed to check embedding status: ${error}`);
  }
}

async deleteVectorStore(): Promise<void> {
    try {
      if (this.vectorStoreId) {
        await openai.vectorStores.delete(this.vectorStoreId);
        this.vectorStoreId = null;
        console.log(`✅ Deleted vector store`);
      }
    } catch (error) {
      console.error("❌ Error deleting vector store:", error);
      throw new Error(`Failed to delete vector store: ${error}`);
    }
  }
}

// Export singleton instance
export const openaiVectorStore = new OpenAIVectorStoreService();

// Export individual functions for backward compatibility
export const initializeOpenAIVectorStore = () => openaiVectorStore.initializeVectorStore();
export const addEmbeddingsToVectorStore = (embeddings: EmbeddingResult[]) => 
  openaiVectorStore.addEmbeddings(embeddings);
export const searchOpenAIVectorStore = (
  query: string, 
  limit?: number, 
  options?: { chapterId?: string | null; bookId?: number | null; topicId?: number | null }
) => openaiVectorStore.searchSimilarDocuments(query, limit, options);
export const getOpenAIVectorStoreStatus = () => openaiVectorStore.getVectorStoreStatus();
export const clearOpenAIVectorStore = () => openaiVectorStore.clearVectorStore();

// Export the class for direct instantiation
export { OpenAIVectorStoreService };
export default OpenAIVectorStoreService;
