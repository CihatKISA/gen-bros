# Design Document

## Overview

The AI-powered content topic generator is a full-stack web application built with Next.js 15 App Router and Payload CMS. The system provides both guest and authenticated user experiences, with AI-powered topic generation via OpenAI's ChatGPT API. The architecture is designed to be modular and extensible, allowing for easy addition of new AI-powered tools in the future.

### Key Design Principles

1. **Separation of Concerns**: Clear boundaries between CMS, frontend, API, and AI services
2. **Modularity**: Tool-agnostic architecture supporting multiple AI features
3. **Security First**: Authentication, authorization, and input validation at every layer
4. **Performance**: Optimized queries, caching, and lazy loading
5. **User Experience**: Seamless flows for both guest and authenticated users

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS (integrated within Next.js)
- **UI Components**: ShadCN (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle (via Payload)
- **Authentication**: Payload Auth with JWT
- **AI Service**: OpenAI ChatGPT API
- **Deployment**: Vercel (frontend) + Neon (database)

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Guest View  │  │  Auth Forms  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Page Routes │  │  API Routes  │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│     Payload CMS API      │   │   External Services      │
│  ┌────────────────────┐  │   │  ┌────────────────────┐  │
│  │  Collections       │  │   │  │  OpenAI API        │  │
│  │  - Users           │  │   │  │  - ChatGPT         │  │
│  │  - SavedTopics     │  │   │  └────────────────────┘  │
│  │  - ToolModules     │  │   └──────────────────────────┘
│  │  - Categories      │  │
│  └────────────────────┘  │
└──────────────────────────┘
                │
                ▼
┌──────────────────────────┐
│   Neon PostgreSQL        │
│  ┌────────────────────┐  │
│  │  Database Tables   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```


### Application Flow

```
Guest User Flow:
1. Visit homepage → 2. Access topic generator → 3. Enter category
→ 4. View AI results → 5. Attempt save → 6. Redirect to register/login

Authenticated User Flow:
1. Login → 2. Access topic generator → 3. Enter category
→ 4. View AI results → 5. Save topics → 6. View in dashboard
```

## Components and Interfaces

### Directory Structure

```
ai-content-topic-generator/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Main app group
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── topic-generator/
│   │   │   │   └── page.tsx          # Topic generator tool
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # User dashboard
│   │   │   └── layout.tsx            # App layout
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── api/                      # API routes
│   │   │   ├── tools/
│   │   │   │   └── generate-topics/
│   │   │   │       └── route.ts
│   │   │   └── users/
│   │   │       └── me/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── payload/                      # Payload CMS
│   │   ├── collections/
│   │   │   ├── Users.ts
│   │   │   ├── SavedTopics.ts
│   │   │   ├── ToolModules.ts
│   │   │   └── Categories.ts
│   │   ├── access/
│   │   │   ├── isAuthenticated.ts
│   │   │   └── isOwner.ts
│   │   └── payload.config.ts
│   ├── components/                   # React components
│   │   ├── ui/                       # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── tools/
│   │   │   ├── ToolLayout.tsx        # Base tool wrapper
│   │   │   ├── TopicGenerator/
│   │   │   │   ├── TopicGeneratorForm.tsx
│   │   │   │   ├── TopicResults.tsx
│   │   │   │   └── SaveTopicButton.tsx
│   │   │   └── shared/
│   │   │       ├── ToolInput.tsx
│   │   │       └── ToolOutput.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── SavedTopicsList.tsx
│   │   │   └── TopicCard.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   ├── lib/                          # Utilities
│   │   ├── ai/
│   │   │   ├── openai.ts             # OpenAI client
│   │   │   ├── prompts.ts            # Prompt templates
│   │   │   └── rate-limiter.ts       # Rate limiting
│   │   ├── auth/
│   │   │   ├── session.ts            # Session management
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── db/
│   │   │   └── queries.ts            # Database queries
│   │   ├── validation/
│   │   │   └── schemas.ts            # Zod schemas
│   │   └── utils.ts                  # Helper functions
│   ├── types/
│   │   ├── payload-types.ts          # Generated Payload types
│   │   ├── tool.ts                   # Tool interfaces
│   │   └── index.ts
│   └── middleware.ts                 # Next.js middleware
├── public/
│   ├── images/
│   └── icons/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```


### Component Architecture

#### Base Tool Interface

All AI tools implement a common interface for consistency:

```typescript
// src/types/tool.ts
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  enabled: boolean;
}

