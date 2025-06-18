// src/lib/api/index.ts
/**
 * API client setup for CampaignForge
 * Handles authentication, error handling, and API endpoints
 */

import { QueryClient } from '@tanstack/react-query';

// =============================================================================
// API CLIENT CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  detail?: string;
}

interface APIError {
  detail: string;
  status_code?: number;
  credits_required?: number;
  credits_remaining?: number;
  current_tier?: string;
  upgrade_suggestion?: {
    next_tier: string;
    price: string;
    benefits: string[];
  };
}

// =============================================================================
// HTTP CLIENT
// =============================================================================

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = this.getTokenFromStorage();
  }

  private getTokenFromStorage(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        // Handle non-JSON responses
        return {} as T;
      }
    }

    // Handle error responses
    let errorData: APIError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        detail: `HTTP ${response.status}: ${response.statusText}`,
        status_code: response.status,
      };
    }

    // Special handling for credit errors
    if (response.status === 402) {
      throw new CreditError(errorData);
    }

    // Special handling for auth errors
    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    throw new APIClientError(errorData.detail || 'An error occurred', response.status, errorData);
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

export class APIClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

export class CreditError extends Error {
  constructor(public data: APIError) {
    super(data.detail);
    this.name = 'CreditError';
  }
}

// =============================================================================
// API CLIENT INSTANCE
// =============================================================================

export const apiClient = new APIClient(API_BASE_URL);

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    register: (data: { email: string; password: string; full_name: string; company_name: string }) =>
      apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    me: () => apiClient.get('/auth/me'),
  },

  // Dashboard
  dashboard: {
    getStats: () => apiClient.get('/dashboard/stats'),
    getCompany: () => apiClient.get('/dashboard/company'),
  },

  // Campaigns
  campaigns: {
    list: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get(`/campaigns${query.toString() ? `?${query}` : ''}`);
    },
    get: (id: string) => apiClient.get(`/campaigns/${id}`),
    create: (data: any) => apiClient.post('/campaigns', data),
    update: (id: string, data: any) => apiClient.put(`/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
  },

  // Intelligence Analysis
  intelligence: {
    analyzeURL: (data: {
      url: string;
      campaign_id: string;
      analysis_type?: string;
    }) => apiClient.post('/intelligence/analyze-url', data),
    
    uploadDocument: (campaignId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaign_id', campaignId);
      return apiClient.upload('/intelligence/upload-document', formData);
    },
    
    generateContent: (data: {
      intelligence_id: string;
      content_type: string;
      preferences: Record<string, any>;
      campaign_id: string;
    }) => apiClient.post('/intelligence/generate-content', data),
    
    getCampaignIntelligence: (campaignId: string) =>
      apiClient.get(`/intelligence/campaign/${campaignId}/intelligence`),
    
    getUsageStats: () => apiClient.get('/intelligence/usage-stats'),
  },

  // Content Management
  content: {
    list: (campaignId: string) => apiClient.get(`/content/campaign/${campaignId}`),
    get: (id: string) => apiClient.get(`/content/${id}`),
    update: (id: string, data: any) => apiClient.put(`/content/${id}`, data),
    delete: (id: string) => apiClient.delete(`/content/${id}`),
    publish: (id: string, platform: string) => 
      apiClient.post(`/content/${id}/publish`, { platform }),
  },

  // Smart URLs
  urls: {
    list: (campaignId: string) => apiClient.get(`/urls/campaign/${campaignId}`),
    get: (id: string) => apiClient.get(`/urls/${id}`),
    analytics: (id: string) => apiClient.get(`/urls/${id}/analytics`),
  },
};

// =============================================================================
// REACT QUERY CONFIGURATION
// =============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors or credit errors
        if (error instanceof APIClientError && [401, 402, 403].includes(error.statusCode || 0)) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: false,
    },
  },
});

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    company: ['dashboard', 'company'] as const,
  },
  
  // Campaigns
  campaigns: {
    all: ['campaigns'] as const,
    list: (params?: any) => ['campaigns', 'list', params] as const,
    detail: (id: string) => ['campaigns', 'detail', id] as const,
  },
  
  // Intelligence
  intelligence: {
    campaign: (campaignId: string) => ['intelligence', 'campaign', campaignId] as const,
    usage: ['intelligence', 'usage'] as const,
  },
  
  // Content
  content: {
    campaign: (campaignId: string) => ['content', 'campaign', campaignId] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
  },
  
  // URLs
  urls: {
    campaign: (campaignId: string) => ['urls', 'campaign', campaignId] as const,
    analytics: (id: string) => ['urls', 'analytics', id] as const,
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function isAPIError(error: unknown): error is APIClientError {
  return error instanceof APIClientError;
}

export function isCreditError(error: unknown): error is CreditError {
  return error instanceof CreditError;
}

export function getErrorMessage(error: unknown): string {
  if (isAPIError(error) || isCreditError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// =============================================================================
// EXPORTS
// =============================================================================

export default api;