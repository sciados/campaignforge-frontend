// /src/app/admin/components/CompanyManagement.tsx - Extracted Component
'use client'

import React from 'react';
import { Search, Filter, Edit, Eye, Settings, Building2, Users, Target } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_slug: string;
  company_size: string;
  industry: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  user_count: number;
  campaign_count: number;
}

interface Props {
  companies: Company[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTier: string;
  setFilterTier: (tier: string) => void;
  onEditCompany: (company: Company) => void;
}

const getTierColor = (tier: string) => {
  const colors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    agency: 'bg-orange-100 text-orange-800',
    enterprise: 'bg-green-100 text-green-800'
  };
  return colors[tier] || 'bg-gray-100 text-gray-800';
};

export default function CompanyManagement({
  companies,
  loading,
  searchTerm,
  setSearchTerm,
  filterTier,
  setFilterTier,
  onEditCompany,
}: Props) {
  console.log('🏢 CompanyManagement component rendering. Companies:', companies.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
          <p className="text-gray-600">Oversee company accounts, subscriptions, and billing information.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all w-64"
              />
            </div>
            
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all"
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="agency">Agency</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {companies.length} companies found
            </span>
          </div>
        </div>
      </div>

      {/* Companies Display */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Companies ({companies.length})</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3">Loading companies...</span>
            </div>
          ) : companies.length > 0 ? (
            <div className="space-y-4">
              {companies.map((company) => {
                console.log('🏢 Rendering company:', company.company_name);
                return (
                  <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {company.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{company.company_name}</div>
                        <div className="text-sm text-gray-600">{company.company_slug}</div>
                        <div className="text-sm text-gray-500">{company.industry || 'Not specified'} • {company.company_size}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{company.user_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          <span>{company.campaign_count}</span>
                        </div>
                      </div>
                      
                      {/* Credit Usage */}
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {company.monthly_credits_used.toLocaleString()} / {company.monthly_credits_limit.toLocaleString()}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              (company.monthly_credits_used / company.monthly_credits_limit) >= 0.9 ? 'bg-red-500' :
                              (company.monthly_credits_used / company.monthly_credits_limit) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (company.monthly_credits_used / company.monthly_credits_limit) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Badges and Actions */}
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTierColor(company.subscription_tier)}`}>
                          {company.subscription_tier}
                        </span>
                        <button 
                          onClick={() => onEditCompany(company)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">No companies found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}