'use client'

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_name: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  is_active: boolean;
  is_verified: boolean;
}

interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to refresh the user list
}

interface UserUpdateData {
  full_name?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserUpdateData>({
    full_name: user.full_name,
    role: user.role,
    is_active: user.is_active,
    is_verified: user.is_verified
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified
    });
    setError(null);
    setSuccess(false);
  }, [user]);

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full platform access', color: 'bg-red-100 text-red-800' },
    { value: 'owner', label: 'Company Owner', description: 'Company owner with full access', color: 'bg-blue-100 text-blue-800' },
    { value: 'member', label: 'Member', description: 'Regular user with standard access', color: 'bg-gray-100 text-gray-800' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access', color: 'bg-yellow-100 text-yellow-800' }
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
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave(); // Refresh the user list
        onClose(); // Close the modal
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
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
              <p className="text-green-800 font-medium">User updated successfully!</p>
              <p className="text-green-600 text-sm">Changes will be reflected in the user list.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Error updating user</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              User Role
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label key={role.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                        {role.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Account Status</h4>
            
            {/* Active Status */}
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Active Account</span>
                <p className="text-xs text-gray-500">User can log in and access the platform</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </label>

            {/* Verified Status */}
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Email Verified</span>
                <p className="text-xs text-gray-500">User has confirmed their email address</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_verified || false}
                onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </label>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current User Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="text-gray-900">{user.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.subscription_tier === 'free' ? 'bg-gray-100 text-gray-800' :
                  user.subscription_tier === 'starter' ? 'bg-blue-100 text-blue-800' :
                  user.subscription_tier === 'professional' ? 'bg-purple-100 text-purple-800' :
                  user.subscription_tier === 'agency' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.subscription_tier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credits Used:</span>
                <span className="text-gray-900">{user.monthly_credits_used} / {user.monthly_credits_limit}</span>
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

export default UserEditModal;