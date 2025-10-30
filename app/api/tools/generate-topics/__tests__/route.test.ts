import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn(),
  buildConfig: vi.fn((config) => config),
}))

vi.mock('@/src/lib/ai/service', () => ({
  generateCompletion: vi.fn(),
}))

vi.mock('@/src/lib/ai/rate-limiter', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('@/src/lib/db', () => ({
  getToolBySlug: vi.fn(),
  updateUserUsageStats: vi.fn(),
}))

vi.mock('@/src/lib/logger', () => ({
  logAPIRequest: vi.fn(),
  logRateLimit: vi.fn(),
}))

vi.mock('@/src/lib/performance/monitoring', () => ({
  createTimer: vi.fn(() => ({
    end: vi.fn(() => 100),
  })),
}))

import { getPayload } from 'payload'
import { generateCompletion } from '@/src/lib/ai/service'
import { checkRateLimit } from '@/src/lib/ai/rate-limiter'
import { getToolBySlug } from '@/src/lib/db'

describe('POST /api/tools/generate-topics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate topics successfully for guest user', async () => {
    // Mock Payload auth (no user)
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
    } as any)

    // Mock AI service
    const mockTopics = [
      {
        title: 'Test Topic',
        description: 'Test description',
        contentType: 'How-to Guide',
        hashtags: ['#test'],
        targetAudience: 'Developers',
        engagementHook: 'Learn something new',
      },
    ]

    vi.mocked(generateCompletion).mockResolvedValue({
      content: JSON.stringify(mockTopics),
      tokensUsed: 100,
      model: 'gpt-4',
      processingTime: 500,
    })

    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: 'Technology' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.topics).toEqual(mockTopics)
    expect(data.metadata.tokensUsed).toBe(100)
    expect(data.metadata.model).toBe('gpt-4')
  })

  it('should check rate limit for authenticated user', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTool = {
      id: 'tool123',
      slug: 'topic-generator',
      rateLimits: {
        requestsPerHour: 10,
        requestsPerDay: 50,
      },
    }

    // Mock Payload auth (with user)
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    // Mock tool lookup
    vi.mocked(getToolBySlug).mockResolvedValue(mockTool as any)

    // Mock rate limit check (allowed)
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetAt: new Date(),
    })

    // Mock AI service
    vi.mocked(generateCompletion).mockResolvedValue({
      content: JSON.stringify([{ title: 'Test' }]),
      tokensUsed: 100,
      model: 'gpt-4',
      processingTime: 500,
    })

    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: 'Technology' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(checkRateLimit).toHaveBeenCalledWith(
      mockUser.id,
      mockTool.id,
      mockTool.rateLimits
    )
  })

  it('should return 429 when rate limit exceeded', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTool = {
      id: 'tool123',
      slug: 'topic-generator',
      rateLimits: {
        requestsPerHour: 10,
        requestsPerDay: 50,
      },
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getToolBySlug).mockResolvedValue(mockTool as any)

    const resetAt = new Date()
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt,
    })

    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: 'Technology' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Rate limit exceeded')
    expect(data.resetAt).toBeDefined()
  })

  it('should return 400 for invalid input', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: '' }), // Empty category
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })

  it('should handle AI service errors', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
    } as any)

    vi.mocked(generateCompletion).mockRejectedValue(
      new Error('AI service unavailable')
    )

    const request = new NextRequest('http://localhost:3000/api/tools/generate-topics', {
      method: 'POST',
      body: JSON.stringify({ category: 'Technology' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})
