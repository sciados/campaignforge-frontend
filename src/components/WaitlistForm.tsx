// components/WaitlistForm.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { useWaitlist, waitlistUtils, type WaitlistJoinResponse } from '../lib/waitlist-api'

// ============================================================================
// ✅ COMPONENT PROPS INTERFACE
// ============================================================================

interface WaitlistFormProps {
  /** Custom CSS classes */
  className?: string
  /** Referrer source for tracking */
  referrer?: string
  /** Custom success message */
  successMessage?: string
  /** Show position in waitlist */
  showPosition?: boolean
  /** Callback when user successfully joins */
  onSuccess?: (result: WaitlistJoinResponse) => void
  /** Callback when error occurs */
  onError?: (error: string) => void
}

// ============================================================================
// ✅ WAITLIST FORM COMPONENT
// ============================================================================

export const WaitlistForm: React.FC<WaitlistFormProps> = ({
  className = '',
  referrer,
  successMessage,
  showPosition = true,
  onSuccess,
  onError
}) => {
  const [email, setEmail] = useState<string>('')
  const [result, setResult] = useState<WaitlistJoinResponse | null>(null)
  
  const { isLoading, error, success, joinWaitlist, clearState } = useWaitlist()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate email
    if (!waitlistUtils.isValidEmail(email)) {
      onError?.('Please enter a valid email address')
      return
    }

    try {
      const joinResult = await joinWaitlist(email, referrer)
      
      if (joinResult) {
        setResult(joinResult)
        setEmail('')
        onSuccess?.(joinResult)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join waitlist'
      onError?.(errorMessage)
    }
  }, [email, referrer, joinWaitlist, onSuccess, onError])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error || success) {
      clearState()
      setResult(null)
    }
  }, [error, success, clearState])

  // Success state
  if (success && result) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto text-center ${className}`}>
        <div className="text-green-700 font-medium mb-2">
          ✅ You are on the list!
        </div>
        <div className="text-green-600 text-sm mb-2">
          {successMessage || 'We will notify you as soon as we launch.'}
        </div>
        {showPosition && result.position && (
          <div className="text-green-600 text-sm font-medium">
            You are #{waitlistUtils.formatPosition(result.position)} on our waitlist!
          </div>
        )}
        {result.total_signups && (
          <div className="text-green-500 text-xs mt-2">
            Total signups: {result.total_signups.toLocaleString()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          required
          disabled={isLoading}
          className="flex-1 bg-gray-100 border-none rounded-xl px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-3 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-900 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Join waitlist"
        >
          {isLoading ? 'Adding...' : 'Join Waitlist'}
        </button>
      </form>
      
      {error && (
        <div className="w-full text-center text-red-600 text-sm mt-4 max-w-md mx-auto p-3 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ✅ COMPACT WAITLIST FORM (Alternative)
// ============================================================================

interface CompactWaitlistFormProps {
  onSuccess?: (email: string, position: number) => void
  placeholder?: string
  buttonText?: string
  className?: string
}

export const CompactWaitlistForm: React.FC<CompactWaitlistFormProps> = ({
  onSuccess,
  placeholder = "your@email.com",
  buttonText = "Notify Me",
  className = ''
}) => {
  const [email, setEmail] = useState<string>('')
  const { isLoading, error, joinWaitlist } = useWaitlist()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!waitlistUtils.isValidEmail(email)) return

    const result = await joinWaitlist(email)
    if (result) {
      onSuccess?.(email, result.position)
      setEmail('')
    }
  }, [email, joinWaitlist, onSuccess])

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '...' : buttonText}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}

// ============================================================================
// ✅ WAITLIST STATUS CHECKER
// ============================================================================

interface WaitlistStatusProps {
  email: string
  className?: string
}

export const WaitlistStatus: React.FC<WaitlistStatusProps> = ({ 
  email, 
  className = '' 
}) => {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = useCallback(async () => {
    if (!waitlistUtils.isValidEmail(email)) return

    setLoading(true)
    try {
      const { waitlistApi } = await import('../lib/waitlist-api')
      const result = await waitlistApi.check(email)
      setStatus(result)
    } catch (err) {
      console.error('Failed to check status:', err)
    } finally {
      setLoading(false)
    }
  }, [email])

  React.useEffect(() => {
    if (email) {
      checkStatus()
    }
  }, [email, checkStatus])

  if (loading) {
    return <div className={`text-gray-500 ${className}`}>Checking status...</div>
  }

  if (!status) {
    return null
  }

  if (!status.on_waitlist) {
    return (
      <div className={`text-gray-600 ${className}`}>
        Email not found on waitlist
      </div>
    )
  }

  return (
    <div className={`text-green-600 ${className}`}>
      ✅ Position #{waitlistUtils.formatPosition(status.position)} of {status.total_signups}
      {status.joined_date && (
        <div className="text-sm text-gray-500">
          Joined {new Date(status.joined_date).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export default WaitlistForm