export interface ToolInput {
  [key: string]: any;
}

export interface ToolOutput {
  id: string;
  toolId: string;
  userId?: string;
  input: ToolInput;
  output: any;
  metadata: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
  };
  createdAt: Date;
}

export interface ToolModule {
  config: ToolConfig;
  generatePrompt: (input: ToolInput) => string;
  processResponse: (response: string) => any;
  validateInput: (input: ToolInput) => boolean;
}
```

#### Topic Generator Implementation

```typescript
// src/lib/tools/topic-generator.ts
export const topicGeneratorModule: ToolModule = {
  config: {
    id: 'topic-generator',
    name: 'Topic Generator',
    description: 'Generate engaging social media content topics',
    slug: 'topic-generator',
    enabled: true,
  },
  
  generatePrompt: (input: ToolInput) => {
    const { category } = input;
    return `You are a social media content strategist. Generate 10 highly engaging content topic ideas for the category: "${category}". 
    
    For each topic:
    - Make it specific and actionable
    - Focus on engagement potential
    - Consider current trends
    - Ensure variety in approach
    
    Return as a JSON array of objects with: title, description, hashtags, targetAudience`;
  },
  
  processResponse: (response: string) => {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback parsing logic
      return parseTopicsFromText(response);
    }
  },
  
  validateInput: (input: ToolInput) => {
    return typeof input.category === 'string' && input.category.length > 0;
  },
};
```


## Data Models

### Database Schema

#### Users Collection (Payload)

```typescript
// src/payload/collections/Users.ts
import { CollectionConfig } from 'payload/types';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user) {
        return {
          id: { equals: user.id },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return false;
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['user', 'admin'],
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'theme',
          type: 'select',
          options: ['light', 'dark', 'system'],
          defaultValue: 'system',
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'usageStats',
      type: 'group',
      fields: [
        {
          name: 'totalGenerations',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'lastGenerationAt',
          type: 'date',
        },
      ],
    },
  ],
  timestamps: true,
};
```

#### SavedTopics Collection

```typescript
// src/payload/collections/SavedTopics.ts
import { CollectionConfig } from 'payload/types';

export const SavedTopics: CollectionConfig = {
  slug: 'saved-topics',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tool', 'user', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'tool',
      type: 'relationship',
      relationTo: 'tool-modules',
      required: true,
      hasMany: false,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'json',
      required: true,
    },
    {
      name: 'input',
      type: 'json',
      required: true,
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'tokensUsed',
          type: 'number',
        },
        {
          name: 'processingTime',
          type: 'number',
        },
        {
          name: 'model',
          type: 'text',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'isFavorite',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['user', 'createdAt'],
    },
    {
      fields: ['tool', 'user'],
    },
  ],
};
```


#### ToolModules Collection

```typescript
// src/payload/collections/ToolModules.ts
import { CollectionConfig } from 'payload/types';

export const ToolModules: CollectionConfig = {
  slug: 'tool-modules',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'config',
      type: 'json',
      admin: {
        description: 'Tool-specific configuration',
      },
    },
    {
      name: 'rateLimits',
      type: 'group',
      fields: [
        {
          name: 'requestsPerHour',
          type: 'number',
          defaultValue: 10,
        },
        {
          name: 'requestsPerDay',
          type: 'number',
          defaultValue: 50,
        },
      ],
    },
  ],
  timestamps: true,
};
```

#### Categories Collection

```typescript
// src/payload/collections/Categories.ts
import { CollectionConfig } from 'payload/types';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    {
      name: 'icon',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
};
```

### Database Relationships

```
Users (1) ──────< (N) SavedTopics
ToolModules (1) ─< (N) SavedTopics
Categories (1) ──< (N) SavedTopics
Categories (1) ──< (N) Categories (self-referential for hierarchy)
```

### Indexes Strategy

```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- SavedTopics table
CREATE INDEX idx_saved_topics_user_created ON saved_topics(user_id, created_at DESC);
CREATE INDEX idx_saved_topics_tool_user ON saved_topics(tool_id, user_id);
CREATE INDEX idx_saved_topics_category ON saved_topics(category_id);
CREATE INDEX idx_saved_topics_favorite ON saved_topics(user_id, is_favorite) WHERE is_favorite = true;

