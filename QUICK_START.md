# Quick Start Guide

Get the AI Content Topic Generator up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon or local)
- OpenAI API key

## Setup Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-content-topic-generator

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use your preferred editor
```

**Required variables:**
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
PAYLOAD_SECRET="your-32-character-secret-key-here"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Generate PAYLOAD_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Validate Environment

```bash
# Check all required variables are set
npm run validate-env
```

You should see: ✅ Environment validation passed!

### 4. Seed Database

```bash
# Populate with initial data
npm run seed
```

This creates:
- Topic Generator tool module
- 10 default categories

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Create Admin User

1. Go to http://localhost:3000/admin
2. Create your admin account
3. Login to access admin panel

## Verify Installation

### Test Topic Generation

1. Go to http://localhost:3000/topic-generator
2. Enter a category (e.g., "Digital Marketing")
3. Click "Generate Topics"
4. You should see 10 AI-generated topics

### Check Admin Panel

1. Go to http://localhost:3000/admin
2. Login with your admin account
3. Verify collections:
   - **Tool Modules**: Should have "Topic Generator"
   - **Categories**: Should have 10 categories
   - **Users**: Should have your admin user

## Common Issues

### Environment Validation Fails

```bash
# Check your .env file
cat .env

# Ensure all required variables are set
# DATABASE_URL must be a valid PostgreSQL connection string
# PAYLOAD_SECRET must be at least 32 characters
# OPENAI_API_KEY must start with 'sk-'
```

### Database Connection Error

```bash
# Test database connection
psql $DATABASE_URL

# If using Neon, ensure URL includes ?sslmode=require
```

### Seed Script Fails

```bash
# Ensure dev server is not running
# Kill any running processes on port 3000

# Run seed again
npm run seed
```

### Port 3000 Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Next Steps

- ✅ Read [README.md](./README.md) for full documentation
- ✅ See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- ✅ Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database details
- ✅ Start building your content topics!

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Validate environment
npm run validate-env

# Seed database
npm run seed
```

## Project Structure

```
ai-content-topic-generator/
├── app/                    # Next.js pages and routes
├── src/
│   ├── payload/           # Payload CMS configuration
│   ├── components/        # React components
│   ├── lib/              # Utilities and services
│   └── scripts/          # Database and utility scripts
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
└── package.json          # Dependencies and scripts
```

## Getting Help

- **Documentation**: Check README.md and other .md files
- **Issues**: Open an issue on GitHub
- **Logs**: Check terminal output for error messages

---

**Ready to generate amazing content topics!** 🚀
