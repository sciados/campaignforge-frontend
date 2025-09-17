"use client";

import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const api = useApi();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const authToken = localStorage.getItem('authToken');

        setAuthInfo({
          hasAccessToken: !!accessToken,
          hasAuthToken: !!authToken,
          accessTokenLength: accessToken?.length || 0,
          authTokenLength: authToken?.length || 0,
          accessTokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : 'None',
          authTokenPreview: authToken ? `${authToken.substring(0, 30)}...` : 'None',
          tokensMatch: accessToken === authToken
        });
      }
    };

    checkAuth();
  }, []);

  const testUserProfile = async () => {
    try {
      console.log('🧪 Testing getUserProfile...');
      const profile = await api.getUserProfile();
      setTestResults(prev => [...prev, {
        test: 'getUserProfile',
        success: true,
        data: profile,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ getUserProfile failed:', error);
      setTestResults(prev => [...prev, {
        test: 'getUserProfile',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const testGetCampaigns = async () => {
    try {
      console.log('🧪 Testing getCampaigns...');
      const campaigns = await api.getCampaigns();
      setTestResults(prev => [...prev, {
        test: 'getCampaigns',
        success: true,
        data: campaigns,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ getCampaigns failed:', error);
      setTestResults(prev => [...prev, {
        test: 'getCampaigns',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const testGetCampaign = async () => {
    try {
      console.log('🧪 Testing getCampaign with ID: 02145b25-3573-4d56-a3ad-36c74e1a1198');
      const campaign = await api.getCampaign('02145b25-3573-4d56-a3ad-36c74e1a1198');
      setTestResults(prev => [...prev, {
        test: 'getCampaign',
        success: true,
        data: campaign,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ getCampaign failed:', error);
      setTestResults(prev => [...prev, {
        test: 'getCampaign',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const testGetWorkflowState = async () => {
    try {
      console.log('🧪 Testing getWorkflowState with ID: 02145b25-3573-4d56-a3ad-36c74e1a1198');
      const workflowState = await api.getWorkflowState('02145b25-3573-4d56-a3ad-36c74e1a1198');
      setTestResults(prev => [...prev, {
        test: 'getWorkflowState',
        success: true,
        data: workflowState,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ getWorkflowState failed:', error);
      setTestResults(prev => [...prev, {
        test: 'getWorkflowState',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const testGetGeneratedContent = async () => {
    try {
      console.log('🧪 Testing getGeneratedContent with ID: 02145b25-3573-4d56-a3ad-36c74e1a1198');
      const generatedContent = await api.getGeneratedContent('02145b25-3573-4d56-a3ad-36c74e1a1198');
      setTestResults(prev => [...prev, {
        test: 'getGeneratedContent',
        success: true,
        data: generatedContent,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('❌ getGeneratedContent failed:', error);
      setTestResults(prev => [...prev, {
        test: 'getGeneratedContent',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Authentication Debug Page</h1>

        {/* Auth Status */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          {authInfo ? (
            <div className="space-y-2 text-sm">
              <div>Has Access Token: <span className={authInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>{authInfo.hasAccessToken ? 'Yes' : 'No'}</span></div>
              <div>Has Auth Token: <span className={authInfo.hasAuthToken ? 'text-green-600' : 'text-red-600'}>{authInfo.hasAuthToken ? 'Yes' : 'No'}</span></div>
              <div>Access Token Length: {authInfo.accessTokenLength}</div>
              <div>Auth Token Length: {authInfo.authTokenLength}</div>
              <div>Tokens Match: <span className={authInfo.tokensMatch ? 'text-green-600' : 'text-orange-600'}>{authInfo.tokensMatch ? 'Yes' : 'No'}</span></div>
              <div>Access Token Preview: <code className="bg-gray-100 px-2 py-1 rounded">{authInfo.accessTokenPreview}</code></div>
              <div>Auth Token Preview: <code className="bg-gray-100 px-2 py-1 rounded">{authInfo.authTokenPreview}</code></div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-lg font-semibold mb-4">API Tests</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={testUserProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test User Profile
            </button>
            <button
              onClick={testGetCampaigns}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Get Campaigns
            </button>
            <button
              onClick={testGetCampaign}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Get Specific Campaign
            </button>
            <button
              onClick={testGetWorkflowState}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Test Get Workflow State
            </button>
            <button
              onClick={testGetGeneratedContent}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Get Generated Content
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <div className="text-gray-500">No tests run yet</div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded border-l-4 ${result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  {result.success ? (
                    <div>
                      <div className="text-green-700 mb-2">✅ Success</div>
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div className="text-red-700">❌ Error: {result.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}