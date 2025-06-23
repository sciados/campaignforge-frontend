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

// Simplified for Universal Campaigns only
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

export default function CampaignFilters({
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Universal Campaigns</h3>
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
          placeholder="Search campaigns by title, description, or audience..."
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

        {/* Campaign Type - Simplified for Universal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-1" />
            Campaign Type
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-purple-50 text-purple-800 font-medium">
            🌟 Universal Campaign
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
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
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Zap className="w-4 h-4 inline mr-1" />
                Content Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="all">All Campaigns</option>
                <option value="has-content">Has Generated Content</option>
                <option value="no-content">No Content Yet</option>
                <option value="multiple-content">Multiple Content Types</option>
              </select>
            </div>
          </div>

          {/* Performance Filters */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Performance & Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'high-performing', label: 'High Intelligence Score' },
                { id: 'needs-sources', label: 'Needs Sources' },
                { id: 'recent-updates', label: 'Recently Updated' },
                { id: 'ready-to-generate', label: 'Ready to Generate' }
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
                
                {dateRange !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Date: {DATE_RANGES.find(d => d.value === dateRange)?.label}
                    <button onClick={() => setDateRange('all')} className="ml-1 hover:text-purple-600">
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