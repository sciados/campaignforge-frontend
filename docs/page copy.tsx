// /src/app/admin/page.tsx - CLEAN VERSION
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { Users, Building2, BarChart3, Shield, Sparkles, ListChecks, Search } from 'lucide-react';
import UserEditModal from '@/components/admin/UserEditModal';
import CompanyEditModal from '@/components/admin/CompanyEditModal';
import { waitlistApi } from '@/lib/waitlist-api';

// Import extracted components
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import WaitlistManagement from './components/WaitlistManagement';

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
        console.log('✅ Admin stats loaded:', data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  }, []);

  const fetchWaitlistStats = useCallback(async () => {
    try {
      const data = await waitlistApi.getStats();
      setWaitlistStats(data);
      console.log('✅ Waitlist stats loaded:', data);
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
      console.log('✅ Waitlist entries loaded:', data.length);
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
      // Handle export logic here
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  }, []);

  const handleEmailExport = useCallback(async () => {
    try {
      const data = await waitlistApi.export();
      const emailList = data.emails?.map((e: any) => e.email).join(', ') || '';
      await navigator.clipboard.writeText(emailList);
      alert(`Emails copied to clipboard!`);
    } catch (error) {
      console.error('Email export failed:', error);
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RodgersDigital Admin</h1>
                <p className="text-sm text-gray-500">Platform Administration Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-100 text-red-800 border border-red-200">
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
            
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => {
                console.log('🔄 Switching to user dashboard...');
                // Try the admin_override parameter first
                router.push('/dashboard?admin_override=true');
                
                // If that doesn't work, try these alternatives:
                // router.push('/campaigns');
                // router.push('/user');
                // router.push('/user-dashboard');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm border border-purple-200 hover:border-purple-300 hover:shadow-sm"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Switch to User Dashboard</span>
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>

          <nav className="p-6 space-y-2">
            {[
              { id: 'overview', label: 'Platform Overview', icon: BarChart3, active: activeTab === 'overview' },
              { id: 'users', label: 'User Management', icon: Users, active: activeTab === 'users' },
              { id: 'companies', label: 'Company Management', icon: Building2, active: activeTab === 'companies' },
              { id: 'waitlist', label: 'Waitlist Management', icon: ListChecks, active: activeTab === 'waitlist' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  item.active
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 mt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform Status</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="font-medium">Total Users</span>
                  <span className="font-bold text-lg">{stats.total_users}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {stats.total_companies} companies registered
                </div>
              </div>
              
              {waitlistStats && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex justify-between text-sm text-orange-700 mb-1">
                    <span className="font-medium">Waitlist</span>
                    <span className="font-bold text-lg">{waitlistStats.total || 0}</span>
                  </div>
                  <div className="text-xs text-orange-600">
                    {waitlistStats.today || 0} joined today
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
                <p className="text-gray-600 mt-2">Monitor and manage your entire platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-green-100 p-4 rounded-xl">
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Companies</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_companies}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-orange-100 p-4 rounded-xl">
                      <ListChecks className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Waitlist</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{waitlistStats?.total || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-emerald-100 p-4 rounded-xl">
                      <BarChart3 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Campaigns</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_campaigns_created}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
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

          {/* Company Management Tab */}
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

          {/* Waitlist Management Tab */}
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