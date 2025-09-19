// src/app/dashboard/business/leads/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  Filter,
  Download,
  Plus,
  Eye,
  Star,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  score: number;
  created_at: string;
  last_contacted?: string;
  value_estimate?: number;
  location?: string;
  notes?: string;
}

const mockLeads: Lead[] = [
  {
    id: "lead_001",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Solutions",
    position: "Marketing Director",
    source: "LinkedIn Campaign",
    status: "qualified",
    score: 92,
    created_at: "2024-01-20T10:30:00Z",
    last_contacted: "2024-01-21T14:20:00Z",
    value_estimate: 15000,
    location: "San Francisco, CA",
    notes: "Interested in enterprise package. Scheduled demo for next week."
  },
  {
    id: "lead_002",
    name: "Michael Chen",
    email: "m.chen@startupx.io",
    company: "StartupX",
    position: "CEO",
    source: "Website Form",
    status: "new",
    score: 85,
    created_at: "2024-01-21T09:15:00Z",
    value_estimate: 8500,
    location: "Austin, TX",
    notes: "Looking for marketing automation solution."
  },
  {
    id: "lead_003",
    name: "Emily Rodriguez",
    email: "emily.r@designstudio.com",
    phone: "+1 (555) 987-6543",
    company: "Creative Design Studio",
    position: "Owner",
    source: "Google Ads",
    status: "contacted",
    score: 78,
    created_at: "2024-01-19T16:45:00Z",
    last_contacted: "2024-01-20T11:30:00Z",
    value_estimate: 5200,
    location: "New York, NY"
  }
];

const LeadGenerationPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "contacted":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "qualified":
        return "text-green-600 bg-green-100 border-green-200";
      case "converted":
        return "text-purple-600 bg-purple-100 border-purple-200";
      case "lost":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Plus className="w-4 h-4" />;
      case "contacted":
        return <Mail className="w-4 h-4" />;
      case "qualified":
        return <CheckCircle className="w-4 h-4" />;
      case "converted":
        return <Star className="w-4 h-4" />;
      case "lost":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesSource = filterSource === "all" || lead.source === filterSource;
    return matchesStatus && matchesSource;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.score - a.score;
      case "created":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "value":
        return (b.value_estimate || 0) - (a.value_estimate || 0);
      default:
        return 0;
    }
  });

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value_estimate || 0), 0);
  const qualifiedLeads = leads.filter(lead => lead.status === "qualified" || lead.status === "converted").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Generation</h1>
            </div>
            <p className="text-gray-600">Track and manage your sales leads and prospects</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">{qualifiedLeads}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0}%
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Sources</option>
                <option value="Website Form">Website Form</option>
                <option value="LinkedIn Campaign">LinkedIn Campaign</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="score">Lead Score</option>
                <option value="created">Date Created</option>
                <option value="value">Estimated Value</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {sortedLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                        <span>{lead.company} {lead.position && `- ${lead.position}`}</span>
                      </div>
                    )}
                    {lead.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{lead.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                    {lead.value_estimate && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>${lead.value_estimate.toLocaleString()} estimated value</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Source: {lead.source}</span>
                    {lead.last_contacted && (
                      <span>Last contacted: {new Date(lead.last_contacted).toLocaleDateString()}</span>
                    )}
                  </div>

                  {lead.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{lead.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedLeads.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== "all" || filterSource !== "all"
                ? "Try adjusting your filters to see more leads"
                : "Start generating leads with your marketing campaigns"
              }
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Add Your First Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadGenerationPage;