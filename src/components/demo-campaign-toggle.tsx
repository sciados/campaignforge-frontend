// src/components/demo-campaign-toggle.tsx
/**
 * Demo Campaign Toggle Component
 * Provides a toggle button to show/hide demo campaigns from the user's dashboard
 */

"use client"

import React, { useState } from 'react'
import { useCampaign, campaignUtils } from '@/lib/campaign-api'
import { Eye, EyeOff } from 'lucide-react'

interface DemoCampaignToggleProps {
  campaign: any // Campaign object
  onToggle?: (hidden: boolean) => void
  className?: string
}

export function DemoCampaignToggle({ 
  campaign, 
  onToggle,
  className = "" 
}: DemoCampaignToggleProps) {
  const { hideDemo, showDemo, isLoading, error } = useCampaign()
  const [isHidden, setIsHidden] = useState(campaignUtils.isDemoHidden(campaign))

  // Only show toggle for demo campaigns
  if (!campaignUtils.isDemo(campaign)) {
    return null
  }

  const handleToggle = async () => {
    try {
      const newHiddenState = !isHidden
      
      if (newHiddenState) {
        await hideDemo()
      } else {
        await showDemo()
      }
      
      setIsHidden(newHiddenState)
      onToggle?.(newHiddenState)
      
    } catch (err) {
      console.error('Failed to toggle demo visibility:', err)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${isHidden 
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={isHidden ? 'Show demo campaign' : 'Hide demo campaign'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isHidden ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </>
        )}
        
        <span>
          {isHidden ? 'Show Demo' : 'Hide Demo'}
        </span>
      </button>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

// Simple inline toggle version for campaign cards
export function DemoCampaignInlineToggle({ 
  campaign, 
  onToggle 
}: Pick<DemoCampaignToggleProps, 'campaign' | 'onToggle'>) {
  const { hideDemo, showDemo, isLoading } = useCampaign()
  const [isHidden, setIsHidden] = useState(campaignUtils.isDemoHidden(campaign))

  if (!campaignUtils.isDemo(campaign)) {
    return null
  }

  const handleToggle = async () => {
    try {
      const newHiddenState = !isHidden
      
      if (newHiddenState) {
        await hideDemo()
      } else {
        await showDemo()
      }
      
      setIsHidden(newHiddenState)
      onToggle?.(newHiddenState)
      
    } catch (err) {
      console.error('Failed to toggle demo visibility:', err)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title={isHidden ? 'Show demo campaign' : 'Hide demo campaign'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {isHidden ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </>
      )}
    </button>
  )
}

export default DemoCampaignToggle