-- ToolModules table
CREATE INDEX idx_tool_modules_slug ON tool_modules(slug);
CREATE INDEX idx_tool_modules_enabled ON tool_modules(enabled) WHERE enabled = true;

-- Categories table
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```


## Authentication and Authorization

### Authentication Flow

```
Registration Flow:
1. User submits email + password
2. Validate input (Zod schema)
3. Check email uniqueness
4. Hash password (bcrypt via Payload)
5. Create user record
6. Generate JWT token
7. Set HTTP-only cookie
8. Return user data

Login Flow:
1. User submits credentials
2. Validate input
3. Query user by email
4. Verify password hash
5. Check account status (locked, verified)
6. Generate JWT token
7. Set HTTP-only cookie
8. Update last login timestamp
9. Return user data

Session Validation:
1. Extract JWT from cookie
2. Verify token signature
3. Check expiration
4. Load user from database
5. Attach user to request context
```

### Middleware Implementation

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/api/tools/save'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Auth routes (redirect if already authenticated)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/api/tools/:path*',
  ],
};
```

### Access Control Patterns

```typescript
// src/payload/access/isAuthenticated.ts
import { Access } from 'payload/types';

export const isAuthenticated: Access = ({ req: { user } }) => {
  return !!user;
};

// src/payload/access/isOwner.ts
import { Access } from 'payload/types';

export const isOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  
  return {
    user: {
      equals: user.id,
    },
  };
};

// src/payload/access/isAdminOrOwner.ts
import { Access } from 'payload/types';

export const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  
  if (user.role === 'admin') return true;
  
  return {
    user: {
      equals: user.id,
    },
  };
};
```


## AI Integration

### OpenAI Client Setup

```typescript
// src/lib/ai/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const MAX_TOKENS = 2000;
export const TEMPERATURE = 0.7;
```

### Prompt Engineering

```typescript
// src/lib/ai/prompts.ts
export const SYSTEM_PROMPTS = {
  topicGenerator: `You are an expert social media content strategist with deep knowledge of engagement patterns, trending topics, and audience psychology. Your goal is to generate highly engaging, actionable content topics that drive interaction and growth.

Guidelines:
- Focus on topics that spark conversation and engagement
- Consider current trends and timeless evergreen content
- Ensure topics are specific and actionable
- Vary the content types (educational, entertaining, inspirational, etc.)
- Include relevant hashtag suggestions
- Consider the target audience's pain points and interests`,
};

export function buildTopicGeneratorPrompt(category: string): string {
  return `Generate 10 highly engaging social media content topic ideas for the category: "${category}".

For each topic, provide:
1. Title: A compelling, attention-grabbing title (max 100 characters)
2. Description: A brief explanation of the topic and why it's engaging (max 200 characters)
3. Content Type: The format (e.g., "How-to Guide", "List Post", "Case Study", "Behind-the-Scenes")
4. Hashtags: 3-5 relevant hashtags
5. Target Audience: Who would find this most valuable
6. Engagement Hook: What makes this topic shareable/engaging

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "string",
    "description": "string",
    "contentType": "string",
    "hashtags": ["string"],
    "targetAudience": "string",
    "engagementHook": "string"
  }
]`;
}
```

### Rate Limiting Implementation

```typescript
// src/lib/ai/rate-limiter.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export interface RateLimitConfig {
  requestsPerHour: number;
  requestsPerDay: number;
}

