// /src/app/admin/page.tsx - FIXED VERSION
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { 
  Users, Building2, Target, DollarSign, TrendingUp, Search, Filter, 
  BarChart3, Settings, Database, Activity, Shield, 
  Sparkles, Image as ImageIcon, ListChecks 
} from 'lucide-react';
import UserEditModal from '@/components/admin/UserEditModal';
import CompanyEditModal from '@/components/admin/CompanyEditModal';
import { waitlistApi, waitlistUtils } from '@/lib/waitlist-api';

// Import your existing components
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import WaitlistManagement from './components/WaitlistManagement';

// Optional imports - handle gracefully if components don't exist
let StorageMonitoring: React.ComponentType | null = null;
let ImageGenerationMonitoring: React.ComponentType | null = null;

try {
  StorageMonitoring = require('./components/StorageMonitoring').default;
} catch (error) {
  console.log('StorageMonitoring component not found');
}

try {
  ImageGenerationMonitoring = require('./components/ImageGenerationMonitoring').default;
} catch (error) {
  console.log('ImageGenerationMonitoring component not found');
}

// Force this page to never be statically rendered
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Type definitions
interface AdminStats {
  total_users: number;
  total_companies: number;
  total_campaigns_created: number;
  monthly_recurring_revenue: number;
  subscription_breakdown: Record<string, number>;
}

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

