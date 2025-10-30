import { describe, it, expect } from 'vitest'
import {
  topicGeneratorSchema,
  saveTopicSchema,
  registerSchema,
  loginSchema,
  envSchema,
} from '../schemas'

describe('topicGeneratorSchema', () => {
  it('should validate valid category', () => {
    const result = topicGeneratorSchema.safeParse({ category: 'Digital Marketing' })
    expect(result.success).toBe(true)
  })

  it('should reject empty category', () => {
    const result = topicGeneratorSchema.safeParse({ category: '' })
    expect(result.success).toBe(false)
  })

  it('should reject category over 100 characters', () => {
    const longCategory = 'a'.repeat(101)
    const result = topicGeneratorSchema.safeParse({ category: longCategory })
    expect(result.success).toBe(false)
  })

  it('should accept category at max length', () => {
    const maxCategory = 'a'.repeat(100)
    const result = topicGeneratorSchema.safeParse({ category: maxCategory })
    expect(result.success).toBe(true)
  })
})

describe('saveTopicSchema', () => {
  it('should validate valid save topic data', () => {
    const data = {
      toolId: 'topic-generator',
      title: 'Test Topic',
      content: { test: 'data' },
      input: { category: 'Tech' },
      metadata: {
        tokensUsed: 100,
        processingTime: 500,
        model: 'gpt-4',
      },
    }
    const result = saveTopicSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject missing required fields', () => {
    const data = {
      toolId: 'topic-generator',
    }
    const result = saveTopicSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept optional categoryId', () => {
    const data = {
      toolId: 'topic-generator',
      title: 'Test Topic',
      content: {},
      input: {},
      categoryId: 'cat-123',
    }
    const result = saveTopicSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject title over 200 characters', () => {
    const data = {
      toolId: 'topic-generator',
      title: 'a'.repeat(201),
      content: {},
      input: {},
    }
    const result = saveTopicSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('should validate valid registration data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'Password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject password without uppercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject password without lowercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'PASSWORD123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject password without number', () => {
    const data = {
      email: 'test@example.com',
      password: 'PasswordABC',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject password under 8 characters', () => {
    const data = {
      email: 'test@example.com',
      password: 'Pass1',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept optional firstName and lastName', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'anypassword',
    }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'not-an-email',
      password: 'password',
    }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const data = {
      email: 'test@example.com',
      password: '',
    }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('envSchema', () => {
  it('should validate valid environment variables', () => {
    const data = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PAYLOAD_SECRET: 'a'.repeat(32),
      OPENAI_API_KEY: 'sk-test123',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'development',
    }
    const result = envSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject PAYLOAD_SECRET under 32 characters', () => {
    const data = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PAYLOAD_SECRET: 'short',
      OPENAI_API_KEY: 'sk-test123',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }
    const result = envSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject OPENAI_API_KEY without sk- prefix', () => {
    const data = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PAYLOAD_SECRET: 'a'.repeat(32),
      OPENAI_API_KEY: 'invalid-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }
    const result = envSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept optional Redis variables', () => {
    const data = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      PAYLOAD_SECRET: 'a'.repeat(32),
      OPENAI_API_KEY: 'sk-test123',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      UPSTASH_REDIS_REST_URL: 'https://redis.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'token123',
    }
    const result = envSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
