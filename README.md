# AI Content Topic Generator

An AI-powered content topic generator tool built with Next.js 15, Payload CMS, and OpenAI's ChatGPT API. This application helps users identify engaging social media content topics within specific categories.

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production (Vercel + Neon)
- **[Database Setup](./DATABASE_SETUP.md)** - Database configuration and management

## Features

- 🤖 AI-powered topic generation using OpenAI GPT
- 👤 User authentication and authorization
- 💾 Save and manage generated topics
- 📊 User dashboard for topic management
- 🎨 Modern UI with ShadCN components and Tailwind CSS v4
- 🔒 Secure with rate limiting and input validation
- 📱 Fully responsive design
- ✅ Environment validation on build
- 🚀 Production-ready deployment configuration

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS
- **UI**: ShadCN (Radix UI) + Tailwind CSS v4
- **Database**: Neon PostgreSQL
- **AI**: OpenAI ChatGPT API
- **Authentication**: Payload Auth with JWT
- **Deployment**: Vercel + Neon
- **Validation**: Zod schemas with runtime checks

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

5. Seed the database with initial data:

```bash
npm run seed
```

This will create:
- Default Topic Generator tool module with rate limits
- Default categories (Digital Marketing, Technology, Health & Fitness, etc.)

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

8. Create an admin user by visiting [http://localhost:3000/admin](http://localhost:3000/admin)

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

## Default Data

After running the seed script, your database will contain:

### Tool Modules
- **Topic Generator**: AI-powered content topic generation with rate limiting (10/hour, 50/day)

### Categories
The following categories are available for topic generation:
- Digital Marketing
- Technology  
- Health & Fitness
- Business
- Education
- Entertainment
- Finance
- Travel
- Food & Cooking
- Fashion & Beauty

You can add more categories through the admin panel or by modifying the seed script.

## Environment Variables

All environment variables are validated on application startup. Missing or invalid variables will prevent the app from starting.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PAYLOAD_SECRET` | JWT signing key (min 32 chars) | Generate with `openssl rand -base64 32` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |
| `NODE_ENV` | Node environment | `development` or `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Redis URL for rate limiting | In-memory fallback |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token | - |
| `PAYLOAD_PUBLIC_SERVER_URL` | Payload server URL | Same as `NEXT_PUBLIC_APP_URL` |
| `SMTP_HOST` | Email server host | - |
| `SMTP_PORT` | Email server port | - |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |

### Environment Validation

Run the validation script to check your environment:

```bash
npm run validate-env
```

This will verify all required variables are present and properly formatted before building.

See `.env.example` for detailed documentation of all environment variables.

## Database Seeding

The project includes a seeding script to populate your database with initial data. This is useful for:
- Setting up a new development environment
- Resetting your database to a known state
- Deploying to a new environment

### What Gets Seeded

The seed script creates:

1. **Topic Generator Tool Module**
   - Name: Topic Generator
   - Slug: `topic-generator`
   - Rate Limits: 10 requests/hour, 50 requests/day
   - AI Configuration: GPT-4o-mini model with optimized settings

2. **Default Categories**
   - Digital Marketing
   - Technology
   - Health & Fitness
   - Business
   - Education
   - Entertainment
   - Finance
   - Travel
   - Food & Cooking
   - Fashion & Beauty

### Running the Seed Script

```bash
npm run seed
```

The script is idempotent - it checks for existing data and only creates what's missing. You can safely run it multiple times.

### Manual Seeding

If you prefer to manually add data, you can:
1. Start the development server: `npm run dev`
2. Visit the admin panel: `http://localhost:3000/admin`
3. Create an admin user
4. Add tool modules and categories through the admin UI

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

# Seed database
npm run seed
```

## Deployment

This project is optimized for deployment on Vercel with Neon PostgreSQL.

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.**

Quick steps:
1. Create a Neon PostgreSQL database
2. Push your code to GitHub
3. Import the project in Vercel
4. Add environment variables in Vercel dashboard
5. Deploy and seed the database

The build process includes automatic environment validation to catch configuration issues before deployment.

## License

MIT
