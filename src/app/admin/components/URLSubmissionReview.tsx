// src/app/admin/components/URLSubmissionReview.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Building2,
  Globe,
  AlertCircle,
  RefreshCw,
  FileText,
  Star,
  TrendingUp,
  Target,
  MessageSquare
} from "lucide-react";

interface URLSubmission {
  id: string;
  product_name: string;
  category: string;
  sales_page_url: string;
  affiliate_signup_url: string;
  launch_date: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "processing";
  submitted_at: string;
  submitter_email: string;
  submitter_name?: string;
  company_name?: string;
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  // Affiliate Metrics
  commission_rate?: number;
  product_price?: number;
  estimated_conversion_rate?: number;
  affiliate_platform?: string;
  gravity_score?: number;
}

const URLSubmissionReview: React.FC = () => {
  const [submissions, setSubmissions] = useState<URLSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<URLSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    "https://campaign-backend-production-e2db.up.railway.app";

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      params.append("limit", "100");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/intelligence/creator-submissions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data || []);
      } else {
        console.error("Failed to load submissions:", response.status);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
    setLoading(false);
  }, [filterStatus, API_BASE_URL]);

  const processSubmission = async (submissionId: string, approve: boolean, notes?: string) => {
    setProcessing(submissionId);
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams();
      params.append("approve", approve.toString());
      if (notes) {
        params.append("admin_notes", notes);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/intelligence/process-creator-submission/${submissionId}?${params}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await loadSubmissions(); // Refresh the list
        setSelectedSubmission(null);
        setAdminNotes("");
        setShowDetails(false);

        const action = approve ? "approved" : "rejected";
        alert(`✅ Submission ${action} successfully!${approve ? "\n\nThe URLs will now be analyzed and added to the Content Library for affiliates." : ""}`);
      } else {
        const error = await response.json();
        alert(`❌ Failed to process submission: ${error.detail || error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error processing submission:", error);
      alert("❌ Error processing submission. Check console for details.");
    }
    setProcessing(null);
  };

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "approved":
        return "text-green-600 bg-green-100 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-100 border-red-200";
      case "processing":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    filterStatus === "all" || submission.status === filterStatus
  );

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">URL Submission Review</h2>
          <p className="text-gray-600">
            Review and approve product creator URL submissions for the Content Library
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected", "processing"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === "pending" && pendingCount > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">
              {filterStatus !== "all"
                ? `No ${filterStatus} submissions to display`
                : "No URL submissions have been received yet"
              }
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.product_name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {submission.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{submission.submitter_name || submission.submitter_email}</span>
                    </div>
                    {submission.company_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{submission.company_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Launch: {new Date(submission.launch_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Sales Page:</span>
                      <a
                        href={submission.sales_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {submission.sales_page_url}
                      </a>
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Affiliate Signup:</span>
                      <a
                        href={submission.affiliate_signup_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        {submission.affiliate_signup_url}
                      </a>
                      <ExternalLink className="w-3 h-3 text-green-500" />
                    </div>
                  </div>

                  {submission.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Creator Notes:</strong> {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* Affiliate Metrics Display */}
                  {(submission.commission_rate || submission.product_price || submission.affiliate_platform) && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Affiliate Metrics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {submission.commission_rate && (
                          <div>
                            <span className="font-medium text-green-700">Commission:</span>
                            <div className="text-green-600">{submission.commission_rate}%</div>
                          </div>
                        )}
                        {submission.product_price && (
                          <div>
                            <span className="font-medium text-green-700">Price:</span>
                            <div className="text-green-600">${submission.product_price}</div>
                          </div>
                        )}
                        {submission.affiliate_platform && (
                          <div>
                            <span className="font-medium text-green-700">Platform:</span>
                            <div className="text-green-600">{submission.affiliate_platform}</div>
                          </div>
                        )}
                        {submission.estimated_conversion_rate && (
                          <div>
                            <span className="font-medium text-green-700">Est. Conversion:</span>
                            <div className="text-green-600">{submission.estimated_conversion_rate}%</div>
                          </div>
                        )}
                        {submission.gravity_score && (
                          <div>
                            <span className="font-medium text-green-700">Gravity Score:</span>
                            <div className="text-green-600">{submission.gravity_score}</div>
                          </div>
                        )}
                        {submission.commission_rate && submission.product_price && submission.estimated_conversion_rate && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="font-medium text-green-700">Est. EPC:</span>
                            <div className="text-green-600 font-semibold">
                              ${((submission.product_price * (submission.commission_rate / 100) * (submission.estimated_conversion_rate / 100))).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {submission.admin_notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Admin Notes:</strong> {submission.admin_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setAdminNotes(submission.admin_notes || "");
                      setShowDetails(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {submission.status === "pending" && (
                    <>
                      <button
                        onClick={() => processSubmission(submission.id, true)}
                        disabled={processing === submission.id}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setAdminNotes("");
                          setShowDetails(true);
                        }}
                        disabled={processing === submission.id}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Submission: {selectedSubmission.product_name}
                </h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedSubmission(null);
                    setAdminNotes("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes {selectedSubmission.status === "pending" && "(Required for rejection)"}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about your decision..."
                />
              </div>

              {selectedSubmission.status === "pending" && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => processSubmission(selectedSubmission.id, false, adminNotes)}
                    disabled={processing === selectedSubmission.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject with Notes
                  </button>
                  <button
                    onClick={() => processSubmission(selectedSubmission.id, true, adminNotes)}
                    disabled={processing === selectedSubmission.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Process
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLSubmissionReview;