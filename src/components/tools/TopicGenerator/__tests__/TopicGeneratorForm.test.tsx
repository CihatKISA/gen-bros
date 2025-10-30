import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopicGeneratorForm } from '../TopicGeneratorForm'

// Mock analytics
vi.mock('@/src/lib/analytics', () => ({
  useAnalytics: () => ({
    trackTopicGeneration: vi.fn(),
    trackError: vi.fn(),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('TopicGeneratorForm', () => {
  const mockOnGenerate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form with category input', () => {
    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    expect(screen.getByLabelText(/content category/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/digital marketing/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate topics/i })).toBeInTheDocument()
  })

  it('should show validation error for empty category', async () => {
    const user = userEvent.setup()
    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    const submitButton = screen.getByRole('button', { name: /generate topics/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/category is required/i)).toBeInTheDocument()
    })
  })

  it('should call onGenerate with topics on successful submission', async () => {
    const user = userEvent.setup()
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
    const mockMetadata = {
      tokensUsed: 100,
      model: 'gpt-4',
      processingTime: 500,
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topics: mockTopics, metadata: mockMetadata }),
    } as Response)

    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    const input = screen.getByPlaceholderText(/digital marketing/i)
    const submitButton = screen.getByRole('button', { name: /generate topics/i })
    
    await user.type(input, 'Technology')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(
        mockTopics,
        mockMetadata,
        'Technology'
      )
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    const input = screen.getByPlaceholderText(/digital marketing/i)
    const submitButton = screen.getByRole('button', { name: /generate topics/i })
    
    await user.type(input, 'Technology')
    await user.click(submitButton)
    
    expect(screen.getByText(/generating topics/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should display error message on failed submission', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Rate limit exceeded'

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    const input = screen.getByPlaceholderText(/digital marketing/i)
    const submitButton = screen.getByRole('button', { name: /generate topics/i })
    
    await user.type(input, 'Technology')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    
    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('should disable input during loading', async () => {
    const user = userEvent.setup()
    
    vi.mocked(global.fetch).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<TopicGeneratorForm onGenerate={mockOnGenerate} />)
    
    const input = screen.getByPlaceholderText(/digital marketing/i)
    const submitButton = screen.getByRole('button', { name: /generate topics/i })
    
    await user.type(input, 'Technology')
    await user.click(submitButton)
    
    expect(input).toBeDisabled()
  })
})