export async function checkRateLimit(
  userId: string,
  toolId: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const hourKey = `ratelimit:${toolId}:${userId}:hour:${getHourKey()}`;
  const dayKey = `ratelimit:${toolId}:${userId}:day:${getDayKey()}`;

  const [hourCount, dayCount] = await Promise.all([
    redis.incr(hourKey),
    redis.incr(dayKey),
  ]);

  // Set expiration on first request
  if (hourCount === 1) {
    await redis.expire(hourKey, 3600); // 1 hour
  }
  if (dayCount === 1) {
    await redis.expire(dayKey, 86400); // 24 hours
  }

  const hourAllowed = hourCount <= config.requestsPerHour;
  const dayAllowed = dayCount <= config.requestsPerDay;

  return {
    allowed: hourAllowed && dayAllowed,
    remaining: Math.min(
      config.requestsPerHour - hourCount,
      config.requestsPerDay - dayCount
    ),
    resetAt: hourAllowed 
      ? new Date(Date.now() + 3600000) 
      : new Date(Date.now() + 86400000),
  };
}

function getHourKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
}

function getDayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}
```

### AI Service Layer

```typescript
// src/lib/ai/service.ts
import { openai, DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE } from './openai';
import { SYSTEM_PROMPTS } from './prompts';

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateCompletion(
  options: GenerateOptions
): Promise<{ content: string; tokensUsed: number; model: string }> {
  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      max_tokens: options.maxTokens || MAX_TOKENS,
      temperature: options.temperature || TEMPERATURE,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed,
      model: response.model,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}
```


## API Routes

### Topic Generation Endpoint

```typescript
// src/app/api/tools/generate-topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCompletion } from '@/lib/ai/service';
import { buildTopicGeneratorPrompt, SYSTEM_PROMPTS } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { getPayload } from 'payload';

const requestSchema = z.object({
  category: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = requestSchema.parse(body);

    // Get user from session (optional for guests)
    const payload = await getPayload();
    const { user } = await payload.auth({ headers: request.headers });

    // Check rate limit if user is authenticated
    if (user) {
      const toolModule = await payload.find({
        collection: 'tool-modules',
        where: { slug: { equals: 'topic-generator' } },
      });

      if (toolModule.docs.length > 0) {
        const rateLimitConfig = toolModule.docs[0].rateLimits;
        const rateLimit = await checkRateLimit(
          user.id,
          toolModule.docs[0].id,
          rateLimitConfig
        );

        if (!rateLimit.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              resetAt: rateLimit.resetAt,
            },
            { status: 429 }
          );
        }
      }
    }

    // Generate topics using AI
    const result = await generateCompletion({
      systemPrompt: SYSTEM_PROMPTS.topicGenerator,
      userPrompt: buildTopicGeneratorPrompt(category),
    });

    const topics = JSON.parse(result.content);

    // Update usage stats if authenticated
    if (user) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          'usageStats.totalGenerations': (user.usageStats?.totalGenerations || 0) + 1,
          'usageStats.lastGenerationAt': new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      topics,
      metadata: {
        tokensUsed: result.tokensUsed,
        model: result.model,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Topic generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
}
```

### Save Topic Endpoint

```typescript
// src/app/api/tools/save-topic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPayload } from 'payload';

const saveTopicSchema = z.object({
  toolId: z.string(),
  title: z.string().min(1).max(200),
  content: z.any(),
  input: z.any(),
  categoryId: z.string().optional(),
  metadata: z.object({
    tokensUsed: z.number().optional(),
    processingTime: z.number().optional(),
    model: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload();
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = saveTopicSchema.parse(body);

    // Check for duplicate
    const existing = await payload.find({
      collection: 'saved-topics',
      where: {
        and: [
          { user: { equals: user.id } },
          { title: { equals: data.title } },
          { tool: { equals: data.toolId } },
        ],
      },
    });

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'Topic already saved' },
        { status: 409 }
      );
    }

    const savedTopic = await payload.create({
      collection: 'saved-topics',
      data: {
        user: user.id,
        tool: data.toolId,
        category: data.categoryId,
        title: data.title,
        content: data.content,
        input: data.input,
        metadata: data.metadata,
      },
    });

    return NextResponse.json({ savedTopic }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Save topic error:', error);
    return NextResponse.json(
      { error: 'Failed to save topic' },
      { status: 500 }
    );
  }
}
```


## Frontend Components

### Topic Generator Form

```typescript
// src/components/tools/TopicGenerator/TopicGeneratorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100),
});

