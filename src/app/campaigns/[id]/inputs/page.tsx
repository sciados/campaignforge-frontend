import React from 'react'
import { notFound } from 'next/navigation'

interface InputsPageProps {
  params: {
    id: string
  }
}

export default function InputsPage({ params }: InputsPageProps) {
  const { id } = params

  if (!id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Input Sources</h1>
          <p className="text-gray-600 mt-2">
            Manage intelligence sources for campaign {id}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Source Management</h2>
          <p className="text-gray-600">
            Input source management features coming soon. This will include URL analysis, 
            file uploads, and batch processing capabilities.
          </p>
        </div>
      </div>
    </div>
  )
}