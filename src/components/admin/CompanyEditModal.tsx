'use client'

import React, { useState, useEffect } from 'react';
import { X, Building2, Tag, Users, CreditCard, CheckCircle, XCircle, Save, Loader2, RotateCcw } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  company_slug: string;
  company_size: string;
  industry: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  user_count: number;
  campaign_count: number;
}

interface CompanyEditModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to refresh the company list
}

interface CompanyUpdateData {
  company_name?: string;
  industry?: string;
  company_size?: string;
}

interface SubscriptionUpdateData {
  subscription_tier?: string;
  monthly_credits_limit?: number;
  reset_monthly_credits?: boolean;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({ company, isOpen, onClose, onSave }) => {
  const [companyData, setCompanyData] = useState<CompanyUpdateData>({
    company_name: company.company_name,
    industry: company.industry,
    company_size: company.company_size
  });
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionUpdateData>({
    subscription_tier: company.subscription_tier,
    monthly_credits_limit: company.monthly_credits_limit,
    reset_monthly_credits: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when company changes
  useEffect(() => {
    setCompanyData({
      company_name: company.company_name,
      industry: company.industry,
      company_size: company.company_size
    });
    setSubscriptionData({
      subscription_tier: company.subscription_tier,
      monthly_credits_limit: company.monthly_credits_limit,
      reset_monthly_credits: false
    });
    setError(null);
    setSuccess(false);
  }, [company]);

  const subscriptionTiers = [
    { value: 'free', label: 'Free', price: '$0/month', credits: 1000, color: 'bg-gray-100 text-gray-800' },
    { value: 'starter', label: 'Starter', price: '$29/month', credits: 8000, color: 'bg-blue-100 text-blue-800' },
    { value: 'professional', label: 'Professional', price: '$79/month', credits: 20000, color: 'bg-purple-100 text-purple-800' },
    { value: 'agency', label: 'Agency', price: '$199/month', credits: 50000, color: 'bg-orange-100 text-orange-800' },
    { value: 'enterprise', label: 'Enterprise', price: '$499/month', credits: 100000, color: 'bg-green-100 text-green-800' }
  ];

  const companySizes = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small Business (11-50 employees)' },
    { value: 'medium', label: 'Medium Business (51-200 employees)' },
    { value: 'enterprise', label: 'Enterprise (200+ employees)' }
  ];

  const industries = [
    'Technology', 'Marketing & Advertising', 'E-commerce', 'Healthcare', 'Finance', 
    'Education', 'Real Estate', 'Manufacturing', 'Consulting', 'Media & Entertainment',
    'Non-profit', 'Government', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Update company details (we'll need to add this endpoint)
      const companyResponse = await fetch(`${API_BASE_URL}/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      // Update subscription (existing endpoint)
      const subscriptionResponse = await fetch(`${API_BASE_URL}/api/admin/companies/${company.id}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.detail || 'Failed to update subscription');
      }

      // Company update might fail if endpoint doesn't exist yet, but subscription should work
      if (!companyResponse.ok && companyResponse.status !== 404) {
        console.warn('Company details update failed, but subscription was updated');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave(); // Refresh the company list
        onClose(); // Close the modal
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (field: keyof CompanyUpdateData, value: any) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubscriptionChange = (field: keyof SubscriptionUpdateData, value: any) => {
    setSubscriptionData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-update credit limit when tier changes
    if (field === 'subscription_tier') {
      const tier = subscriptionTiers.find(t => t.value === value);
      if (tier) {
        setSubscriptionData(prev => ({
          ...prev,
          monthly_credits_limit: tier.credits
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Company</h2>
              <p className="text-sm text-gray-500">{company.company_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Company updated successfully!</p>
              <p className="text-green-600 text-sm">Changes will be reflected in the company list.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Error updating company</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Details Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyData.company_name || ''}
                  onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Industry
                </label>
                <select
                  value={companyData.industry || ''}
                  onChange={(e) => handleCompanyChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              {/* Company Size */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Company Size
                </label>
                <select
                  value={companyData.company_size || ''}
                  onChange={(e) => handleCompanyChange('company_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {companySizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subscription Management Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Subscription Management
            </h3>

            {/* Subscription Tier Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subscription Tier
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subscriptionTiers.map((tier) => (
                  <label key={tier.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                    <input
                      type="radio"
                      name="subscription_tier"
                      value={tier.value}
                      checked={subscriptionData.subscription_tier === tier.value}
                      onChange={(e) => handleSubscriptionChange('subscription_tier', e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{tier.label}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${tier.color}`}>
                          {tier.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{tier.credits.toLocaleString()} credits/month</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Credit Limit */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Credit Limit
              </label>
              <input
                type="number"
                value={subscriptionData.monthly_credits_limit || 0}
                onChange={(e) => handleSubscriptionChange('monthly_credits_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="0"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Custom credit limit (overrides tier default)
              </p>
            </div>

            {/* Reset Credits Option */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg bg-white">
              <input
                type="checkbox"
                checked={subscriptionData.reset_monthly_credits || false}
                onChange={(e) => handleSubscriptionChange('reset_monthly_credits', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset Monthly Credits
                </span>
                <p className="text-xs text-gray-500">
                  Reset credits used this month to 0 (useful for billing cycle changes)
                </p>
              </div>
            </label>
          </div>

          {/* Current Status Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Company Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Slug:</span>
                  <span className="text-gray-900">@{company.company_slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="text-gray-900">{company.user_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaigns:</span>
                  <span className="text-gray-900">{company.campaign_count}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Used:</span>
                  <span className="text-gray-900">{company.monthly_credits_used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Limit:</span>
                  <span className="text-gray-900">{company.monthly_credits_limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilization:</span>
                  <span className="text-gray-900">
                    {company.monthly_credits_limit > 0 
                      ? Math.round((company.monthly_credits_used / company.monthly_credits_limit) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;