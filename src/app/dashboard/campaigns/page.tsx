'use client'

import { Plus, Video, FileText, Globe, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create and manage your marketing campaigns</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Campaign Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Video</h3>
            </div>
            <p className="text-gray-600">Process videos from YouTube, TikTok, and 8+ platforms</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Document</h3>
            </div>
            <p className="text-gray-600">Upload PDFs, docs, presentations, and spreadsheets</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Globe className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Website</h3>
            </div>
            <p className="text-gray-600">Extract content from web pages and articles</p>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Campaigns</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Product Launch Campaign</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 2 days ago • 15 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Social Media Blitz</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 5 days ago • 28 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Globe className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Newsletter Series</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 1 week ago • 12 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}