'use client'

import { Plus, Video, FileText, Globe, Calendar, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CampaignsPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-black">Campaigns</h1>
                <p className="text-sm text-gray-600">Create and manage your marketing campaigns</p>
              </div>
            </div>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Campaign Creation Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-black mb-6">Create New Campaign</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all text-left group">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Video className="h-6 w-6 text-black" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-black">From Video</h3>
              </div>
              <p className="text-gray-600">Process videos from YouTube, TikTok, and 8+ platforms</p>
            </button>

            <button className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all text-left group">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-black" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-black">From Document</h3>
              </div>
              <p className="text-gray-600">Upload PDFs, docs, presentations, and spreadsheets</p>
            </button>

            <button className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all text-left group">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Globe className="h-6 w-6 text-black" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-black">From Website</h3>
              </div>
              <p className="text-gray-600">Extract content from web pages and articles</p>
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-medium text-black mb-6">Recent Campaigns</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <Video className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-black">Product Launch Campaign</h3>
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 2 days ago • 15 content pieces
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Completed
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">View campaign</span>
                  →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <FileText className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-black">Social Media Blitz</h3>
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 5 days ago • 28 content pieces
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Active
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">View campaign</span>
                  →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                  <Globe className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-black">Email Newsletter Series</h3>
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 1 week ago • 12 content pieces
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Completed
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">View campaign</span>
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Empty State (if no campaigns exist) */}
          {/* 
          <div className="text-center py-12 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">No campaigns yet. Create your first campaign to get started!</p>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
              Create Your First Campaign
            </button>
          </div>
          */}
        </div>
      </main>
    </div>
  )
}