export default function AdminPage() {
  // State management
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Waitlist states
  const [waitlistStats, setWaitlistStats] = useState<any>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Modal states
  const [userEditModal, setUserEditModal] = useState<{isOpen: boolean, user: User | null}>({
    isOpen: false,
    user: null
  });
  const [companyEditModal, setCompanyEditModal] = useState<{isOpen: boolean, company: Company | null}>({
    isOpen: false,
    company: null
  });
  
  const router = useRouter()

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // API Functions
  const fetchAdminStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  }, []);

  const fetchWaitlistStats = useCallback(async () => {
    try {
      const data = await waitlistApi.getStats();
      setWaitlistStats(data);
    } catch (error) {
      console.error('Failed to fetch waitlist stats:', error);
    }
  }, []);

  const fetchWaitlistEntries = useCallback(async (page: number = 1) => {
    try {
      setWaitlistLoading(true);
      const skip = (page - 1) * 50;
      const data = await waitlistApi.getList(skip, 50);
      setWaitlistEntries(data);
    } catch (error) {
      console.error('Failed to fetch waitlist entries:', error);
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  const handleWaitlistExport = useCallback(async () => {
    setExporting(true);
    try {
      const data = await waitlistApi.export();
      waitlistUtils.downloadCSV(data);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleEmailExport = useCallback(async () => {
    try {
      const data = await waitlistApi.export();
      const emailList = data.emails.map((e: any) => e.email).join(', ');
      
      await navigator.clipboard.writeText(emailList);
      alert(`${data.emails.length} email addresses copied to clipboard!`);
    } catch (error) {
      console.error('Email export failed:', error);
      alert('Failed to copy emails. Please try again.');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterTier && { subscription_tier: filterTier })
      });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterTier]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterTier && { subscription_tier: filterTier })
      });
      
      const response = await fetch(`${API_BASE_URL}/api/admin/companies?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterTier]);

  // Main useEffect for tab changes
  useEffect(() => {
    if (mounted) {
      fetchAdminStats();
      fetchWaitlistStats();
      
      if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'companies') {
        fetchCompanies();
      } else if (activeTab === 'waitlist') {
        fetchWaitlistEntries();
      } else {
        setLoading(false);
      }
    }
  }, [mounted, activeTab, fetchAdminStats, fetchUsers, fetchCompanies, fetchWaitlistStats, fetchWaitlistEntries]);

  // Helper functions
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    router.push('/login')
  }

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const openUserEditModal = (user: User) => {
    setUserEditModal({ isOpen: true, user });
  };

  const closeUserEditModal = () => {
    setUserEditModal({ isOpen: false, user: null });
  };

  const openCompanyEditModal = (company: Company) => {
    setCompanyEditModal({ isOpen: true, company });
  };

  const closeCompanyEditModal = () => {
    setCompanyEditModal({ isOpen: false, company: null });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
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

  // Loading states
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RodgersDigital Admin</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>Platform</span>
              <span>/</span>
              <span className="text-gray-900">Administration</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Access</span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search users, companies..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm border border-purple-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to User Dashboard</span>
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Platform Overview', icon: 'BarChart3', active: activeTab === 'overview' },
              { id: 'users', label: 'User Management', icon: 'Users', active: activeTab === 'users' },
              { id: 'companies', label: 'Company Management', icon: 'Building2', active: activeTab === 'companies' },
              { id: 'waitlist', label: 'Waitlist Management', icon: 'ListChecks', active: activeTab === 'waitlist' },
              { id: 'campaigns', label: 'Campaign Manager', icon: 'Target', onClick: () => router.push('/campaigns') },
              { id: 'storage', label: 'Storage Monitoring', icon: 'Database', active: activeTab === 'storage' },
              { id: 'images', label: 'AI Image Generation', icon: 'ImageIcon', active: activeTab === 'images' },
              { id: 'analytics', label: 'Analytics', icon: 'Activity', active: activeTab === 'analytics' },
              { id: 'revenue', label: 'Revenue Analytics', icon: 'DollarSign', active: activeTab === 'revenue' },
              { id: 'settings', label: 'Platform Settings', icon: 'Settings', active: activeTab === 'settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  item.active
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : item.id === 'campaigns'
                    ? 'text-purple-600 hover:bg-purple-50 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5">
                  {item.icon === 'BarChart3' && <BarChart3 className="w-5 h-5" />}
                  {item.icon === 'Users' && <Users className="w-5 h-5" />}
                  {item.icon === 'Building2' && <Building2 className="w-5 h-5" />}
                  {item.icon === 'ListChecks' && <ListChecks className="w-5 h-5" />}
                  {item.icon === 'Target' && <Target className="w-5 h-5" />}
                  {item.icon === 'Database' && <Database className="w-5 h-5" />}
                  {item.icon === 'ImageIcon' && <ImageIcon className="w-5 h-5" />}
                  {item.icon === 'Activity' && <Activity className="w-5 h-5" />}
                  {item.icon === 'DollarSign' && <DollarSign className="w-5 h-5" />}
                  {item.icon === 'Settings' && <Settings className="w-5 h-5" />}
                </div>
                <span className="font-medium">{item.label}</span>
                {item.id === 'campaigns' && (
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </button>
            ))}
          </nav>

          {/* Platform Stats */}
          <div className="p-4 mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Platform Status</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Total Users</span>
                  <span>{stats.total_users}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {stats.total_companies} companies
                </div>
              </div>
              
              {waitlistStats && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Waitlist</span>
                    <span>{waitlistStats.total}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {waitlistStats.today} today
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Monthly Revenue</span>
                  <span>{formatCurrency(stats.monthly_recurring_revenue)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {stats.total_campaigns_created} campaigns
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full mt-6 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
                  <p className="text-gray-600">Monitor and manage your entire platform.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">Platform growth</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Companies</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_companies}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Active organizations
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <ListChecks className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Waitlist</p>
                      <p className="text-2xl font-bold text-gray-900">{waitlistStats?.total || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    {waitlistStats?.today || 0} joined today
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_recurring_revenue)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">Growing steadily</span>
                  </div>
                </div>
              </div>

              {/* Subscription Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Breakdown</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats.subscription_breakdown || {}).map(([tier, count]) => (
                      <div key={tier} className="text-center">
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab - Use your existing component with correct props */}
          {activeTab === 'users' && (
            <UserManagement
              users={users}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTier={filterTier}
              setFilterTier={setFilterTier}
              onEditUser={openUserEditModal}
              onUpdateUserStatus={updateUserStatus}
            />
          )}

          {/* Company Management Tab - Use your existing component with correct props */}
          {activeTab === 'companies' && (
            <CompanyManagement
              companies={companies}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTier={filterTier}
              setFilterTier={setFilterTier}
              onEditCompany={openCompanyEditModal}
            />
          )}

          {/* Waitlist Management Tab - Use your existing component with correct props */}
          {activeTab === 'waitlist' && (
            <WaitlistManagement
              waitlistStats={waitlistStats}
              waitlistEntries={waitlistEntries}
              waitlistLoading={waitlistLoading}
              onExport={handleWaitlistExport}
              onEmailExport={handleEmailExport}
              exporting={exporting}
            />
          )}

          {/* Storage Monitoring Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Storage Monitoring</h2>
                <p className="text-gray-600">Monitor platform storage usage and performance.</p>
              </div>
              {StorageMonitoring ? (
                <StorageMonitoring />
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Storage Monitoring</h3>
                  <p className="text-gray-500">Storage monitoring component not available.</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
                <p className="text-gray-600">Detailed analytics and insights.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500">Advanced analytics coming soon.</p>
              </div>
            </div>
          )}

          {/* Revenue Analytics Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
                <p className="text-gray-600">Track revenue, subscriptions, and financial metrics.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthly_recurring_revenue)}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_campaigns_created}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Companies</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total_companies}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Breakdown Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue by Subscription Tier</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.entries(stats.subscription_breakdown || {}).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </div>
                          <span className="text-sm text-gray-600">{count} subscribers</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {tier === 'free' ? '$0' : 
                             tier === 'starter' ? '$29' :
                             tier === 'professional' ? '$99' :
                             tier === 'agency' ? '$299' :
                             tier === 'enterprise' ? '$999' : '$0'} /mo
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-gray-600">Manage platform-wide settings and configurations.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Settings</h3>
                <p className="text-gray-500">Settings panel coming soon.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modals */}
      {userEditModal.user && (
        <UserEditModal
          user={userEditModal.user}
          isOpen={userEditModal.isOpen}
          onClose={closeUserEditModal}
          onSave={fetchUsers}
        />
      )}

      {companyEditModal.company && (
        <CompanyEditModal
          company={companyEditModal.company}
          isOpen={companyEditModal.isOpen}
          onClose={closeCompanyEditModal}
          onSave={fetchCompanies}
        />
      )}
    </div>
  );
}