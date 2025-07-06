// src/app/campaigns/[id]/settings/page.tsx - Apple Design System
import React from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, Settings, Target, Hash, User, Globe } from 'lucide-react'
import Link from 'next/link'

interface SettingsPageProps {
  params: {
    id: string
  }
}

export default function AppleSettingsPage({ params }: SettingsPageProps) {
  const { id } = params

  if (!id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-apple-light">
      {/* Apple-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/campaigns/${id}`}
                className="w-8 h-8 flex items-center justify-center text-apple-gray hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-black">Campaign Settings</h1>
                <p className="text-sm text-apple-gray font-medium">
                  Configure campaign preferences and parameters
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                <Settings className="h-4 w-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Coming Soon Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="h-10 w-10 text-apple-gray" />
          </div>
          <h2 className="text-3xl font-light text-black mb-4">Configuration</h2>
          <p className="text-apple-gray max-w-2xl mx-auto leading-relaxed mb-8">
            Advanced campaign settings features are coming soon. This will include keyword management, 
            target audience configuration, campaign preferences, and AI generation parameters.
          </p>
          
          {/* Preview Settings Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Hash className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Keywords</h3>
              <p className="text-sm text-apple-gray">
                Manage target keywords and phrases for content optimization
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Audience</h3>
              <p className="text-sm text-apple-gray">
                Define target audience demographics and psychographics
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Brand Voice</h3>
              <p className="text-sm text-apple-gray">
                Configure brand voice, tone, and messaging preferences
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Preferences</h3>
              <p className="text-sm text-apple-gray">
                Set campaign-wide preferences and AI generation parameters
              </p>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-black rounded-2xl p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-3">Ready to Configure?</h3>
          <p className="text-gray-300 mb-6">
            Return to the main campaign page to access basic campaign settings and information.
          </p>
          <Link 
            href={`/campaigns/${id}?step=1`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <span>Go to Campaign</span>
          </Link>
        </div>
      </div>
    </div>
  )
}