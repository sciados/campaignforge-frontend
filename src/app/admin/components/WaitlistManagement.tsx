// /src/app/admin/components/WaitlistManagement.tsx - Extracted Component
'use client'

import React, { useState, useCallback } from 'react';
import { Mail, Download, Copy, Users, TrendingUp, BarChart3, Target, ListChecks } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
  is_notified: boolean;
  ip_address?: string;
}

interface WaitlistStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  recent_signups: WaitlistEntry[];
  daily_stats: Array<{ date: string; count: number }>;
}

interface Props {
  waitlistStats: WaitlistStats | null;
  waitlistEntries: WaitlistEntry[];
  waitlistLoading: boolean;
  onExport: () => void;
  onEmailExport: () => void;
  exporting: boolean;
}

export default function WaitlistManagement({
  waitlistStats,
  waitlistEntries,
  waitlistLoading,
  onExport,
  onEmailExport,
  exporting,
}: Props) {
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  console.log('📋 WaitlistManagement component rendering. Entries:', waitlistEntries.length);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waitlist Management</h2>
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
            onClick={onEmailExport}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center space-x-2 shadow-lg"
          >
            <Copy className="w-5 h-5" />
            <span>Copy Emails</span>
          </button>
          
          <button
            onClick={onExport}
            disabled={exporting}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-semibold disabled:opacity-50 flex items-center space-x-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
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
              <Copy className="w-5 h-5" />
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
                waitlistEntries.map((entry, index) => {
                  console.log('📧 Rendering waitlist entry:', entry.email);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {entry.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{entry.email}</div>
                            <div className="text-xs text-gray-500">Subscriber</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                        <div className="text-sm text-gray-900">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${
                          entry.is_notified 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {entry.is_notified ? '✅ Notified' : '⏳ Waiting'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {entry.ip_address || 'N/A'}
                      </td>
                    </tr>
                  );
                })
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
  );
}