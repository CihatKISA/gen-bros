import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveTopicButton } from '../SaveTopicButton'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/src/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/src/lib/analytics', () => ({
  useAnalytics: () => ({
    trackTopicSave: vi.fn(),
    trackError: vi.fn(),
  }),
}))

import { useAuth } from '@/src/lib/hooks/useAuth'

// Mock fetch
global.fetch = vi.fn()

describe('SaveTopicButton', () => {
  const mockTopic = {
    title: 'Test Topic',
    description: 'Test description',
    contentType: 'How-to Guide',
    hashtags: ['#test'],
    targetAudience: 'Developers',
    engagementHook: 'Learn something new',
  }

  const mockMetadata = {
    tokensUsed: 100,
    model: 'gpt-4',
    processingTime: 500,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render bookmark icon', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoading: false,
      logout: vi.fn(),
    } as any)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show auth dialog for guest users', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      logout: vi.fn(),
    } as any)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/sign in to save topics/i)).toBeInTheDocument()
    })
  })

  it('should save topic for authenticated users', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoading: false,
      logout: vi.fn(),
    } as any)

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ savedTopic: { id: 'saved123' } }),
    } as Response)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tools/save-topic',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Topic'),
        })
      )
    })
  })

  it('should show saved state after successful save', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoading: false,
      logout: vi.fn(),
    } as any)

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ savedTopic: { id: 'saved123' } }),
    } as Response)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(button).toBeDisabled()
    })
  })

  it('should handle save errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoading: false,
      logout: vi.fn(),
    } as any)

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save' }),
    } as Response)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })

  it('should be disabled while loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoading: true,
      logout: vi.fn(),
    } as any)

    render(
      <SaveTopicButton
        topic={mockTopic}
        category="Technology"
        metadata={mockMetadata}
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
