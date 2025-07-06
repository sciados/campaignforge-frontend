// src/app/campaigns/[id]/analysis/page.tsx - Apple Design System
import React from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, Brain, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface AnalysisPageProps {
  params: {
    id: string
  }
}

export default function AppleAnalysisPage({ params }: AnalysisPageProps) {
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
                <h1 className="text-xl font-semibold text-black">Campaign Analysis</h1>
                <p className="text-sm text-apple-gray font-medium">
                  AI-powered intelligence and competitive analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                <Brain className="h-4 w-4" />
                <span>Run Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Coming Soon Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-apple-gray" />
          </div>
          <h2 className="text-3xl font-light text-black mb-4">Intelligence Dashboard</h2>
          <p className="text-apple-gray max-w-2xl mx-auto leading-relaxed mb-8">
            Advanced AI-powered intelligence analysis features are coming soon. This will include competitor analysis, 
            keyword extraction, market insights, and campaign angle generation.
          </p>
          
          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Competitor Analysis</h3>
              <p className="text-sm text-apple-gray">
                Deep analysis of competitor strategies, messaging, and performance metrics
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Keyword Extraction</h3>
              <p className="text-sm text-apple-gray">
                Identify high-performing keywords and phrases from your source content
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Campaign Angles</h3>
              <p className="text-sm text-apple-gray">
                AI-generated campaign angles and messaging strategies based on intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intelligence Sources */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Intelligence Sources</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Performance Insights</h3>
            <div className="space-y-4">
              {[
                { label: 'Confidence Score', value: '--', color: 'bg-blue-100' },
                { label: 'Market Potential', value: '--', color: 'bg-green-100' },
                { label: 'Competition Level', value: '--', color: 'bg-orange-100' },
                { label: 'Trend Analysis', value: '--', color: 'bg-purple-100' }
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray font-medium">{metric.label}</span>
                  <div className={`px-3 py-1 rounded-lg ${metric.color} text-sm font-medium`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-black rounded-2xl p-8 text-center mt-8">
          <h3 className="text-xl font-medium text-white mb-3">Ready to Analyze Your Campaign?</h3>
          <p className="text-gray-300 mb-6">
            Return to the main campaign page to add intelligence sources and start generating insights.
          </p>
          <Link 
            href={`/campaigns/${id}`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <span>Go to Campaign</span>
          </Link>
        </div>
      </div>
    </div>
  )
}