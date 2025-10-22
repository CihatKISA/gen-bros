# AI Content Topic Generator

An AI-powered content topic generator tool built with Next.js 15, Payload CMS, and OpenAI's ChatGPT API. This application helps users identify engaging social media content topics within specific categories.

## Features

- 🤖 AI-powered topic generation using OpenAI GPT
- 👤 User authentication and authorization
- 💾 Save and manage generated topics
- 📊 User dashboard for topic management
- 🎨 Modern UI with ShadCN components and Tailwind CSS v4
- 🔒 Secure with rate limiting and input validation
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS
- **UI**: ShadCN (Radix UI) + Tailwind CSS v4
- **Database**: Neon PostgreSQL
- **AI**: OpenAI ChatGPT API
- **Authentication**: Payload Auth with JWT
- **Deployment**: Vercel + Neon

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your environment variables:

```bash
cp .env.example .env.local
```

4. Set up your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PAYLOAD_SECRET`: A secure random string (min 32 characters)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_APP_URL`: Your app URL (http://localhost:3000 for development)

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ai-content-topic-generator/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Main app routes
│   ├── (auth)/                   # Auth routes
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── src/
│   ├── payload/                  # Payload CMS
│   │   ├── collections/          # Database collections
│   │   ├── access/               # Access control
│   │   └── payload.config.ts     # Payload configuration
│   ├── components/               # React components
│   │   ├── ui/                   # ShadCN components
│   │   ├── auth/                 # Auth components
│   │   ├── tools/                # Tool components
│   │   ├── dashboard/            # Dashboard components
│   │   └── layout/               # Layout components
│   ├── lib/                      # Utilities
│   │   ├── ai/                   # AI integration
│   │   ├── auth/                 # Auth utilities
│   │   ├── db/                   # Database queries
│   │   ├── validation/           # Validation schemas
│   │   └── errors/               # Error handling
│   └── types/                    # TypeScript types
├── components/                   # ShadCN components
├── lib/                          # Utilities
└── public/                       # Static assets
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

This project is optimized for deployment on Vercel with Neon PostgreSQL:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT
