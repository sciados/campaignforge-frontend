"use client";

import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function MockupDebugPage() {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/content/mockups/debug-api-connection');
      console.log('Debug response:', response);
      setData(response);
    } catch (err: any) {
      console.error('Debug error:', err);
      setError(err.message || 'Failed to fetch debug info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dynamic Mockups API Debug
            </h1>
            <p className="text-gray-600">
              Test connection to Dynamic Mockups and view available templates
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchDebugInfo}
            disabled={loading}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Refresh'
            )}
          </button>

          {/* Loading State */}
          {loading && !data && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {data && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`border-2 rounded-lg p-6 ${
                data.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {data.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h2 className={`text-xl font-bold ${
                    data.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {data.api_connection || 'Connection Status'}
                  </h2>
                </div>
                <p className={`text-sm ${
                  data.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {data.message}
                </p>
              </div>

              {/* API Details */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">API Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">API Key Configured</p>
                    <p className="font-medium text-gray-900">
                      {data.api_key_configured ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>

                  {data.api_key_preview && (
                    <div>
                      <p className="text-sm text-gray-600">API Key Preview</p>
                      <p className="font-mono text-sm text-gray-900">
                        {data.api_key_preview}
                      </p>
                    </div>
                  )}

                  {data.status_code && (
                    <div>
                      <p className="text-sm text-gray-600">Status Code</p>
                      <p className="font-medium text-gray-900">{data.status_code}</p>
                    </div>
                  )}

                  {typeof data.templates_count !== 'undefined' && (
                    <div>
                      <p className="text-sm text-gray-600">Templates Found</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {data.templates_count}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Templates Preview */}
              {data.templates_preview && data.templates_preview.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Available Templates (First 10)
                  </h3>
                  <div className="space-y-4">
                    {data.templates_preview.map((template: any, index: number) => (
                      <div
                        key={template.uuid || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-4">
                          {template.thumbnail && (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-24 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              UUID: <span className="font-mono text-xs">{template.uuid}</span>
                            </p>
                            {template.collections && template.collections.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {template.collections.map((col: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                  >
                                    {col}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Smart Objects: {template.smart_objects_count}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {data.next_steps && data.next_steps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        Next Steps
                      </h3>
                      <ol className="space-y-2">
                        {data.next_steps.map((step: string, index: number) => (
                          <li key={index} className="text-sm text-blue-800">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Response */}
              {data.error_response && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Error Response
                  </h3>
                  <pre className="bg-white border border-gray-200 rounded p-4 overflow-x-auto text-xs text-gray-700">
                    {data.error_response}
                  </pre>
                </div>
              )}

              {/* Raw JSON */}
              <details className="bg-gray-50 rounded-lg p-6">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  View Raw JSON Response
                </summary>
                <pre className="mt-4 bg-white border border-gray-200 rounded p-4 overflow-x-auto text-xs text-gray-700">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
