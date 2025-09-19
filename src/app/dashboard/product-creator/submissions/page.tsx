// src/app/dashboard/product-creator/submissions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Filter,
  Search
} from "lucide-react";

interface URLSubmission {
  id: string;
  product_name: string;
  category: string;
  urls: string[];
  status: "pending_review" | "in_progress" | "completed" | "rejected";
  submitted_at: string;
  processed_at?: string;
  notes?: string;
  feedback?: string;
}

const mockSubmissions: URLSubmission[] = [
  {
    id: "sub_001",
    product_name: "FitTracker Pro",
    category: "Health & Fitness",
    urls: ["https://fittracker.com/sales", "https://fittracker.com/pro"],
    status: "completed",
    submitted_at: "2024-01-15T10:30:00Z",
    processed_at: "2024-01-16T14:20:00Z",
    notes: "Main product launch page",
    feedback: "Analysis completed successfully. High-converting sales page detected."
  },
  {
    id: "sub_002",
    product_name: "Marketing Mastery Course",
    category: "Education",
    urls: ["https://marketingcourse.com/landing"],
    status: "in_progress",
    submitted_at: "2024-01-18T09:15:00Z",
    notes: "Educational course landing page"
  },
  {
    id: "sub_003",
    product_name: "Tech Gadget X",
    category: "Technology",
    urls: ["https://techgadget.com/buy"],
    status: "pending_review",
    submitted_at: "2024-01-20T16:45:00Z",
    notes: "New tech product release"
  }
];

const URLSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<URLSubmission[]>(mockSubmissions);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "pending_review":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "pending_review":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === "all" || submission.status === filterStatus;
    const matchesSearch = submission.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">URL Submissions</h1>
          <p className="text-gray-600 mt-2">Track and manage your submitted product URLs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by product name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{submission.product_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{submission.category}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      {submission.processed_at && (
                        <>
                          <span>•</span>
                          <span>Processed: {new Date(submission.processed_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        {submission.urls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="break-all">{url}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {submission.notes && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {submission.notes}
                      </p>
                    )}

                    {submission.feedback && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Feedback:</span> {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Submit your first product URLs to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLSubmissionsPage;