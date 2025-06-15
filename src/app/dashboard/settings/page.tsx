'use client'

import { User, Bell, Shield, CreditCard, Palette, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button className="w-full flex items-center px-4 py-3 text-left bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium">
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg text-gray-700">
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg text-gray-700">
                <Shield className="h-5 w-5 mr-3" />
                Security
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg text-gray-700">
                <CreditCard className="h-5 w-5 mr-3" />
                Billing
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg text-gray-700">
                <Palette className="h-5 w-5 mr-3" />
                Preferences
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg text-gray-700">
                <Globe className="h-5 w-5 mr-3" />
                API Access
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      U
                    </div>
                    <div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Change Photo
                      </button>
                      <button className="ml-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your Company"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>UTC (GMT+0)</option>
                    <option>Eastern Time (GMT-5)</option>
                    <option>Pacific Time (GMT-8)</option>
                    <option>Central European Time (GMT+1)</option>
                  </select>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}