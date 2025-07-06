// src/app/campaigns/[id]/generate/page.tsx - Apple Design System
import React from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, Sparkles, Mail, FileText, Video, Image, Globe, Target } from 'lucide-react'
import Link from 'next/link'

interface GeneratePageProps {
  params: {
    id: string
  }
}

export default function AppleGeneratePage({ params }: GeneratePageProps) {
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
                <h1 className="text-xl font-semibold text-black">Content Generation</h1>
                <p className="text-sm text-apple-gray font-medium">
                  Generate marketing content with AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Generate Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Coming Soon Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-apple-gray" />
          </div>
          <h2 className="text-3xl font-light text-black mb-4">Content Hub</h2>
          <p className="text-apple-gray max-w-2xl mx-auto leading-relaxed mb-8">
            Advanced content generation features are coming soon. This will include email series, 
            social media posts, blog content, and ad copy generation powered by AI intelligence.
          </p>
          
          {/* Preview Content Types */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {[
              { icon: Mail, title: 'Email Series', color: 'bg-blue-100 text-blue-600' },
              { icon: Image, title: 'Social Posts', color: 'bg-pink-100 text-pink-600' },
              { icon: Target, title: 'Ad Copy', color: 'bg-green-100 text-green-600' },
              { icon: FileText, title: 'Blog Posts', color: 'bg-purple-100 text-purple-600' },
              { icon: Video, title: 'Video Scripts', color: 'bg-red-100 text-red-600' },
              { icon: Globe, title: 'Landing Pages', color: 'bg-cyan-100 text-cyan-600' }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium text-black">{item.title}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-black rounded-2xl p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-3">Ready to Generate Content?</h3>
          <p className="text-gray-300 mb-6">
            Return to the main campaign page to access the content generation workflow.
          </p>
          <Link 
            href={`/campaigns/${id}?step=4`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <span>Go to Generation</span>
          </Link>
        </div>
      </div>
    </div>
  )
}