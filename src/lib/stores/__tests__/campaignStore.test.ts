import { renderHook, act } from '@testing-library/react'
import { useCampaignStore, useCampaignStats } from '../campaignStore'
import { apiClient } from '../../api'

// Mock the API client
jest.mock('../../api', () => ({
  apiClient: {
    createCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
    getCampaigns: jest.fn(),
    getCampaign: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('campaignStore', () => {
  const mockCampaign = {
    id: '1',
    title: 'Test Campaign',
    description: 'Test Description',
    campaign_type: 'universal',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useCampaignStore.setState({
      currentCampaign: null,
      campaigns: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    })
  })

  describe('createCampaign', () => {
    it('should create a campaign successfully', async () => {
      mockApiClient.createCampaign.mockResolvedValue(mockCampaign)

      const { result } = renderHook(() => useCampaignStore())

      await act(async () => {
        const campaign = await result.current.createCampaign({
          title: 'Test Campaign',
          description: 'Test Description',
        })
        expect(campaign).toEqual(mockCampaign)
      })

      expect(result.current.campaigns).toContain(mockCampaign)
      expect(result.current.currentCampaign).toEqual(mockCampaign)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle creation error', async () => {
      const errorMessage = 'Creation failed'
      mockApiClient.createCampaign.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCampaignStore())

      await act(async () => {
        try {
          await result.current.createCampaign({
            title: 'Test Campaign',
            description: 'Test Description',
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.campaigns).toHaveLength(0)
    })
  })

  describe('loadCampaigns', () => {
    it('should load campaigns successfully', async () => {
      const mockCampaigns = [mockCampaign]
      mockApiClient.getCampaigns.mockResolvedValue(mockCampaigns)

      const { result } = renderHook(() => useCampaignStore())

      await act(async () => {
        await result.current.loadCampaigns()
      })

      expect(result.current.campaigns).toEqual(mockCampaigns)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeInstanceOf(Date)
    })

    it('should handle loading error', async () => {
      const errorMessage = 'Failed to load campaigns'
      mockApiClient.getCampaigns.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCampaignStore())

      await act(async () => {
        try {
          await result.current.loadCampaigns()
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('updateCampaign', () => {
    it('should update a campaign successfully', async () => {
      const updatedCampaign = { ...mockCampaign, title: 'Updated Title' }
      mockApiClient.updateCampaign.mockResolvedValue(updatedCampaign)

      const { result } = renderHook(() => useCampaignStore())

      // Set initial state with campaign
      act(() => {
        useCampaignStore.setState({
          campaigns: [mockCampaign],
          currentCampaign: mockCampaign,
        })
      })

      await act(async () => {
        const campaign = await result.current.updateCampaign('1', {
          title: 'Updated Title',
        })
        expect(campaign).toEqual(updatedCampaign)
      })

      expect(result.current.campaigns[0]).toEqual(updatedCampaign)
      expect(result.current.currentCampaign).toEqual(updatedCampaign)
    })
  })

  describe('deleteCampaign', () => {
    it('should delete a campaign successfully', async () => {
      mockApiClient.deleteCampaign.mockResolvedValue(undefined)

      const { result } = renderHook(() => useCampaignStore())

      // Set initial state with campaign
      act(() => {
        useCampaignStore.setState({
          campaigns: [mockCampaign],
          currentCampaign: mockCampaign,
        })
      })

      await act(async () => {
        await result.current.deleteCampaign('1')
      })

      expect(result.current.campaigns).toHaveLength(0)
      expect(result.current.currentCampaign).toBeNull()
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      act(() => {
        useCampaignStore.setState({
          campaigns: [
            { ...mockCampaign, id: '1', status: 'active' },
            { ...mockCampaign, id: '2', status: 'draft' },
            { ...mockCampaign, id: '3', status: 'completed' },
            { ...mockCampaign, id: '4', status: 'processing' },
          ],
        })
      })
    })

    it('should return active campaigns', () => {
      const { result } = renderHook(() => useCampaignStore())
      const activeCampaigns = result.current.activeCampaigns()
      expect(activeCampaigns).toHaveLength(2) // active + processing
      expect(activeCampaigns.every(c => c.status === 'active' || c.status === 'processing')).toBe(true)
    })

    it('should return draft campaigns', () => {
      const { result } = renderHook(() => useCampaignStore())
      const draftCampaigns = result.current.draftCampaigns()
      expect(draftCampaigns).toHaveLength(1)
      expect(draftCampaigns[0].status).toBe('draft')
    })

    it('should return completed campaigns', () => {
      const { result } = renderHook(() => useCampaignStore())
      const completedCampaigns = result.current.completedCampaigns()
      expect(completedCampaigns).toHaveLength(1)
      expect(completedCampaigns[0].status).toBe('completed')
    })
  })
})

describe('useCampaignStats', () => {
  beforeEach(() => {
    act(() => {
      useCampaignStore.setState({
        campaigns: [
          { id: '1', status: 'active', title: 'Campaign 1' },
          { id: '2', status: 'draft', title: 'Campaign 2' },
          { id: '3', status: 'completed', title: 'Campaign 3' },
          { id: '4', status: 'processing', title: 'Campaign 4' },
          { id: '5', status: 'archived', title: 'Campaign 5' },
        ] as any,
      })
    })
  })

  it('should return correct campaign statistics', () => {
    const { result } = renderHook(() => useCampaignStats())

    expect(result.current).toEqual({
      total: 5,
      active: 2, // active + processing
      draft: 1,
      completed: 1,
      archived: 1,
    })
  })
})