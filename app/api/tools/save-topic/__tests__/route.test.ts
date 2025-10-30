import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { AuthenticationError } from '@/src/lib/errors/AppError'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn(),
  buildConfig: vi.fn((config) => config),
}))

vi.mock('@/src/lib/db', () => ({
  getToolBySlug: vi.fn(),
  isTopicSaved: vi.fn(),
}))

vi.mock('@/src/lib/cache', () => ({
  invalidateCache: vi.fn(),
}))

vi.mock('@/src/lib/logger', () => ({
  logAPIRequest: vi.fn(),
  logUserActivity: vi.fn(),
}))

vi.mock('@/src/lib/performance/monitoring', () => ({
  createTimer: vi.fn(() => ({
    end: vi.fn(() => 100),
  })),
}))

import { getPayload } from 'payload'
import { getToolBySlug, isTopicSaved } from '@/src/lib/db'

describe('POST /api/tools/save-topic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should save topic successfully for authenticated user', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTool = { id: 'tool123', slug: 'topic-generator' }
    const mockSavedTopic = {
      id: 'saved123',
      user: mockUser.id,
      tool: mockTool.id,
      title: 'Test Topic',
      content: { test: 'data' },
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
      create: vi.fn().mockResolvedValue(mockSavedTopic),
    } as any)

    vi.mocked(getToolBySlug).mockResolvedValue(mockTool as any)
    vi.mocked(isTopicSaved).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/tools/save-topic', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'topic-generator',
        title: 'Test Topic',
        content: { test: 'data' },
        input: { category: 'Tech' },
        metadata: { tokensUsed: 100 },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.savedTopic).toEqual(mockSavedTopic)
  })

  it('should return 401 for unauthenticated user', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/tools/save-topic', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'topic-generator',
        title: 'Test Topic',
        content: {},
        input: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should return 409 for duplicate topic', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTool = { id: 'tool123', slug: 'topic-generator' }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getToolBySlug).mockResolvedValue(mockTool as any)
    vi.mocked(isTopicSaved).mockResolvedValue(true) // Already saved

    const request = new NextRequest('http://localhost:3000/api/tools/save-topic', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'topic-generator',
        title: 'Duplicate Topic',
        content: {},
        input: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Topic already saved')
  })

  it('should return 404 for non-existent tool', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getToolBySlug).mockResolvedValue(null) // Tool not found

    const request = new NextRequest('http://localhost:3000/api/tools/save-topic', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'non-existent-tool',
        title: 'Test Topic',
        content: {},
        input: {},
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Tool not found')
  })

  it('should return 400 for invalid input', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/tools/save-topic', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'topic-generator',
        // Missing required fields
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation failed')
  })
})
