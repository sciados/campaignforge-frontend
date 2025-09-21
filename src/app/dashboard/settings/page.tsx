// src/app/dashboard/settings/page.tsx - Simple Dashboard Settings

"use client";

import { useState } from "react";
import { User, Bell, Shield, CreditCard, Palette, Globe, Settings as SettingsIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences' | 'api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const navigationItems = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Palette },
    { id: 'api' as SettingsTab, label: 'API Access', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left font-medium ${
                    activeTab === item.id
                      ? 'bg-gray-100 text-black'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
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
            <div className="space-x-2">
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-medium transition-colors">
                Change
              </button>
              <button className="text-gray-600 hover:text-black px-4 py-2 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
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
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">Billing Settings</h2>
      <p className="text-gray-600">Billing settings coming soon.</p>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">Preferences</h2>
      <p className="text-gray-600">Preferences settings coming soon.</p>
    </div>
  );
}

function APIAccessSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-medium text-black mb-8">API Access</h2>
      <p className="text-gray-600">API access settings coming soon.</p>
    </div>
  );
}