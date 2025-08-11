// src/components/DemoPreferenceControl.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, HelpCircle, Settings, ToggleLeft, ToggleRight, Sparkles, Users } from 'lucide-react'
import { useApi } from '@/lib/api'

interface DemoPreference {
  show_demo_campaigns: boolean
  demo_available: boolean
  real_campaigns_count: number
  demo_campaigns_count: number
}

interface DemoPreferenceControlProps {
  onPreferenceChange?: (showDemo: boolean) => void
  compact?: boolean
}

export default function DemoPreferenceControl({ 
  onPreferenceChange, 
  compact = false 
}: DemoPreferenceControlProps) {
  const api = useApi()
  const [preferences, setPreferences] = useState<DemoPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await api.getDemoPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Failed to load demo preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const toggleDemoVisibility = async () => {
    if (!preferences) return
    
    setIsUpdating(true)
    try {
      const result = await api.toggleDemoVisibility()
      
      // Update local state
      const newPrefs = {
        ...preferences,
        show_demo_campaigns: result.show_demo_campaigns
      }
      setPreferences(newPrefs)
      
      // Notify parent component
      onPreferenceChange?.(result.show_demo_campaigns)
      
    } catch (error) {
      console.error('Failed to toggle demo visibility:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading || !preferences) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading preferences...</span>
      </div>
    )
  }

  // Don't show control if no demo campaigns available
  if (!preferences.demo_available) {
    return null
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={toggleDemoVisibility}
          disabled={isUpdating}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : preferences.show_demo_campaigns ? (
            <Eye className="h-4 w-4 text-blue-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium">
            {preferences.show_demo_campaigns ? 'Hide' : 'Show'} Demo
          </span>
        </button>
        
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
            <div className="font-medium mb-1">Demo Campaign Control</div>
            <div className="text-gray-300">
              {preferences.show_demo_campaigns 
                ? 'Demo campaigns are currently visible. Click to hide them.'
                : 'Demo campaigns are hidden. Click to show them for reference.'
              }
            </div>
            <div className="text-gray-400 mt-1">
              Great for referencing examples even after creating your own campaigns.
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Demo Campaign Preferences</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <HelpCircle 
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-700 mb-1">
              Show Demo Campaigns
            </div>
            <div className="text-sm text-gray-500">
              {preferences.show_demo_campaigns 
                ? 'Demo campaigns are visible in your campaigns list'
                : 'Demo campaigns are hidden from your campaigns list'
              }
            </div>
          </div>
          
          <button
            onClick={toggleDemoVisibility}
            disabled={isUpdating}
            className="ml-4 flex items-center space-x-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : preferences.show_demo_campaigns ? (
              <ToggleRight className="h-6 w-6 text-blue-600" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Real campaigns:</span>
              <span className="font-medium">{preferences.real_campaigns_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Demo campaigns:</span>
              <span className="font-medium">{preferences.demo_campaigns_count}</span>
            </div>
          </div>
          
          {preferences.real_campaigns_count === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 rounded-md p-2">
              💡 Demo campaigns will always show for new users to help with onboarding, regardless of this setting.
            </div>
          )}
          
          {preferences.real_campaigns_count > 0 && preferences.show_demo_campaigns && (
            <div className="text-sm text-blue-600 bg-blue-50 rounded-md p-2">
              ✨ Great choice! Demo campaigns are perfect for referencing examples and best practices.
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="text-xs text-gray-500">
          <div className="font-medium mb-1">Why keep demo campaigns visible?</div>
          <ul className="space-y-1">
            <li>• Reference high-quality analysis examples</li>
            <li>• Compare your campaigns with best practices</li>
            <li>• Learn from professionally written content</li>
            <li>• Great for training new team members</li>
          </ul>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-0 right-0 mt-8 w-72 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50">
          <div className="font-medium mb-2">About Demo Campaigns</div>
          <div className="text-gray-300 space-y-2">
            <p>
              Demo campaigns showcase our platforms capabilities with real examples of salespage analysis and generated content.
            </p>
            <p>
              Many experienced users keep them visible as reference material, especially when training team members or comparing analysis quality.
            </p>
            <p className="text-blue-300">
              You have full control - show or hide them anytime!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// 🎯 Quick Toggle Component for Campaigns Header
export function DemoToggleButton({ onToggle }: { onToggle?: (showDemo: boolean) => void }) {
  const api = useApi()
  const [showDemo, setShowDemo] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const loadCurrentState = async () => {
    try {
      const prefs = await api.getDemoPreferences()
      setShowDemo(prefs.show_demo_campaigns)
    } catch (error) {
      console.error('Failed to load demo preferences:', error)
      setShowDemo(false) // Default to false on error
    }
  }

  useEffect(() => {
    loadCurrentState()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async () => {
    if (showDemo === null) return
    
    setIsLoading(true)
    try {
      const result = await api.toggleDemoVisibility()
      setShowDemo(result.show_demo_campaigns)
      onToggle?.(result.show_demo_campaigns)
    } catch (error) {
      console.error('Failed to toggle demo visibility:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if we haven't loaded the state yet
  if (showDemo === null) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : showDemo ? (
          <Eye className="h-4 w-4 text-blue-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-500" />
        )}
        <span className={showDemo ? 'text-blue-700' : 'text-gray-600'}>
          {showDemo ? 'Hide' : 'Show'} Demo
        </span>
      </button>
      
      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
          <div className="font-medium mb-1">
            {showDemo ? 'Hide Demo Campaigns' : 'Show Demo Campaigns'}
          </div>
          <div className="text-gray-300">
            {showDemo 
              ? 'Click to hide demo campaigns from your campaigns list. Great for a cleaner view when you have your own campaigns.'
              : 'Click to show demo campaigns alongside your own. Perfect for referencing examples, best practices, and training.'
            }
          </div>
        </div>
      )}
    </div>
  )
}

// 🎯 Demo Badge Component for Campaign Cards
export function DemoBadge({ 
  variant = 'default', 
  className = '' 
}: { 
  variant?: 'default' | 'prominent' | 'subtle'
  className?: string 
}) {
  const variants = {
    default: 'bg-blue-100 text-blue-700 border-blue-200',
    prominent: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md',
    subtle: 'bg-gray-100 text-gray-600 border-gray-200'
  }

  return (
    <div className={`
      inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border
      ${variants[variant]} ${className}
    `}>
      <Sparkles className="h-3 w-3" />
      <span>Demo</span>
    </div>
  )
}

// 🎯 Demo Info Panel for New Users
export function DemoInfoPanel({ 
  onDismiss, 
  campaignCount = 0 
}: { 
  onDismiss?: () => void
  campaignCount?: number 
}) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || campaignCount > 2) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Welcome! Explore Our Demo Campaign
            </h3>
            
            <p className="text-gray-700 text-sm mb-3">
              We have included a professional demo campaign to show you what is possible. It features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Real competitive analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>High-quality generated content</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Professional copywriting examples</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Platform best practices</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500 flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Many users keep demos visible for reference</span>
              </div>
              
              <div className="text-xs text-blue-600 font-medium">
                You can hide/show demos anytime in preferences
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// 🎯 Demo Settings Panel for Advanced Users
export function DemoSettingsPanel() {
  const api = useApi()
  const [preferences, setPreferences] = useState<DemoPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPreferences = async () => {
    try {
      const prefs = await api.getDemoPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Failed to load demo preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPreferences()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const recreateDemo = async () => {
    try {
      await api.createDemoManually()
      await loadPreferences() // Reload to get updated counts
    } catch (error) {
      console.error('Failed to recreate demo:', error)
    }
  }

  if (isLoading || !preferences) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading demo settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Demo Campaign Management</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-medium text-gray-700">Demo Status</div>
          <div className="text-gray-600 mt-1">
            {preferences.demo_available ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-medium text-gray-700">Demo Count</div>
          <div className="text-gray-600 mt-1">
            {preferences.demo_campaigns_count} campaign{preferences.demo_campaigns_count !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-medium text-gray-700">Visibility</div>
          <div className="text-gray-600 mt-1">
            {preferences.show_demo_campaigns ? 'Visible' : 'Hidden'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          Need to recreate the demo campaign? Useful for testing or if something went wrong.
        </div>
        
        <button
          onClick={recreateDemo}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Recreate Demo
        </button>
      </div>
    </div>
  )
}