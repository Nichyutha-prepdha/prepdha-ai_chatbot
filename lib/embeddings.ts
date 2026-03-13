import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { chapterEmbeddingSource } from "./chapter-content";
import { openaiVectorStore } from "./openai-vector-store";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_DIMENSIONS = 1536;
const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "local-embeddings.json");
const CHUNK_TOKEN_SIZE = 220;
const CHUNK_TOKEN_OVERLAP = 40;

export interface EmbeddingResult {
  id: string;
  content: string;
  embedding: number[];
  similarity?: number;
  chapter_id?: string;
  section_id?: string;
  book_id?: number;
  topic_id?: number;
  page_id?: number;
  chunk_index?: number;
  book_title?: string;
  topic_title?: string;
  page_title?: string;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " ").trim(),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function initializeVectorDatabase() {
  try {
    await openaiVectorStore.initializeVectorStore();
    console.log("OpenAI Vector Store initialized");
  } catch (error) {
    console.error("Error initializing OpenAI Vector Store:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize vector database: ${message}`);
  }
}

export async function storeDocumentEmbedding(
  content: string,
  embedding: number[],
  metadata: {
    chapter_id?: string;
    section_id?: string;
    book_id?: number;
    topic_id?: number;
    page_id?: number;
    chunk_index?: number;
    source?: string;
    content_hash?: string;
    book_title?: string;
    topic_title?: string;
    page_title?: string;
  }
): Promise<void> {
  try {
    const embeddingRecord: EmbeddingResult = {
      id: metadata?.content_hash || `emb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      embedding,
      chapter_id: metadata?.chapter_id,
      section_id: metadata?.section_id,
      book_id: metadata?.book_id,
      topic_id: metadata?.topic_id,
      page_id: metadata?.page_id,
      chunk_index: metadata?.chunk_index,
      book_title: metadata?.book_title,
      topic_title: metadata?.topic_title,
      page_title: metadata?.page_title,
    };

    // Add to OpenAI Vector Store
    await openaiVectorStore.addEmbeddings([embeddingRecord]);
    console.log(`✅ Stored embedding for ${content.substring(0, 50)}...`);
  } catch (error) {
    console.error("Error storing document embedding in OpenAI Vector Store:", error);
    throw new Error("Failed to store document embedding");
  }
}


// New function that accepts query text instead of embedding
export async function searchSimilarDocumentsByQuery(
  queryText: string,
  limit = 5,
  threshold = 0.3, // Lowered from 0.7 to 0.3 (30%) to allow more relevant results
  options?: {
    chapterId?: string | null;
    bookId?: number | null;
    topicId?: number | null;
  }
): Promise<EmbeddingResult[]> {
  try {
    console.log(`🔍 Starting OpenAI Vector Store search for query: "${queryText}"`);
    const results = await openaiVectorStore.searchSimilarDocuments(
      queryText,
      limit,
      options
    );
    console.log(`✅ OpenAI Vector Store search completed, got ${results.length} results`);

    // Filter by threshold
    const filteredResults = results.filter(
      (result) => (result.similarity || 0) >= threshold
    );

    console.log(`📊 After threshold filtering: ${filteredResults.length} results`);
    return filteredResults;
  } catch (error) {
    console.error("❌ Error searching OpenAI Vector Store by query:", error);
    return [];
  }
}


// New function to search using query text directly
export async function searchWithQueryText(
  queryText: string,
  limit = 5,
  threshold = 0.3, // Lowered from 0.7 to 0.3 (30%) to allow more relevant results
  options?: {
    chapterId?: string | null;
    bookId?: number | null;
    topicId?: number | null;
  }
): Promise<EmbeddingResult[]> {
  return searchSimilarDocumentsByQuery(queryText, limit, threshold, options);
}

export async function processChapterContent() {
  try {
    await initializeVectorDatabase();
    
    let totalChunks = 0;
    const allEmbeddings: EmbeddingResult[] = [];

    for (const chapter of chapterEmbeddingSource) {
      for (const section of chapter.sections) {
        const sectionText = stripHtmlToText(section.body);
        const chunks = splitTextIntoTokenChunks(sectionText, CHUNK_TOKEN_SIZE, CHUNK_TOKEN_OVERLAP);

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkForEmbedding =
            `Chapter: ${chapter.title}\n` +
            `${chapter.subtitle ? `Subtitle: ${chapter.subtitle}\n` : ""}` +
            `Section: ${section.title}\n` +
            `Content: ${chunk}`;
          
          const embedding = await generateEmbedding(chunkForEmbedding);
          const contentHash = hashContent(`${chapter.id}|${section.id}|${i}|${chunk}`);

          const embeddingRecord: EmbeddingResult = {
            id: `emb-${chapter.id}-${section.id}-${i}`,
            content: chunk,
            embedding,
            chapter_id: chapter.id,
            section_id: section.id,
            chunk_index: i,
            book_title: chapter.title,
            topic_title: section.title,
            page_title: section.title,
          };

          allEmbeddings.push(embeddingRecord);
          totalChunks += 1;
        }
      }

      if (chapter.vocabulary.length > 0) {
        const vocabText = chapter.vocabulary.map((item) => `${item.word}: ${item.definition}`).join("\n");
        const embedding = await generateEmbedding(`Chapter: ${chapter.title}\nVocabulary:\n${vocabText}`);
        const contentHash = hashContent(`${chapter.id}|vocabulary|${vocabText}`);
        
        const embeddingRecord: EmbeddingResult = {
          id: `emb-${chapter.id}-vocabulary`,
          content: vocabText,
          embedding,
          chapter_id: chapter.id,
          section_id: `${chapter.id}-vocabulary`,
          chunk_index: 0,
          book_title: chapter.title,
          topic_title: "Vocabulary",
          page_title: "Vocabulary",
        };

        allEmbeddings.push(embeddingRecord);
        totalChunks += 1;
      }
    }

    // Add all embeddings to OpenAI Vector Store in batches
    if (allEmbeddings.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < allEmbeddings.length; i += batchSize) {
        const batch = allEmbeddings.slice(i, i + batchSize);
        await openaiVectorStore.addEmbeddings(batch);
        console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allEmbeddings.length / batchSize)}`);
      }
    }

    console.log(`Chapter content processing completed. Total chunks: ${totalChunks}`);
    return { totalChunks };
  } catch (error) {
    console.error("Error processing chapter content:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process chapter content: ${message}`);
  }
}

