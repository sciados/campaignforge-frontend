import { useApi } from '../api'
import { renderHook } from '@testing-library/react'

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('test-token')
  })

  it('should create API client with proper methods', () => {
    const { result } = renderHook(() => useApi())

    expect(result.current).toHaveProperty('getCampaign')
    expect(result.current).toHaveProperty('getCampaigns')
    expect(result.current).toHaveProperty('createCampaign')
    expect(result.current).toHaveProperty('updateCampaign')
    expect(result.current).toHaveProperty('deleteCampaign')
    expect(result.current).toHaveProperty('getWorkflowState')
    expect(result.current).toHaveProperty('getGeneratedContent')
    expect(result.current).toHaveProperty('generateContent')
    expect(result.current).toHaveProperty('analyzeURL')
  })

  it('should handle successful API responses', async () => {
    const mockCampaign = {
      id: '1',
      title: 'Test Campaign',
      status: 'active',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockCampaign }),
    } as Response)

    const { result } = renderHook(() => useApi())
    const campaign = await result.current.getCampaign('1')

    expect(campaign).toEqual(mockCampaign)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://campaign-backend-production-e2db.up.railway.app/api/campaigns/1',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    )
  })

  it('should handle API errors properly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Campaign not found' }),
    } as Response)

    const { result } = renderHook(() => useApi())

    await expect(result.current.getCampaign('nonexistent')).rejects.toThrow()
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useApi())

    await expect(result.current.getCampaign('1')).rejects.toThrow('Network error')
  })

  it('should include authentication token in requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response)

    const { result } = renderHook(() => useApi())
    await result.current.getCampaigns()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    )
  })
})

describe('API Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('test-token')
  })

  it('should handle 401 unauthorized responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token expired' }),
    } as Response)

    const { result } = renderHook(() => useApi())

    await expect(result.current.getCampaign('1')).rejects.toThrow()
  })

  it('should handle different response formats', async () => {
    // Test legacy response format
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'Direct Campaign Object' }),
    } as Response)

    const { result } = renderHook(() => useApi())
    const response = await result.current.getCampaign('1')

    expect(response).toEqual({ title: 'Direct Campaign Object' })
  })
})