interface TopicGeneratorFormProps {
  onGenerate: (topics: any[], metadata: any) => void;
}

export function TopicGeneratorForm({ onGenerate }: TopicGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate topics');
      }

      const { topics, metadata } = await response.json();
      onGenerate(topics, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Digital Marketing, Fitness, Technology"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Topics...
            </>
          ) : (
            'Generate Topics'
          )}
        </Button>
      </form>
    </Form>
  );
}
```

### Topic Results Display

```typescript
// src/components/tools/TopicGenerator/TopicResults.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaveTopicButton } from './SaveTopicButton';

interface Topic {
  title: string;
  description: string;
  contentType: string;
  hashtags: string[];
  targetAudience: string;
  engagementHook: string;
}

interface TopicResultsProps {
  topics: Topic[];
  category: string;
  metadata: any;
}

export function TopicResults({ topics, category, metadata }: TopicResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Topics</h2>
        <div className="text-sm text-muted-foreground">
          {topics.length} topics • {metadata.tokensUsed} tokens
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {topic.description}
                  </CardDescription>
                </div>
                <SaveTopicButton
                  topic={topic}
                  category={category}
                  metadata={metadata}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="secondary" className="ml-2">
                  {topic.contentType}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium">Target Audience:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {topic.targetAudience}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium">Engagement Hook:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {topic.engagementHook}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {topic.hashtags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```


### Save Topic Button with Auth Check

```typescript
// src/components/tools/TopicGenerator/SaveTopicButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SaveTopicButtonProps {
  topic: any;
  category: string;
  metadata: any;
}

export function SaveTopicButton({ topic, category, metadata }: SaveTopicButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  async function handleSave() {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/tools/save-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'topic-generator',
          title: topic.title,
          content: topic,
          input: { category },
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save topic');
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleSave}
        disabled={isSaving || isSaved || isLoading}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to save topics</DialogTitle>
            <DialogDescription>
              Create an account or sign in to save your generated topics and access them later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Dashboard Layout

```typescript
// src/components/dashboard/DashboardLayout.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedTopicsList } from './SavedTopicsList';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email}
        </p>
      </div>

      <Tabs defaultValue="topic-generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="topic-generator">Topic Generator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="topic-generator" className="space-y-4">
          <SavedTopicsList toolSlug="topic-generator" />
        </TabsContent>

        <TabsContent value="settings">
          {/* Settings content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```


## Error Handling

### Error Handling Strategy

```typescript
// src/lib/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    public resetAt?: Date
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'AI service unavailable') {
    super(message, 503, 'AI_SERVICE_ERROR');
  }
}
```

### Global Error Handler

```typescript
// src/lib/errors/handler.ts
import { NextResponse } from 'next/server';
import { AppError } from './AppError';
import { ZodError } from 'zod';

export function handleError(error: unknown) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof RateLimitError && { resetAt: error.resetAt }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
```

### Client-Side Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We're sorry for the inconvenience. Please try again.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```


## Testing Strategy

### Testing Approach

1. **Unit Tests**: Test individual functions and utilities
2. **Integration Tests**: Test API routes and database operations
3. **Component Tests**: Test React components in isolation
4. **E2E Tests**: Test complete user flows

### Testing Tools

- **Unit/Integration**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: MSW (Mock Service Worker)

### Test Examples

```typescript
// __tests__/lib/ai/prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildTopicGeneratorPrompt } from '@/lib/ai/prompts';

describe('buildTopicGeneratorPrompt', () => {
  it('should include the category in the prompt', () => {
    const prompt = buildTopicGeneratorPrompt('Digital Marketing');
    expect(prompt).toContain('Digital Marketing');
  });

  it('should request JSON format', () => {
    const prompt = buildTopicGeneratorPrompt('Fitness');
    expect(prompt).toContain('JSON');
  });
});
```

```typescript
// __tests__/api/generate-topics.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/tools/generate-topics/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/ai/service', () => ({
  generateCompletion: vi.fn().mockResolvedValue({
    content: JSON.stringify([{ title: 'Test Topic' }]),
    tokensUsed: 100,
    model: 'gpt-4',
  }),
}));

describe('POST /api/tools/generate-topics', () => {
  it('should generate topics successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: 'Tech' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topics).toBeDefined();
    expect(data.metadata.tokensUsed).toBe(100);
  });

  it('should return 400 for invalid input', async () => {
    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: '' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

## Performance Optimization

### Caching Strategy

```typescript
// src/lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  await redis.setex(key, ttl, data);
  
  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### Database Query Optimization

```typescript
// src/lib/db/queries.ts
import { getPayload } from 'payload';

export async function getUserSavedTopics(
  userId: string,
  options: {
    limit?: number;
    page?: number;
    toolSlug?: string;
  } = {}
) {
  const payload = await getPayload();
  
  const where: any = {
    user: { equals: userId },
  };

  if (options.toolSlug) {
    const tool = await payload.find({
      collection: 'tool-modules',
      where: { slug: { equals: options.toolSlug } },
      limit: 1,
    });

    if (tool.docs.length > 0) {
      where.tool = { equals: tool.docs[0].id };
    }
  }

  return payload.find({
    collection: 'saved-topics',
    where,
    limit: options.limit || 20,
    page: options.page || 1,
    sort: '-createdAt',
    depth: 2, // Include tool and category relations
  });
}
```

### Image Optimization

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
```

### Code Splitting

```typescript
// src/app/(app)/dashboard/page.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLayout = dynamic(
  () => import('@/components/dashboard/DashboardLayout').then(mod => ({ default: mod.DashboardLayout })),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false,
  }
);

