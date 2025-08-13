// src/lib/api/core/client.ts - Base API Client (Fixed header types)

import { getApiBaseUrl, getAuthToken, clearAuthToken, API_CONFIG } from '../config'
import { ApiError, CreditError, RequestConfig, ApiClientConfig } from '../../types/api'
import { handleResponse, handleContentGenerationResponse } from './response-handler'

/**
 * Base API Client class that handles common HTTP operations
 * All service classes extend this base client
 * Integrates with existing type structure in src/lib/types/
 */
export class BaseApiClient {
  protected baseURL: string
  protected defaultHeaders: Record<string, string>
  protected timeout: number

  constructor(config?: Partial<ApiClientConfig>) {
    this.baseURL = config?.baseURL || getApiBaseUrl()
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS, ...config?.defaultHeaders }
    this.timeout = config?.timeout || API_CONFIG.TIMEOUT
  }

  // ============================================================================
  // PROTECTED HTTP METHODS
  // ============================================================================

  protected getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const token = getAuthToken()
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...additionalHeaders
    }
  }

  protected async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = config
    
    // Build URL with params
    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString())
      })
      url += `?${searchParams.toString()}`
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: this.getHeaders(headers),
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) })
    }

    try {
      const response = await fetch(url, requestOptions)
      return await handleResponse<T>(response)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  protected async requestWithFormData<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<T> {
    const token = getAuthToken()
    
    // Build headers object without undefined values
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: formData
    })

    return await handleResponse<T>(response)
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  protected async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  protected async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }

  protected async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  protected async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  // ============================================================================
  // SPECIALIZED HANDLERS
  // ============================================================================

  protected async requestContentGeneration(endpoint: string, data: any) {
    console.log('🎯 Generating content with data:', data)
    console.log('📡 Sending request to backend:', data)
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    const result = await handleContentGenerationResponse(response)
    console.log('✅ Content generation successful:', result)
    
    return result
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  private handleError(error: any): void {
    if (error instanceof ApiError) {
      // Handle API errors
      if (error.statusCode === 401) {
        clearAuthToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    console.error('API Client Error:', error)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
    
    return searchParams.toString()
  }

  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    const queryString = params ? this.buildQueryString(params) : ''
    return queryString ? `${endpoint}?${queryString}` : endpoint
  }

  // ============================================================================
  // TOKEN MANAGEMENT (Compatible with existing patterns)
  // ============================================================================

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      localStorage.setItem('authToken', token)
    }
  }

  public clearAuthToken(): void {
    clearAuthToken()
  }

  public getAuthToken(): string | null {
    return getAuthToken()
  }
}