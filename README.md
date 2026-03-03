# Chatbot Database Project

A Next.js chatbot application with PostgreSQL database integration using Prisma ORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Start PostgreSQL interactive terminal
psql -U postgres

# Enter password when prompted: 1234

# Create the database
CREATE DATABASE chatbot_db;

# Exit PostgreSQL
\q
```

### 3. Prisma Setup
```bash
# Generate Prisma client
npx prisma generate

# Push database schema to PostgreSQL
npx prisma db push
```

### 4. Environment Configuration
- Copy `.env.local.example` to `.env.local` if it exists
- Add your OpenAI API key to `.env.local`:
  ```
  OPENAI_API_KEY="your-openai-api-key-here"
  ```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and Prisma client
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Database Schema

The application uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

## Features

- Real-time chat interface
- Conversation management
- Message history
- PostgreSQL database persistence
- OpenAI API integration

## Development

- Run `npx prisma studio` to view database contents
- Use `npx prisma migrate dev` for schema changes in development
- Database file is located at `prisma/dev.db` for local development

## License

MIT
