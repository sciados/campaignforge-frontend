// src/app/dashboard/creator/content-studio/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Camera,
  Edit3,
  Download,
  Share2,
  Play,
  Pause,
  Settings,
  FileText,
  Image,
  Music,
  Wand2,
  Upload,
  Eye,
  Clock
} from "lucide-react";

interface ContentProject {
  id: string;
  title: string;
  type: "video" | "image" | "audio" | "text";
  status: "draft" | "editing" | "ready" | "published";
  thumbnail?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
  platform_targets: string[];
  ai_generated: boolean;
}

const mockProjects: ContentProject[] = [
  {
    id: "proj_001",
    title: "Morning Routine Optimization",
    type: "video",
    status: "ready",
    thumbnail: "/api/placeholder/300/200",
    duration: 180,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-21T15:30:00Z",
    platform_targets: ["TikTok", "Instagram", "YouTube"],
    ai_generated: true
  },
  {
    id: "proj_002",
    title: "Productivity Tips Carousel",
    type: "image",
    status: "editing",
    created_at: "2024-01-19T14:20:00Z",
    updated_at: "2024-01-21T11:15:00Z",
    platform_targets: ["Instagram", "LinkedIn"],
    ai_generated: false
  },
  {
    id: "proj_003",
    title: "Tech Review Script",
    type: "text",
    status: "draft",
    created_at: "2024-01-21T09:45:00Z",
    updated_at: "2024-01-21T09:45:00Z",
    platform_targets: ["YouTube"],
    ai_generated: true
  }
];

const ContentStudioPage: React.FC = () => {
  const [projects, setProjects] = useState<ContentProject[]>(mockProjects);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-gray-600 bg-gray-100";
      case "editing":
        return "text-yellow-600 bg-yellow-100";
      case "ready":
        return "text-green-600 bg-green-100";
      case "published":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "youtube":
        return "bg-red-600 text-white";
      case "linkedin":
        return "bg-blue-700 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesType = filterType === "all" || project.type === filterType;
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Edit3 className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
            </div>
            <p className="text-gray-600">Create, edit, and manage your content across all platforms</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Wand2 className="w-4 h-4" />
              AI Generate
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="editing">Editing</option>
                <option value="ready">Ready</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Thumbnail/Preview */}
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    {getTypeIcon(project.type)}
                    <span className="text-sm font-medium capitalize">{project.type} Content</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Duration badge for videos */}
                {project.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(project.duration)}
                  </div>
                )}

                {/* AI Generated badge */}
                {project.ai_generated && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    AI
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {/* Platform targets */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.platform_targets.map((platform, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(platform)}`}
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content projects found</h3>
            <p className="text-gray-600 mb-6">
              Create your first content project or adjust your filters
            </p>
            <div className="flex justify-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudioPage;