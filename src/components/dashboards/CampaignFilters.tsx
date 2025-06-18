import React, { useState } from 'react'
import { Search, Filter, X, Calendar, Target, Zap, Star } from 'lucide-react'

interface CampaignFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  dateRange?: string
  onDateRangeChange?: (range: string) => void
  confidenceFilter?: string
  onConfidenceChange?: (confidence: string) => void
  onClearFilters: () => void
  resultsCount: number
}

const CAMPAIGN_TYPES = {
  social_media: { label: 'Social Media', icon: '📱' },
  email_marketing: { label: 'Email Marketing', icon: '📧' },
  video_content: { label: 'Video Content', icon: '🎥' },
  blog_post: { label: 'Blog Post', icon: '📝' },
  advertisement: { label: 'Advertisement', icon: '📢' },
  product_launch: { label: 'Product Launch', icon: '🚀' },
  brand_awareness: { label: 'Brand Awareness', icon: '🎯' },
  multimedia: { label: 'Multimedia', icon: '🎨' }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
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

export default function CampaignFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  dateRange = 'all',
  onDateRangeChange,
  confidenceFilter = 'all',
  onConfidenceChange,
  onClearFilters,
  resultsCount
}: CampaignFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || 
                          dateRange !== 'all' || confidenceFilter !== 'all'

  const handleClearAll = () => {
    onSearchChange('')
    onStatusChange('all')
    onTypeChange('all')
    onDateRangeChange?.('all')
    onConfidenceChange?.('all')
    onClearFilters()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Campaigns</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            {resultsCount} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns by title, description, or tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-1" />
            Campaign Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {Object.entries(CAMPAIGN_TYPES).map(([type, config]) => (
              <option key={type} value={type}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confidence Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Confidence Level
              </label>
              <select
                value={confidenceFilter}
                onChange={(e) => onConfidenceChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CONFIDENCE_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Intelligence Sources Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-1" />
                Intelligence Sources
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="all">All Sources</option>
                <option value="has-intelligence">Has Intelligence</option>
                <option value="no-intelligence">No Intelligence</option>
                <option value="multiple">Multiple Sources (2+)</option>
              </select>
            </div>
          </div>

          {/* Performance Filters */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Performance</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'high-performing', label: 'High Performing' },
                { id: 'needs-attention', label: 'Needs Attention' },
                { id: 'recent-updates', label: 'Recently Updated' },
                { id: 'stale', label: 'Stale (>30 days)' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-purple-300 hover:bg-purple-50 transition-colors"
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
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              <div className="flex flex-wrap gap-1">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Search: &quot;{searchQuery}&quot;
                    <button onClick={() => onSearchChange('')} className="ml-1 hover:text-blue-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Status: {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
                    <button onClick={() => onStatusChange('all')} className="ml-1 hover:text-green-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Type: {CAMPAIGN_TYPES[typeFilter as keyof typeof CAMPAIGN_TYPES]?.label}
                    <button onClick={() => onTypeChange('all')} className="ml-1 hover:text-purple-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            
            <span className="text-sm text-gray-500">
              {resultsCount} {resultsCount === 1 ? 'campaign' : 'campaigns'} found
            </span>
          </div>
        </div>
      )}
    </div>
  )
}