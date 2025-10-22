import { z } from 'zod'

// Topic Generator Schemas
export const topicGeneratorSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
})

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
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})