export async function getLocalEmbeddingStatus() {
  try {
    const vectorStoreStatus = await openaiVectorStore.getVectorStoreStatus();
    const files = await openaiVectorStore.listFiles();
    
    return {
      status: {
        vectorExtension: true,
        embeddingsTable: true,
        isReady: true,
        backend: "openai-vector-store",
        vectorStoreId: vectorStoreStatus.id,
        vectorStoreName: vectorStoreStatus.name,
      },
      statistics: {
        total_embeddings: files.length,
        file_counts: vectorStoreStatus.file_counts,
        created_at: vectorStoreStatus.created_at,
        last_updated: vectorStoreStatus.created_at,
      },
      bookStatistics: [], // OpenAI Vector Store doesn't provide this level of detail
    };
  } catch (error) {
    console.error("Error getting OpenAI Vector Store status:", error);
    return {
      status: {
        vectorExtension: false,
        embeddingsTable: false,
        isReady: false,
        backend: "openai-vector-store",
        error: error instanceof Error ? error.message : String(error),
      },
      statistics: {
        total_embeddings: 0,
      },
      bookStatistics: [],
    };
  }
}






function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function stripHtmlToText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTextIntoTokenChunks(
  text: string,
  maxTokens: number,
  overlapTokens: number
): string[] {
  const clean = text.trim();
  if (!clean) return [];

  const tokens = tokenize(clean);
  if (tokens.length <= maxTokens) {
    return [detokenize(tokens)];
  }

  const chunks: string[] = [];
  const step = Math.max(1, maxTokens - overlapTokens);
  for (let start = 0; start < tokens.length; start += step) {
    const end = Math.min(tokens.length, start + maxTokens);
    const windowTokens = tokens.slice(start, end);
    if (windowTokens.length === 0) continue;
    chunks.push(detokenize(windowTokens));
    if (end === tokens.length) break;
  }

  return chunks;
}

function tokenize(text: string): string[] {
  // Lightweight tokenizer: words/numbers/contractions + punctuation symbols.
  // This is not model-exact BPE, but gives stable token-sized chunking with overlap.
  return text.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?|[^\s]/g) || [];
}

function detokenize(tokens: string[]): string {
  const noSpaceBefore = new Set([",", ".", "!", "?", ":", ";", ")", "]", "}", "%"]);
  const noSpaceAfter = new Set(["(", "[", "{", "$", "#"]);

  let result = "";
  for (const token of tokens) {
    if (!result) {
      result = token;
      continue;
    }

    const prev = result[result.length - 1];
    if (noSpaceBefore.has(token) || noSpaceAfter.has(prev)) {
      result += token;
    } else {
      result += ` ${token}`;
    }
  }

  return result.trim();
}
