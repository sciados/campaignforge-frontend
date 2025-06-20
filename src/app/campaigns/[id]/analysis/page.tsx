// File 1: src/app/campaigns/[id]/analysis/page.tsx

import React from 'react'
import { notFound } from 'next/navigation'

interface AnalysisPageProps {
  params: {
    id: string
  }
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = params

  if (!id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analysis</h1>
          <p className="text-gray-600 mt-2">
            AI-powered intelligence and competitive analysis for campaign {id}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Intelligence Dashboard</h2>
          <p className="text-gray-600">
            Intelligence analysis features coming soon. This will include competitor analysis, 
            keyword extraction, and campaign angle generation.
          </p>
        </div>
      </div>
    </div>
  )
}