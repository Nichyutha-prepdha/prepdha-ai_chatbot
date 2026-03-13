# Chapter Content Integration for Chatbot

This document explains how to use the chapter content extraction system to provide rich, contextual information to the chatbot.

## Overview

The chapter content system allows you to:
- Extract chapter content in various text formats
- Search across all chapters for relevant information
- Integrate chapter content into chatbot responses
- Generate study questions and summaries
- Access vocabulary and key topics

## Files Created

### Core Files
- `lib/chapter-content-extractor.ts` - Main content extraction utilities
- `lib/chatbot-content-integration.ts` - Integration functions for chatbot
- `lib/enhanced-chat-service.ts` - Enhanced chat service with chapter context
- `app/api/chapters/route.ts` - API endpoints for chapter content

### Demo and Documentation
- `scripts/demo-chapter-content.ts` - Demo script showing functionality
- `README-CHAPTER-CONTENT.md` - This documentation file

## API Endpoints

### Get Chapter List
```
GET /api/chapters?format=list
```
Returns a list of all available chapters with their IDs and status.

### Get Specific Chapter
```
GET /api/chapters?chapterId=chapter-1
```
Returns the full text content of a specific chapter.

### Get Chapter Context for Chatbot
```
GET /api/chapters?chapterId=chapter-1&format=context
```
Returns a concise version of the chapter content optimized for chatbot context.

### Get All Chapters
```
GET /api/chapters
```
Returns all chapters in full text format.

### Search Chapters
```
GET /api/chapters?query=Harsha
```
Searches across all chapters for the specified term and returns matching content.

## Usage Examples

### 1. Basic Content Extraction

```typescript
import { getChapterContextForChatbot, getAllChaptersAsText } from '@/lib/chapter-content-extractor'

// Get specific chapter context
const context = getChapterContextForChatbot('chapter-1')

// Get all chapters as text
const allText = getAllChaptersAsText()
```

### 2. Search Functionality

```typescript
import { searchChapters } from '@/lib/chapter-content-extractor'

// Search for content about "Harsha"
const results = searchChapters('Harsha')
results.forEach(result => {
  console.log(`Found in ${result.chapterTitle}:`)
  result.matches.forEach(match => console.log(`  - ${match}`))
})
```

### 3. Enhanced Chat Integration

```typescript
import { handleEnhancedChatRequest, generateContextualSuggestions } from '@/lib/enhanced-chat-service'

// Handle chat request with chapter context
const response = await handleEnhancedChatRequest({
  messages: [{ role: 'user', content: 'Who was Harsha?' }],
  chapterId: 'chapter-1'
})

// Generate contextual suggestions
const suggestions = generateContextualSuggestions('chapter-1', 'Who was Harsha?')
```

### 4. Study Tools

```typescript
import { 
  extractKeyTopics, 
  generateStudyQuestions, 
  createChapterSummary,
  getChapterVocabulary 
} from '@/lib/chatbot-content-integration'

// Get key topics
const topics = extractKeyTopics('chapter-1')

// Generate study questions
const questions = generateStudyQuestions('chapter-1', 5)

// Create chapter summary
const summary = createChapterSummary('chapter-1')

// Get vocabulary
const vocab = getChapterVocabulary('chapter-1')
```

## Chapter Structure

Each chapter contains:
- **Metadata**: ID, title, status, badge, subtitle
- **Sections**: Multiple content sections with titles and body text
- **Vocabulary**: Key terms with definitions

### Available Chapters
1. **Chapter 1**: Military Campaigns and Expansion (Harsha vs Sasanka)
2. **Chapter 2**: First Expedition Against Sasanka
3. **Chapter 3**: Conquest after Sasanka's death
4. **Chapter 4**: Conquest of Magadha
5. **Chapter 5**: Architecture and Monuments Under Harsha

## Integration with Existing Chatbot

To integrate with the existing chatbot in `components/right-panel.tsx`:

1. **Import the enhanced service**:
```typescript
import { handleEnhancedChatRequest, generateContextualSuggestions } from '@/lib/enhanced-chat-service'
```

2. **Update the sendToAI function** to use the enhanced service:
```typescript
const response = await handleEnhancedChatRequest({
  messages: messages.map(m => ({ role: m.role, content: m.content })),
  context: reference || chapterFallback || null,
  chapterId: currentChapterId || null
})
```

3. **Update suggestions generation**:
```typescript
const suggestions = generateContextualSuggestions(currentChapterId, lastUserMessage)
```

## Running the Demo

To see the system in action:

```bash
npx tsx scripts/demo-chapter-content.ts
```

This will demonstrate:
- Chapter listing
- Content extraction
- Search functionality
- Study question generation
- Summary creation
- Vocabulary extraction

## Features

### Content Formats
- **Full Text**: Complete chapter content with sections and vocabulary
- **Context Format**: Optimized for chatbot consumption
- **Summary**: Concise overview of key points
- **Vocabulary List**: Key terms and definitions

### Search Capabilities
- Search across titles, subtitles, section content, and vocabulary
- Case-insensitive matching
- Returns contextual matches with source information

### Study Tools
- Automatic key topic extraction
- Study question generation
- Chapter summaries
- Vocabulary lists

### Chatbot Integration
- Context-aware responses
- Relevant content extraction based on user queries
- Enhanced suggestions based on current chapter
- Key term extraction from user messages

## Benefits

1. **Rich Context**: Chatbot has access to comprehensive chapter content
2. **Accurate Responses**: Answers based on actual educational material
3. **Study Support**: Built-in tools for learning and assessment
4. **Easy Integration**: Simple API endpoints and utility functions
5. **Flexible Formats**: Multiple output formats for different use cases

## Future Enhancements

- Add more chapters and content
- Implement semantic search with embeddings
- Add interactive quizzes and assessments
- Support for multiple languages
- Integration with learning management systems
- Progress tracking and analytics
