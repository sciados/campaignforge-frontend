import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CampaignDetailPage from '../page'
import { useApi } from '@/lib/api'

// Mock the API hook
jest.mock('@/lib/api')
const mockUseApi = useApi as jest.MockedFunction<typeof useApi>

// Mock next/navigation
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

describe('CampaignDetailPage', () => {
  const mockCampaign = {
    id: 'test-id',
    title: 'Test Campaign',
    description: 'Test Description',
    campaign_type: 'universal',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    keywords: ['test', 'campaign'],
    target_audience: 'Test Audience',
    salespage_url: 'https://example.com',
    product_name: 'Test Product',
    auto_analysis_enabled: true,
  }

  const mockWorkflowState = {
    campaign_id: 'test-id',
    workflow_state: 'in_progress',
    completion_percentage: 75,
    current_step: 3,
    total_steps: 4,
    auto_analysis: {
      enabled: true,
      status: 'completed' as const,
      confidence_score: 0.85,
    },
    can_generate_content: true,
    metrics: {
      content_count: 5,
      sources_count: 2,
      intelligence_count: 3,
    },
  }

  const mockGeneratedContent = [
    {
      id: 'content-1',
      content_type: 'email',
      content_title: 'Welcome Email',
      content_body: 'Welcome to our product!',
      created_at: '2023-01-01T00:00:00Z',
      is_published: false,
    },
    {
      id: 'content-2',
      content_type: 'social_post',
      content_title: 'Social Post',
      content_body: 'Check out our amazing product!',
      created_at: '2023-01-01T00:00:00Z',
      is_published: true,
    },
  ]

  const mockApi = {
    getCampaign: jest.fn(),
    getWorkflowState: jest.fn(),
    getGeneratedContent: jest.fn(),
    generateContent: jest.fn(),
    analyzeURL: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseApi.mockReturnValue(mockApi)
    mockApi.getCampaign.mockResolvedValue(mockCampaign)
    mockApi.getWorkflowState.mockResolvedValue(mockWorkflowState)
    mockApi.getGeneratedContent.mockResolvedValue(mockGeneratedContent)
  })

  it('renders campaign details correctly', async () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    // Check campaign title and info
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('Universal')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()

    // Check workflow steps
    expect(screen.getByText('Campaign Setup')).toBeInTheDocument()
    expect(screen.getByText('Input Sources')).toBeInTheDocument()
    expect(screen.getByText('AI Analysis & Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Content Generation')).toBeInTheDocument()

    // Check progress
    expect(screen.getByText('75%')).toBeInTheDocument()

    // Check generated content
    expect(screen.getByText('Generated Content')).toBeInTheDocument()
    expect(screen.getByText('Welcome Email')).toBeInTheDocument()
    expect(screen.getByText('Social Post')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    expect(screen.getByText('Loading campaign details...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('shows error state when campaign loading fails', async () => {
    const errorMessage = 'Failed to load campaign'
    mockApi.getCampaign.mockRejectedValue(new Error(errorMessage))

    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Campaign')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Check back button
    const backButton = screen.getByText('Back to Campaigns')
    fireEvent.click(backButton)
    expect(mockPush).toHaveBeenCalledWith('/campaigns')
  })

  it('handles workflow state fallback when endpoint fails', async () => {
    mockApi.getWorkflowState.mockRejectedValue(new Error('Workflow not found'))

    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    // Should still render the campaign with default workflow state
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument() // Default completion percentage
  })

  it('handles content generation', async () => {
    mockApi.generateContent.mockResolvedValue({ success: true })

    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    // Find and click the generate content button
    const generateButtons = screen.getAllByText(/Generate/)
    if (generateButtons.length > 0) {
      fireEvent.click(generateButtons[0])

      // Check that generateContent was called for each content type
      await waitFor(() => {
        expect(mockApi.generateContent).toHaveBeenCalled()
      }, { timeout: 2000 })
    }
  })

  it('handles analysis retry', async () => {
    // Set up failed analysis state
    const failedWorkflowState = {
      ...mockWorkflowState,
      auto_analysis: {
        enabled: true,
        status: 'failed' as const,
        confidence_score: 0,
        error_message: 'Analysis failed',
      },
    }
    mockApi.getWorkflowState.mockResolvedValue(failedWorkflowState)
    mockApi.analyzeURL.mockResolvedValue({ success: true })

    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.getByText('Analysis failed')).toBeInTheDocument()
    })

    // Click retry button
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    expect(mockApi.analyzeURL).toHaveBeenCalledWith({
      url: 'https://example.com',
      campaign_id: 'test-id',
      analysis_type: 'comprehensive',
    })
  })

  it('navigates to settings', async () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    // Test settings navigation
    const settingsButton = screen.getByText('Settings')
    fireEvent.click(settingsButton)
    expect(mockPush).toHaveBeenCalledWith('/campaigns/test-id/settings')
  })

  it('displays campaign keywords and target audience', async () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Keywords')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('campaign')).toBeInTheDocument()

    expect(screen.getByText('Target Audience')).toBeInTheDocument()
    expect(screen.getByText('Test Audience')).toBeInTheDocument()
  })

  it('displays source information', async () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Source Information')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()

    // Check sales page link is displayed
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('shows different step statuses correctly', async () => {
    render(<CampaignDetailPage params={{ id: 'test-id' }} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading campaign details...')).not.toBeInTheDocument()
    })

    // Check for completed step indicator (green checkmark should be present)
    expect(screen.getByText('Setup complete')).toBeInTheDocument()

    // Check for analysis completion
    expect(screen.getByText(/confidence: 85%/)).toBeInTheDocument()

    // Check sources count
    expect(screen.getByText('2 source(s) added')).toBeInTheDocument()

    // Check content count
    expect(screen.getByText('5 content pieces generated')).toBeInTheDocument()
  })
})