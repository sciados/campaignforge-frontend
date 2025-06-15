'use client'

import { Search, Filter, Grid, List, Image, FileText, Video, Mic } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ContentLibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600 mt-2">Browse and manage all your generated content</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button className="p-2 hover:bg-gray-50">
                  <Grid className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-50 border-l border-gray-300">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex space-x-1 mb-6">
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">All Content</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Images</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Videos</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Text</button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Audio</button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Sample Content Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <Image className="h-12 w-12 text-purple-600" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Product Hero Image</h3>
              <p className="text-gray-600 text-sm">Generated 2 days ago</p>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Image</span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Email Campaign Copy</h3>
              <p className="text-gray-600 text-sm">Generated 3 days ago</p>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Text</span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-emerald-100 to-orange-100 flex items-center justify-center">
              <Video className="h-12 w-12 text-emerald-600" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Social Media Video</h3>
              <p className="text-gray-600 text-sm">Generated 1 week ago</p>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Video</span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <Mic className="h-12 w-12 text-orange-600" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Podcast Script</h3>
              <p className="text-gray-600 text-sm">Generated 1 week ago</p>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Audio</span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
            </div>
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Load More Content
          </button>
        </div>
      </div>
    </div>
  )
}