export default function DashboardPage() {
  return <DashboardLayout />;
}
```


## Security Considerations

### Input Sanitization

```typescript
// src/lib/validation/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
}
```

### CSRF Protection

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && !origin.includes(host || '')) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}
```

### Rate Limiting (Additional Layer)

```typescript
// src/lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Global rate limiter for API routes
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});

// Strict rate limiter for auth endpoints
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});
```

### Environment Variables Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Payload
  PAYLOAD_SECRET: z.string().min(32),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  
  // Redis (optional for caching)
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

## Deployment Configuration

### Environment Variables (.env.example)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Payload CMS
PAYLOAD_SECRET=your-secret-key-min-32-characters
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Redis (Optional - for caching and rate limiting)
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email (Optional - for Payload auth)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "PAYLOAD_SECRET": "@payload-secret",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Database Migration Strategy

```typescript
// src/scripts/seed.ts
import { getPayload } from 'payload';

async function seed() {
  const payload = await getPayload();

  // Create default tool module
  await payload.create({
    collection: 'tool-modules',
    data: {
      name: 'Topic Generator',
      slug: 'topic-generator',
      description: 'Generate engaging social media content topics',
      enabled: true,
      rateLimits: {
        requestsPerHour: 10,
        requestsPerDay: 50,
      },
    },
  });

  // Create default categories
  const categories = [
    'Digital Marketing',
    'Technology',
    'Health & Fitness',
    'Business',
    'Education',
    'Entertainment',
  ];

  for (const name of categories) {
    await payload.create({
      collection: 'categories',
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  console.log('Seed completed successfully');
}

seed().catch(console.error);
```


## Monitoring and Logging

### Logging Strategy

```typescript
// src/lib/logger/index.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
});

export function logAIRequest(data: {
  userId?: string;
  toolId: string;
  tokensUsed: number;
  processingTime: number;
  success: boolean;
}) {
  logger.info({
    type: 'ai_request',
    ...data,
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error({
    type: 'error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  });
}
```

### Analytics Integration

