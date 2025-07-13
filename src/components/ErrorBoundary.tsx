// src/components/ErrorBoundary.tsx
'use client'
import React from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error?: Error
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report to error tracking service
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback 
        error={this.state.error} 
        resetError={this.resetError} 
        showDetails={this.props.showDetails}
      />
    }

    return this.props.children
  }
}

// App-level error boundary
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to your error tracking service
        console.error('App Error:', { error, errorInfo })
        
        // You can add error reporting here
        // Example: Sentry.captureException(error, { contexts: { errorInfo } })
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}

// Export alias for backwards compatibility
export { AppErrorBoundary as default }

// Campaign-specific error boundary
export function CampaignErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-black mb-2">Campaign Error</h3>
          <p className="text-gray-600 mb-6">
            Unable to load campaign data. This might be a temporary issue.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={resetError}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => window.location.href = '/campaigns'}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Campaigns</span>
            </button>
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Campaign Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Content-specific error boundary
export function ContentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-medium text-black mb-2">Content Loading Error</h4>
            <p className="text-sm text-gray-600 mb-4">
              Failed to load content. This might be a temporary issue.
            </p>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Step-specific error boundary
export function StepErrorBoundary({ 
  children, 
  stepName 
}: { 
  children: React.ReactNode
  stepName: string 
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h4 className="font-medium text-red-900">Error in {stepName}</h4>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Something went wrong while loading this step. You can try again or skip to the next step.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry Step
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Default fallback component
function DefaultErrorFallback({ 
  error, 
  resetError,
  showDetails = false
}: { 
  error?: Error
  resetError: () => void
  showDetails?: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-semibold text-black mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {showDetails && error && (
          <details className="text-left bg-gray-100 rounded-lg p-4 mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}