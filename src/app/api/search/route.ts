// Load environment variables
import { config } from "dotenv";
config({ path: ".env.local" });

import OpenAI from "openai";
import fs from "fs";
import { NextRequest } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Handle POST requests for search
export async function POST(req: NextRequest) {
  try {
    // Extract query and optional file_id from request
    const { query, file_id } = await req.json();

    // Validate query presence
    if (!query) {
      return new Response(JSON.stringify({ error: "Query required" }), {
        status: 400,
      });
    }

    // Read vector store ID from file
    const vectorStoreId = fs.readFileSync("vector_store_id.txt", "utf8").trim();

    // Create streaming response with file search tool
    const stream = await openai.responses.stream({
      model: "gpt-4.1",
      temperature: 0,
      input: [
        {
          role: "system",
          content: `You are a helpful AI assistant.
Do not use any knowledge outside the provided documents. Answer only based on the retrieved documents. If no relevant information is found in the documents, say 'I don't have information on that.'
Cite sources if possible.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
          // Add filter if file_id provided
          ...(file_id
            ? {
                filters: {
                  type: "eq",
                  key: "file_id",
                  value: file_id,
                },
              }
            : {}),
        },
      ],
    });

    // Create readable stream for response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Stream response deltas
        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(event.delta));
          }
        }

        controller.close();
      },
    });

    // Return streaming response
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}