```typescript
// src/lib/analytics/index.ts
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    });
  }
}

// Usage in components
export function useAnalytics() {
  const trackTopicGeneration = (category: string, success: boolean) => {
    trackEvent('topic_generation', {
      category,
      success,
    });
  };

  const trackTopicSave = (toolId: string) => {
    trackEvent('topic_save', {
      tool_id: toolId,
    });
  };

  return {
    trackTopicGeneration,
    trackTopicSave,
  };
}
```

## Scalability Considerations

### Horizontal Scaling

The application is designed to scale horizontally:

1. **Stateless API**: All API routes are stateless, using JWT for authentication
2. **Database Connection Pooling**: Neon PostgreSQL handles connection pooling automatically
3. **Redis for Session State**: Optional Redis integration for distributed caching
4. **CDN for Static Assets**: Vercel Edge Network handles static asset distribution

### Performance Targets

- **Page Load Time**: < 3 seconds (LCP)
- **API Response Time**: < 500ms (p95)
- **Database Query Time**: < 100ms (p95)
- **AI Generation Time**: < 10 seconds (p95)

### Monitoring Metrics

```typescript
// Key metrics to monitor
const metrics = {
  // Application
  'api.request.duration': 'histogram',
  'api.request.count': 'counter',
  'api.error.count': 'counter',
  
  // AI Service
  'ai.generation.duration': 'histogram',
  'ai.generation.tokens': 'histogram',
  'ai.generation.cost': 'gauge',
  'ai.error.count': 'counter',
  
  // Database
  'db.query.duration': 'histogram',
  'db.connection.count': 'gauge',
  
  // User Activity
  'user.registration.count': 'counter',
  'user.login.count': 'counter',
  'topic.generation.count': 'counter',
  'topic.save.count': 'counter',
};
```

## Future Enhancements

### Phase 2 Features

1. **Additional AI Tools**
   - Content Calendar Generator
   - Hashtag Optimizer
   - Caption Writer
   - Image Prompt Generator

2. **Enhanced User Features**
   - Topic collections/folders
   - Sharing saved topics
   - Export to various formats (PDF, CSV, Notion)
   - Collaboration features

3. **Advanced AI Features**
   - Fine-tuned models for specific niches
   - Multi-language support
   - Trend analysis integration
   - Competitor content analysis

4. **Analytics Dashboard**
   - Usage statistics
   - Cost tracking
   - Popular categories
   - User engagement metrics

### Technical Debt Considerations

1. **Testing Coverage**: Aim for 80%+ code coverage
2. **Documentation**: Comprehensive API documentation with OpenAPI/Swagger
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Internationalization**: i18n support for multiple languages
5. **Mobile App**: React Native app using the same API

## Design Decisions and Rationales

### Why Payload CMS?

- **Integrated Solution**: CMS and frontend in one codebase
- **Type Safety**: Full TypeScript support with generated types
- **Flexibility**: Customizable collections and fields
- **Authentication**: Built-in auth system
- **Admin UI**: Automatic admin panel generation

### Why Next.js App Router?

- **Server Components**: Better performance with RSC
- **Streaming**: Progressive rendering for better UX
- **Layouts**: Shared layouts reduce code duplication
- **API Routes**: Collocated API endpoints
- **Middleware**: Request-level logic for auth and routing

### Why Neon PostgreSQL?

- **Serverless**: Auto-scaling and pay-per-use
- **Branching**: Database branches for development
- **Performance**: Fast queries with connection pooling
- **Compatibility**: Full PostgreSQL compatibility

### Why ShadCN?

- **Customizable**: Copy-paste components, not a dependency
- **Accessible**: Built on Radix UI primitives
- **Consistent**: Unified design system
- **Flexible**: Easy to modify and extend

### Why OpenAI GPT-4?

- **Quality**: Best-in-class text generation
- **JSON Mode**: Structured output support
- **Reliability**: High uptime and performance
- **Cost-Effective**: Reasonable pricing for the quality

## Conclusion

This design provides a solid foundation for building a scalable, maintainable AI-powered content topic generator. The modular architecture allows for easy addition of new tools, while the security and performance considerations ensure a production-ready application. The use of modern technologies like Next.js 15, Payload CMS, and Tailwind CSS v4 provides an excellent developer experience and optimal user experience.
