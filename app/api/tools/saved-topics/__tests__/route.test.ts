import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn(),
  buildConfig: vi.fn((config) => config),
}))

vi.mock('@/src/lib/db', () => ({
  getUserSavedTopics: vi.fn(),
}))

import { getPayload } from 'payload'
import { getUserSavedTopics } from '@/src/lib/db'

describe('GET /api/tools/saved-topics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return saved topics for authenticated user', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTopics = {
      docs: [
        {
          id: 'topic1',
          title: 'Topic 1',
          content: {},
          createdAt: new Date().toISOString(),
        },
        {
          id: 'topic2',
          title: 'Topic 2',
          content: {},
          createdAt: new Date().toISOString(),
        },
      ],
      totalDocs: 2,
      limit: 20,
      page: 1,
      totalPages: 1,
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getUserSavedTopics).mockResolvedValue(mockTopics as any)

    const request = new NextRequest('http://localhost:3000/api/tools/saved-topics')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.docs).toHaveLength(2)
    expect(data.totalDocs).toBe(2)
  })

  it('should return 401 for unauthenticated user', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
    } as any)

    const request = new NextRequest('http://localhost:3000/api/tools/saved-topics')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should filter by tool slug', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTopics = {
      docs: [],
      totalDocs: 0,
      limit: 20,
      page: 1,
      totalPages: 0,
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getUserSavedTopics).mockResolvedValue(mockTopics as any)

    const request = new NextRequest(
      'http://localhost:3000/api/tools/saved-topics?toolSlug=topic-generator'
    )

    await GET(request)

    expect(getUserSavedTopics).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        toolSlug: 'topic-generator',
      })
    )
  })

  it('should handle pagination parameters', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTopics = {
      docs: [],
      totalDocs: 0,
      limit: 10,
      page: 2,
      totalPages: 0,
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getUserSavedTopics).mockResolvedValue(mockTopics as any)

    const request = new NextRequest(
      'http://localhost:3000/api/tools/saved-topics?limit=10&page=2'
    )

    await GET(request)

    expect(getUserSavedTopics).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        limit: 10,
        page: 2,
      })
    )
  })

  it('should enforce maximum limit of 100', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTopics = {
      docs: [],
      totalDocs: 0,
      limit: 100,
      page: 1,
      totalPages: 0,
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getUserSavedTopics).mockResolvedValue(mockTopics as any)

    const request = new NextRequest(
      'http://localhost:3000/api/tools/saved-topics?limit=500'
    )

    await GET(request)

    expect(getUserSavedTopics).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        limit: 100, // Should be capped at 100
      })
    )
  })

  it('should enforce minimum page of 1', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' }
    const mockTopics = {
      docs: [],
      totalDocs: 0,
      limit: 20,
      page: 1,
      totalPages: 0,
    }

    vi.mocked(getPayload).mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: mockUser }),
    } as any)

    vi.mocked(getUserSavedTopics).mockResolvedValue(mockTopics as any)

    const request = new NextRequest(
      'http://localhost:3000/api/tools/saved-topics?page=0'
    )

    await GET(request)

    expect(getUserSavedTopics).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        page: 1, // Should be at least 1
      })
    )
  })
})
