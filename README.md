# RAG System Demo

A Retrieval-Augmented Generation (RAG) system built with Next.js, OpenAI API, and vector stores for intelligent document search and answering.

## Features

- **File Search**: Uses OpenAI's file_search tool to retrieve relevant information from uploaded documents.
- **File Filtering**: Supports filtering search results to specific files by providing a file ID.
- **Streaming Responses**: Real-time streaming of AI responses in the UI.
- **Document Upload**: Script to upload and index documents into a vector store.
- **Strict Document-Only Answers**: AI answers only from retrieved documents, no external knowledge.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Initialize vector store:
   ```bash
   node scripts/init-vector-store.js
   ```

4. Upload documents:
   ```bash
   node scripts/upload-files.js
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- Visit `http://localhost:3000`
- Enter a query in the search box
- Optionally provide a file ID to limit search to that specific file
- View streaming results

## File Structure

- `src/app/page.tsx`: Frontend UI
- `src/app/api/search/route.ts`: Search API endpoint
- `scripts/upload-files.js`: Document upload script
- `scripts/init-vector-store.js`: Vector store initialization
- `data/products.json`: Sample document data

## API

### POST /api/search

Request:
```json
{
  "query": "Your question",
  "file_id": "optional_file_id"
}
```

Response: Streaming text/plain response with the answer.

## License

MIT
