"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Edit3,
  Video,
  Copy,
  Download,
  Share2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { useApi } from "@/lib/api";
import Image from "next/image";

interface ContentDetailPageProps {
  params: {
    id: string;
    contentId: string;
  };
}

interface ContentDetail {
  content_id: string;
  content_type: string;
  title: string;
  body: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
  is_published: boolean;
  user_rating?: number;
  generation_method: string;
  content_status: string;
  generated_content?: any;
}

export default function ContentDetailPage({ params }: ContentDetailPageProps) {
  const router = useRouter();
  const api = useApi();

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [allContentOfType, setAllContentOfType] = useState<ContentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  // Content type configurations
  const contentTypeConfig = {
    email_sequence: {
      icon: Mail,
      label: "Email Sequence",
      color: "text-blue-600 bg-blue-50",
      description: "Multi-email marketing sequence"
    },
    social_post: {
      icon: MessageSquare,
      label: "Social Posts",
      color: "text-green-600 bg-green-50",
      description: "Social media content"
    },
    blog_post: {
      icon: FileText,
      label: "Blog Article",
      color: "text-purple-600 bg-purple-50",
      description: "Blog post content"
    },
    ad_copy: {
      icon: BarChart3,
      label: "Ad Copy",
      color: "text-orange-600 bg-orange-50",
      description: "Advertisement copy"
    },
    image: {
      icon: ImageIcon,
      label: "Marketing Image",
      color: "text-pink-600 bg-pink-50",
      description: "AI-generated marketing image"
    },
    video_script: {
      icon: Edit3,
      label: "Video Script",
      color: "text-indigo-600 bg-indigo-50",
      description: "Video content script"
    },
    short_video: {
      icon: Video,
      label: "Short Video",
      color: "text-red-600 bg-red-50",
      description: "Short form video content"
    }
  };

  const currentConfig = content?.content_type ?
    contentTypeConfig[content.content_type as keyof typeof contentTypeConfig] ||
    { icon: FileText, label: "Content", color: "text-gray-600 bg-gray-50", description: "Generated content" }
    : { icon: FileText, label: "Content", color: "text-gray-600 bg-gray-50", description: "Generated content" };

  // Load content details
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For now, we'll get the content from the campaign content list
        // and find the specific content item
        const contentResponse = await api.getGeneratedContent(params.id);
        console.log("Content response for detail:", contentResponse);

        let contentList: any[] = [];

        // Parse response (using same logic as campaign page)
        if (contentResponse?.content && Array.isArray(contentResponse.content)) {
          contentList = contentResponse.content;
        } else if (contentResponse?.success && contentResponse?.data?.content && Array.isArray(contentResponse.data.content)) {
          contentList = contentResponse.data.content;
        }

        // Find the specific content item
        const contentItem = contentList.find(item =>
          (item.id === params.contentId || item.content_id === params.contentId)
        );

        if (!contentItem) {
          setError("Content not found");
          return;
        }

        // Transform to our interface
        let bodyContent = contentItem.body || contentItem.content || contentItem.content_body;

        // Parse body if it's a JSON string
        if (typeof bodyContent === 'string') {
          try {
            bodyContent = JSON.parse(bodyContent);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }

        const contentDetail: ContentDetail = {
          content_id: contentItem.id || contentItem.content_id,
          content_type: contentItem.content_type,
          title: contentItem.title || contentItem.content_title,
          body: bodyContent,
          metadata: contentItem.metadata || contentItem.content_metadata,
          created_at: contentItem.created_at,
          updated_at: contentItem.updated_at,
          is_published: contentItem.is_published,
          user_rating: contentItem.user_rating,
          generation_method: contentItem.generation_method,
          content_status: contentItem.content_status,
          generated_content: contentItem.generated_content
        };

        setContent(contentDetail);

        // Get all content of the same type
        const allContentOfSameType = contentList
          .filter(item => item.content_type === contentDetail.content_type)
          .map((item: any) => ({
            content_id: item.id || item.content_id,
            content_type: item.content_type,
            title: item.title || item.content_title,
            body: item.body || item.content,
            metadata: item.metadata || item.content_metadata,
            created_at: item.created_at,
            updated_at: item.updated_at,
            is_published: item.is_published,
            user_rating: item.user_rating,
            generation_method: item.generation_method,
            content_status: item.content_status,
            generated_content: item.generated_content
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setAllContentOfType(allContentOfSameType);

      } catch (err) {
        console.error("Failed to load content:", err);
        setError("Failed to load content details");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [params.id, params.contentId, api]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const IconComponent = currentConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${currentConfig.color} rounded-lg flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6 ${currentConfig.color.split(' ')[0]}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
                <p className="text-gray-600">{currentConfig.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(content.created_at)}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {content.generation_method}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {content.content_status}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showRawData ? "Hide" : "Show"} Raw Data</span>
              </button>
              <button
                onClick={() => copyToClipboard(JSON.stringify(content.generated_content, null, 2))}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="space-y-6">
          {/* Email Sequence Specific Display */}
          {content.content_type === 'email_sequence' && (Array.isArray(content.body) || content.generated_content?.emails) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Sequence</h2>
              <div className="space-y-6">
                {(Array.isArray(content.body) ? content.body : content.generated_content.emails).map((email: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Email {email.email_number}</h3>
                      <span className="text-sm text-gray-500">{email.send_delay}</span>
                    </div>
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700">Subject:</label>
                      <p className="text-gray-900 font-medium">{email.subject}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700">Body:</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                          {email.body}
                        </pre>
                      </div>
                    </div>
                    {email.strategic_angle && (
                      <div className="text-xs text-gray-500">
                        Strategy: {email.strategic_angle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Copy Content Display */}
          {content.content_type === 'ad_copy' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ad Variations</h2>
              <div className="space-y-6">
                {(Array.isArray(content.body) ? content.body : content.generated_content?.ads || []).map((ad: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Variation {ad.variation_number || index + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 capitalize">{ad.platform || 'Google'}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500 capitalize">{ad.ad_format || 'Responsive'}</span>
                      </div>
                    </div>

                    {/* Headlines */}
                    {ad.headlines && ad.headlines.length > 0 && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700">Headlines:</label>
                        <div className="mt-2 space-y-1">
                          {ad.headlines.map((headline: string, hIndex: number) => (
                            <div key={hIndex} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-gray-900">{headline}</span>
                              <span className="text-xs text-gray-500">{headline.length}/30</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descriptions */}
                    {ad.descriptions && ad.descriptions.length > 0 && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700">Descriptions:</label>
                        <div className="mt-2 space-y-1">
                          {ad.descriptions.map((desc: string, dIndex: number) => (
                            <div key={dIndex} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <span className="text-gray-900">{desc}</span>
                              <span className="text-xs text-gray-500">{desc.length}/90</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Primary Text */}
                    {ad.primary_text && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700">Primary Text:</label>
                        <div className="mt-1 p-3 bg-purple-50 rounded-lg">
                          <p className="text-gray-900 text-sm">{ad.primary_text}</p>
                        </div>
                      </div>
                    )}

                    {/* Call to Action */}
                    {ad.call_to_action && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700">Call to Action:</label>
                        <div className="mt-1">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {ad.call_to_action}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Compliance Status */}
                    {ad.compliance_status && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          {ad.compliance_status.is_compliant ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-700">Compliant with platform limits</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-red-700">Non-compliant content detected</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Content Display */}
          {content.content_type === 'image' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Image</h2>
              {content.generated_content?.image_url ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    <Image
                      src={content.generated_content.image_url}
                      alt={content.title || "Generated marketing image"}
                      width={800}
                      height={600}
                      className="max-w-full h-auto rounded-lg shadow-sm"
                      onError={(e) => {
                        console.error("Failed to load image:", e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  {content.generated_content.prompt && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Prompt Used:</label>
                      <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                        {content.generated_content.prompt}
                      </p>
                    </div>
                  )}
                  {content.generated_content.dimensions && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dimensions:</label>
                      <p className="text-gray-800 mt-1">
                        {content.generated_content.dimensions.width} × {content.generated_content.dimensions.height}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Image not available</p>
                    <p className="text-gray-400 text-sm mt-1">The image may not have been generated successfully</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generic Content Display */}
          {content.content_type !== 'email_sequence' && content.content_type !== 'image' && content.content_type !== 'ad_copy' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {content.body}
                </pre>
              </div>
            </div>
          )}

          {/* Raw Data Display */}
          {showRawData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Data</h2>
              <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          {content.metadata && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Generator Used:</label>
                  <p className="text-gray-900">{content.metadata.generator_used || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Intelligence Sources:</label>
                  <p className="text-gray-900">{content.metadata.intelligence_sources_used || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Published:</label>
                  <p className="text-gray-900">{content.is_published ? 'Yes' : 'No'}</p>
                </div>
                {content.user_rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rating:</label>
                    <p className="text-gray-900">{content.user_rating}/5</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Content of This Type */}
          {allContentOfType.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                All {currentConfig.label} ({allContentOfType.length} items)
              </h2>
              <p className="text-gray-600 mb-4">
                All generated {currentConfig.label.toLowerCase()} content for this campaign:
              </p>
              <div className="space-y-3">
                {allContentOfType.map((item) => (
                  <div
                    key={item.content_id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                      item.content_id === content.content_id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => {
                      if (item.content_id !== content.content_id) {
                        router.push(`/campaigns/${params.id}/content/${item.content_id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {item.title}
                          </h3>
                          {item.content_id === content.content_id && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.content_status}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.content_id !== content.content_id && "Click to view"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}