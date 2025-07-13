// /src/app/admin/components/UserManagement.tsx - Extracted Component
'use client'

import React from 'react';
import { Search, Filter, Edit, Eye, Users } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_name: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  is_active: boolean;
  is_verified: boolean;
}

interface Props {
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTier: string;
  setFilterTier: (tier: string) => void;
  onEditUser: (user: User) => void;
  onUpdateUserStatus: (userId: string, isActive: boolean) => void;
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    owner: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800',
    viewer: 'bg-yellow-100 text-yellow-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

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

export default function UserManagement({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  filterTier,
  setFilterTier,
  onEditUser,
  onUpdateUserStatus,
}: Props) {
  console.log('🎨 UserManagement component rendering. Users:', users.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
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
            <span>Add User</span>
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
                placeholder="Search users..."
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
              {users.length} users found
            </span>
          </div>
        </div>
      </div>

      {/* Users Display */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Users ({users.length})</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3">Loading users...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => {
                console.log('👤 Rendering user:', user.full_name);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.company_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTierColor(user.subscription_tier)}`}>
                        {user.subscription_tier}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => onEditUser(user)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-500">No users found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}