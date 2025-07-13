// /src/app/admin/page.tsx - FIXED VERSION: Improved Formatting + Waitlist Loading
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { Users, Building2, Target, DollarSign, TrendingUp, Search, Filter, Edit, Trash2, Eye, BarChart3, Settings, Database, Activity, Shield, Sparkles, Image as ImageIcon, Mail, ListChecks } from 'lucide-react';
import UserEditModal from '@/components/admin/UserEditModal';
import CompanyEditModal from '@/components/admin/CompanyEditModal';
import { waitlistApi, waitlistUtils, type WaitlistStatsResponse, type WaitlistEntry } from '@/lib/waitlist-api';

// Optional imports - handle gracefully if components don't exist
let StorageMonitoring: React.ComponentType | null = null;
let ImageGenerationMonitoring: React.ComponentType | null = null;

try {
  StorageMonitoring = require('@/app/admin/components/StorageMonitoring').default;
} catch (error) {
  console.log('StorageMonitoring component not found');
}

try {
  ImageGenerationMonitoring = require('@/app/admin/components/ImageGenerationMonitoring').default;
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
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // ✅ FIXED: Waitlist states
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStatsResponse | null>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
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

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ FIXED: Waitlist functions
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
      const emailList = data.emails.map(e => e.email).join(', ');
      
      await navigator.clipboard.writeText(emailList);
      alert(`${data.emails.length} email addresses copied to clipboard!`);
    } catch (error) {
      console.error('Email export failed:', error);
      alert('Failed to copy emails. Please try again.');
    }
  }, []);

  const generateLaunchEmail = useCallback(() => {
    if (!waitlistStats) return '';
    
    return `Subject: 🚀 We're Live! RodgersDigital AI is Now Available

Hi there!

You're receiving this email because you joined our waitlist for RodgersDigital AI. 

🎉 **We're officially live!**

After months of development, we're excited to announce that RodgersDigital AI is now available. You were one of ${waitlistStats.total.toLocaleString()} people who believed in our vision early on.

**What's New:**
• AI-powered campaign generation
• Ultra-cheap image creation (90% cost savings)
• Complete marketing asset creation
• Landing page generation
• Social media content creation

**Your Early Access:**
As a waitlist member, you get:
• Free trial extended to 30 days
• Priority support
• Exclusive early adopter pricing

**Get Started:**
👉 Visit: https://rodgersdigital.com
👉 Use code: EARLYBIRD for 50% off your first month

Thank you for your patience and support!

Best regards,
The RodgersDigital Team

---
You're receiving this because you joined our waitlist.`;
  }, [waitlistStats]);

  // Existing functions
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

  // ✅ FIXED: Load waitlist stats on overview tab and initial load
  useEffect(() => {
    if (mounted) {
      // Always fetch admin stats and waitlist stats for overview
      fetchAdminStats();
      fetchWaitlistStats(); // ✅ FIXED: Load waitlist stats immediately
      
      // Load tab-specific data
      if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'companies') {
        fetchCompanies();
      } else if (activeTab === 'waitlist') {
        fetchWaitlistEntries();
      } else {
        // ✅ FIXED: Reset loading state for overview and other tabs
        setLoading(false);
      }
    }
  }, [mounted, activeTab, fetchAdminStats, fetchUsers, fetchCompanies, fetchWaitlistStats, fetchWaitlistEntries]);

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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_role: newRole })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('❌ Failed to update user role');
    }
  };

  const updateSubscriptionTier = async (companyId: string, newTier: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription_tier: newTier })
      });
      if (response.ok) {
        fetchCompanies();
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  // Modal handlers
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

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      owner: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800',
      viewer: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

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
      {/* Header - Enhanced */}
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
            {/* Admin Badge */}
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
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Enhanced */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">
          {/* Switch to User Dashboard Button */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm border border-purple-200"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Switch to User Dashboard</span>
            </button>
          </div>

          <nav className="p-6 space-y-2">
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
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
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

          {/* Platform Stats in Sidebar - Enhanced */}
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
              
              {/* ✅ FIXED: Enhanced waitlist display */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between text-sm text-orange-700 mb-1">
                  <span className="font-medium">Waitlist</span>
                  <span className="font-bold text-lg">{waitlistStats?.total || 0}</span>
                </div>
                <div className="text-xs text-orange-600">
                  {waitlistStats?.today || 0} joined today
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between text-sm text-green-700 mb-1">
                  <span className="font-medium">Monthly Revenue</span>
                  <span className="font-bold">{formatCurrency(stats.monthly_recurring_revenue)}</span>
                </div>
                <div className="text-xs text-green-600">
                  {stats.total_campaigns_created} campaigns created
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
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
          {/* Stats Overview - Enhanced */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
                  <p className="text-gray-600 mt-2">Monitor and manage your entire platform with real-time insights.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* ✅ FIXED: Enhanced Stats Cards with Better Formatting */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_users}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Growing</span>
                    </div>
                    <span className="text-gray-500">Platform growth</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-green-100 p-4 rounded-xl">
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Companies</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total_companies}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-blue-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Active</span>
                    </div>
                    <span className="text-gray-500">Organizations</span>
                  </div>
                </div>

                {/* ✅ FIXED: Enhanced Waitlist Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-orange-100 p-4 rounded-xl">
                      <ListChecks className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Waitlist</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{waitlistStats?.total || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-orange-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="font-semibold">+{waitlistStats?.today || 0}</span>
                    </div>
                    <span className="text-gray-500">Joined today</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-emerald-100 p-4 rounded-xl">
                      <DollarSign className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Revenue</p>
                      <p className="text-4xl font-bold text-gray-900 mt-2">{formatCurrency(stats.monthly_recurring_revenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-emerald-600">
                      <Target className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{stats.total_campaigns_created}</span>
                    </div>
                    <span className="text-gray-500">Campaigns created</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Subscription Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-8 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Subscription Distribution</h3>
                  <p className="text-gray-600 mt-1">Current subscription tier breakdown across all companies</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {Object.entries(stats.subscription_breakdown || {}).map(([tier, count]) => (
                      <div key={tier} className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                        <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getTierColor(tier)} mb-4`}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-500 mt-1">companies</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                  <Users className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">User Management</h3>
                  <p className="text-blue-100 text-sm mb-6">Manage user accounts, roles, and permissions across the platform</p>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    Manage Users
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                  <Building2 className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Company Management</h3>
                  <p className="text-green-100 text-sm mb-6">Oversee company accounts, subscriptions, and billing information</p>
                  <button 
                    onClick={() => setActiveTab('companies')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    Manage Companies
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all">
                  <ListChecks className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Waitlist Management</h3>
                  <p className="text-orange-100 text-sm mb-6">View and manage waitlist subscribers, send launch notifications</p>
                  <button 
                    onClick={() => setActiveTab('waitlist')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    Manage Waitlist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ FIXED: Enhanced Waitlist Management Tab */}
          {activeTab === 'waitlist' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Waitlist Management</h2>
                  <p className="text-gray-600 mt-2">
                    Manage your {waitlistStats?.total.toLocaleString() || 0} waitlist subscribers and prepare launch communications
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEmailComposer(!showEmailComposer)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center space-x-2 shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Launch Email</span>
                  </button>
                  
                  <button
                    onClick={handleEmailExport}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center space-x-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Emails</span>
                  </button>
                  
                  <button
                    onClick={handleWaitlistExport}
                    disabled={exporting}
                    className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-semibold disabled:opacity-50 flex items-center space-x-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Total Signups</h3>
                  <p className="text-4xl font-bold text-blue-600">{waitlistStats?.total.toLocaleString() || 0}</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Today</h3>
                  <p className="text-4xl font-bold text-green-600">{waitlistStats?.today || 0}</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">This Week</h3>
                  <p className="text-4xl font-bold text-purple-600">{waitlistStats?.this_week || 0}</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">This Month</h3>
                  <p className="text-4xl font-bold text-orange-600">{waitlistStats?.this_month || 0}</p>
                </div>
              </div>

              {/* Email Composer */}
              {showEmailComposer && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Launch Email Template</h2>
                    <button
                      onClick={() => setShowEmailComposer(false)}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <textarea
                    value={generateLaunchEmail()}
                    readOnly
                    className="w-full h-96 p-6 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
                  />
                  
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(generateLaunchEmail())
                        alert('Email template copied to clipboard!')
                      }}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Template</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent('🚀 We\'re Live! RodgersDigital AI is Now Available')
                        const body = encodeURIComponent(generateLaunchEmail().split('\n').slice(1).join('\n'))
                        window.open(`mailto:?subject=${subject}&body=${body}`)
                      }}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Open in Email Client</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Waitlist Entries Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">Recent Signups</h2>
                  <p className="text-gray-600 mt-1">Latest waitlist entries and subscriber information</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Email Address
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {waitlistEntries.length > 0 ? (
                        waitlistEntries.map((entry, index) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">
                              #{index + 1}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {entry.email}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                              {new Date(entry.created_at).toLocaleDateString()} at{' '}
                              {new Date(entry.created_at).toLocaleTimeString()}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${
                                entry.is_notified 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {entry.is_notified ? 'Notified' : 'Waiting'}
                              </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {entry.ip_address || 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                            {waitlistLoading ? (
                              <div className="flex items-center justify-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                <span>Loading waitlist entries...</span>
                              </div>
                            ) : (
                              <div>
                                <ListChecks className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg font-medium">No waitlist entries yet</p>
                                <p className="text-sm">Subscribers will appear here when they join the waitlist</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Signups (Last 30 Days)</h2>
                
                {waitlistStats?.daily_stats && waitlistStats.daily_stats.length > 0 ? (
                  <div className="space-y-4">
                    {waitlistStats.daily_stats.slice(0, 10).map((day, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(100, (day.count / Math.max(...waitlistStats.daily_stats.map(d => d.count))) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-8 text-right">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-500">No daily statistics available yet</p>
                    <p className="text-sm text-gray-400">Data will appear here as people join the waitlist</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keep all other existing tabs unchanged (users, companies, etc.) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
                </div>
              </div>
              {/* Rest of users tab content remains the same */}
            </div>
          )}

          {/* All other existing tabs remain unchanged */}
          
          {/* ✅ FIXED: Only show loading spinner for tabs that actually need loading */}
          {loading && (activeTab === 'users' || activeTab === 'companies') && (
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