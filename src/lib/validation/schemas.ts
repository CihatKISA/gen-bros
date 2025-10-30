import { z } from 'zod'

// Topic Generator Schemas
export const topicGeneratorSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
})

// Schema for a single topic from the AI response
export const topicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  contentType: z.string().min(1, 'Content type is required'),
  hashtags: z.array(z.string()).nonempty('Hashtags are required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  engagementHook: z.string().min(1, 'Engagement hook is required'),
});

// Schema for the entire AI response (an array of topics)
export const topicApiResponseSchema = z.array(topicSchema);

// Save Topic Schema
export const saveTopicSchema = z.object({
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
})

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Environment Variables Schema
export const envSchema = z.object({
  // Required variables
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters'),
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional variables
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().url().optional(),
  
  // Optional email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})
