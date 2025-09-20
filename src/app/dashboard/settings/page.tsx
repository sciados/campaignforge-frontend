// src/app/dashboard/settings/page.tsx - REDESIGNED WITH PLATFORM INTEGRATIONS

"use client";

import { useState } from "react";
import { User, Bell, Shield, CreditCard, Palette, Globe, Zap, Settings as SettingsIcon, ExternalLink, Copy, CheckCircle, Info, ArrowRight } from "lucide-react";
import ClickBankSettings from "src/components/clickbank/ClickBankSettings";

export const dynamic = "force-dynamic";

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences' | 'api' | 'platforms';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const navigationItems = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Palette },
    { id: 'platforms' as SettingsTab, label: 'Platform Integrations', icon: Zap },
    { id: 'api' as SettingsTab, label: 'API Access', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and platform integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-2xl font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-black'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                  {item.id === 'platforms' && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'platforms' && <PlatformIntegrationsSettings />}
          {activeTab === 'api' && <APIAccessSettings />}
        </div>
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettings() {
  return (
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
  );
}

// Platform Integrations Settings Component
function PlatformIntegrationsSettings() {
  const [selectedPlatform, setSelectedPlatform] = useState<'clickbank' | 'jvzoo' | 'warriorplus'>('clickbank');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Platforms List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-medium text-black">Platform Integrations</h2>
              <p className="text-gray-600 mt-2">
                Connect your affiliate marketing platforms and tools
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              3 Available
            </span>
          </div>

          <div className="space-y-6">
            {/* ClickBank Integration */}
            <div
              className={`border rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlatform === 'clickbank'
                  ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlatform('clickbank')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black">ClickBank</h3>
                    <p className="text-sm text-gray-600">
                      Connect your ClickBank account to fetch sales data and manage affiliate campaigns
                    </p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Available
                </span>
              </div>

              {selectedPlatform === 'clickbank' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ClickBankSettings />
                </div>
              )}
            </div>

            {/* JVZoo Integration (Coming Soon) */}
            <div
              className={`border rounded-xl p-6 opacity-75 cursor-pointer transition-all ${
                selectedPlatform === 'jvzoo'
                  ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlatform('jvzoo')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black">JVZoo</h3>
                    <p className="text-sm text-gray-600">
                      Integrate with JVZoo for comprehensive affiliate network management
                    </p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  Coming Soon
                </span>
              </div>

              {selectedPlatform === 'jvzoo' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    JVZoo integration will be available in the next update. Get notified when it&apos;s ready.
                  </p>
                  <button className="mt-3 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                    Notify Me
                  </button>
                </div>
              )}
            </div>

            {/* WarriorPlus Integration (Coming Soon) */}
            <div
              className={`border rounded-xl p-6 opacity-75 cursor-pointer transition-all ${
                selectedPlatform === 'warriorplus'
                  ? 'border-red-300 bg-red-50 ring-2 ring-red-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlatform('warriorplus')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black">WarriorPlus</h3>
                    <p className="text-sm text-gray-600">
                      Connect with WarriorPlus to expand your affiliate marketing reach
                    </p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  Coming Soon
                </span>
              </div>

              {selectedPlatform === 'warriorplus' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    WarriorPlus integration is in development. Stay tuned for updates.
                  </p>
                  <button className="mt-3 bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                    Notify Me
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Help Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 sticky top-6">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-blue-900">Setup Guide</h3>
          </div>

          {selectedPlatform === 'clickbank' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">How to get your ClickBank API credentials:</h4>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">1</span>
                    <p>Log into your ClickBank account at <span className="font-medium">account.clickbank.com</span></p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">2</span>
                    <p>Navigate to <span className="font-medium">Settings → My Account</span></p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">3</span>
                    <p>Find your <span className="font-medium">Account Nickname</span> (this is your Nickname)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">4</span>
                    <p>Go to <span className="font-medium">Settings → My Site</span></p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 mt-0.5">5</span>
                    <p>Generate or copy your <span className="font-medium">Clerk API Key</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Security Note</p>
                    <p className="text-xs text-blue-800 mt-1">Your API keys are encrypted and stored securely. We only use them to fetch your sales data.</p>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                onClick={() => window.open('https://account.clickbank.com', '_blank')}
              >
                <span>Open ClickBank Account</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}

          {selectedPlatform === 'jvzoo' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">JVZoo API Setup (Coming Soon):</h4>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>When JVZoo integration becomes available, you&apos;ll need:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>JVZoo API Key</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Account ID</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Secret Key</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Stay Updated</p>
                    <p className="text-xs text-blue-800 mt-1">We&apos;ll notify you when JVZoo integration is ready with step-by-step setup instructions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === 'warriorplus' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">WarriorPlus API Setup (Coming Soon):</h4>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>When WarriorPlus integration becomes available, you&apos;ll need:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>WarriorPlus API Token</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Vendor ID</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Affiliate ID</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">In Development</p>
                    <p className="text-xs text-blue-800 mt-1">WarriorPlus integration is currently being developed. Complete setup guides will be available upon release.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Other Settings Components (simplified for now)
function NotificationSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">Notification Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="text-sm font-medium text-black">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive updates about your campaigns</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="text-sm font-medium text-black">Push Notifications</h4>
            <p className="text-sm text-gray-600">Get notified on your devices</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="text-sm font-medium text-black">Weekly Reports</h4>
            <p className="text-sm text-gray-600">Summary of your campaign performance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-xl font-medium text-black mb-8">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-black">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-black">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm">
        <h3 className="text-lg font-medium text-red-900 mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg text-red-900 font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">Billing & Subscription</h2>
      <div className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-black mb-2">Current Plan</h3>
          <p className="text-gray-600 mb-4">You are currently on the Professional plan</p>
          <button className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg text-white font-medium transition-colors">
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">Preferences</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-3">Theme</label>
          <select className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-3">Language</label>
          <select className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function APIAccessSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">API Access</h2>
      <div className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-black mb-2">API Keys</h3>
          <p className="text-gray-600 mb-4">Manage your API keys for third-party integrations</p>
          <button className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg text-white font-medium transition-colors">
            Generate New Key
          </button>
        </div>
      </div>
    </div>
  );
}
