// src/components/campaigns/CampaignFilters.tsx - Apple Design System
import React, { useState } from 'react'
import { Search, Filter, X, Calendar, Target, Zap, Star } from 'lucide-react'

interface CampaignFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  onClearFilters: () => void
  resultsCount: number
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' }
]

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
]

const CONFIDENCE_LEVELS = [
  { value: 'all', label: 'All Confidence' },
  { value: 'high', label: 'High (80%+)' },
  { value: 'medium', label: 'Medium (60-79%)' },
  { value: 'low', label: 'Low (<60%)' }
]

export default function AppleCampaignFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  resultsCount
}: CampaignFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dateRange, setDateRange] = useState('all')
  const [confidenceFilter, setConfidenceFilter] = useState('all')

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || 
                          dateRange !== 'all' || confidenceFilter !== 'all'

  const handleClearAll = () => {
    onSearchChange('')
    onStatusChange('all')
    setDateRange('all')
    setConfidenceFilter('all')
    onClearFilters()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Apple-style Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 text-apple-gray" />
          </div>
          <h3 className="text-lg font-semibold text-black">Filter Campaigns</h3>
          <span className="px-3 py-1 bg-gray-100 text-black text-sm font-medium rounded-full">
            {resultsCount} results
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-apple-gray hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-black text-white' 
                : 'text-black hover:bg-gray-100 bg-gray-100'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Apple-style Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-apple-gray" />
        <input
          type="text"
          placeholder="Search campaigns by title, description, or audience..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-apple-gray hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Type - Apple-styled for Universal */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Campaign Type
          </label>
          <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-black font-medium flex items-center">
            <span className="mr-2">🌟</span>
            Universal Campaign
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          >
            {DATE_RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-black mb-4">Advanced Filters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Confidence Level Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Confidence Level
              </label>
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              >
                {CONFIDENCE_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Status Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Content Status
              </label>
              <select className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                <option value="all">All Campaigns</option>
                <option value="has-content">Has Generated Content</option>
                <option value="no-content">No Content Yet</option>
                <option value="multiple-content">Multiple Content Types</option>
              </select>
            </div>
          </div>

          {/* Performance Filters */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">Performance & Status</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'high-performing', label: 'High Intelligence Score' },
                { id: 'needs-sources', label: 'Needs Sources' },
                { id: 'recent-updates', label: 'Recently Updated' },
                { id: 'ready-to-generate', label: 'Ready to Generate' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-black hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-black">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Search: &quot;{searchQuery}&quot;
                    <button onClick={() => onSearchChange('')} className="ml-2 hover:text-blue-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Status: {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
                    <button onClick={() => onStatusChange('all')} className="ml-2 hover:text-green-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {dateRange !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-black text-sm font-medium rounded-full">
                    Date: {DATE_RANGES.find(d => d.value === dateRange)?.label}
                    <button onClick={() => setDateRange('all')} className="ml-2 hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            
            <span className="text-sm text-apple-gray font-medium">
              {resultsCount} {resultsCount === 1 ? 'campaign' : 'campaigns'} found
            </span>
          </div>
        </div>
      )}
    </div>
  )
}