// src/app/dashboard/settings/page.tsx

"use client";

import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-black">Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button className="w-full flex items-center px-4 py-3 text-left bg-gray-100 rounded-2xl text-black font-medium">
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-2xl text-gray-700 transition-colors">
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-2xl text-gray-700 transition-colors">
                <Shield className="h-5 w-5 mr-3" />
                Security
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-2xl text-gray-700 transition-colors">
                <CreditCard className="h-5 w-5 mr-3" />
                Billing
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-2xl text-gray-700 transition-colors">
                <Palette className="h-5 w-5 mr-3" />
                Preferences
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-2xl text-gray-700 transition-colors">
                <Globe className="h-5 w-5 mr-3" />
                API Access
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-medium text-black mb-8">
                Profile Settings
              </h2>

              <div className="space-y-8">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-black mb-4">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-medium text-xl">
                      U
                    </div>
                    <div>
                      <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
                        Change Photo
                      </button>
                      <button className="ml-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="john@company.com"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Company
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Your Company"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option>UTC (GMT+0)</option>
                    <option>Eastern Time (GMT-5)</option>
                    <option>Pacific Time (GMT-8)</option>
                    <option>Central European Time (GMT+1)</option>
                  </select>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg text-black font-medium transition-colors">
                      Cancel
                    </button>
                    <button className="bg-black hover:bg-gray-900 px-6 py-3 rounded-lg text-white font-medium transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings Sections */}
            <div className="mt-8 space-y-6">
              {/* Account Security */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-6">
                  Account Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Change Password
                      </h4>
                      <p className="text-sm text-gray-600">
                        Update your account password
                      </p>
                    </div>
                    <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
                      Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-6">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Receive updates about your campaigns
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get notified on your devices
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Weekly Reports
                      </h4>
                      <p className="text-sm text-gray-600">
                        Summary of your campaign performance
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm">
                <h3 className="text-lg font-medium text-red-900 mb-6">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg text-red-900 font-medium transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
