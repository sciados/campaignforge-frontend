"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  ArrowLeft,
  Download,
  ExternalLink,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Sparkles,
  Loader2,
  Wand2,
  Copy,
} from "lucide-react";
import { useApi } from "@/lib/api";
import Image from "next/image";
import MockupTemplateSelector from "@/components/mockups/MockupTemplateSelector";

interface ImageContent {
  content_id: string;
  campaign_id: string;
  campaign_title?: string;
  content_title: string;
  content_body: string; // R2 URL
  content_metadata: {
    provider?: string;
    cost?: number;
    image_dimensions?: string;
    image_type?: string;
    style?: string;
    storage_location?: string;
    r2_uploaded?: boolean;
    generated_at?: string;
    r2_path?: string;
  };
  created_at: string;
}

export default function ImagesGalleryPage() {
  const router = useRouter();
  const api = useApi();

  const [images, setImages] = useState<ImageContent[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "campaign" | "cost">("date");
  const [mockupSelectorOpen, setMockupSelectorOpen] = useState(false);
  const [selectedImageForMockup, setSelectedImageForMockup] = useState<ImageContent | null>(null);
  const [generatingVariation, setGeneratingVariation] = useState<string | null>(null);

  // Load all campaigns and their images
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all campaigns
        const campaignsResponse = await api.get("/api/campaigns/?limit=100");
        const campaignsList = campaignsResponse?.campaigns || [];
        setCampaigns(campaignsList);

        // Get images from all campaigns
        const allImages: ImageContent[] = [];

        for (const campaign of campaignsList) {
          try {
            const contentResponse = await api.getGeneratedContent(campaign.id);

            // Parse response
            let contentList: any[] = [];
            if (contentResponse?.content && Array.isArray(contentResponse.content)) {
              contentList = contentResponse.content;
            } else if (Array.isArray(contentResponse)) {
              contentList = contentResponse;
            }

            // Filter for images only
            const imageContent = contentList
              .filter((item: any) => item.content_type === 'image')
              .map((item: any) => ({
                content_id: item.id || item.content_id,
                campaign_id: campaign.id,
                campaign_title: campaign.title || campaign.product_name,
                content_title: item.content_title || item.title,
                content_body: item.content_body || item.body,
                content_metadata: item.content_metadata || item.metadata || {},
                created_at: item.created_at,
              }));

            allImages.push(...imageContent);
          } catch (err) {
            console.error(`Failed to load content for campaign ${campaign.id}:`, err);
          }
        }

        setImages(allImages);
      } catch (err) {
        console.error("Failed to load images:", err);
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle opening mockup selector
  const handleCreateMockup = (e: React.MouseEvent, image: ImageContent) => {
    e.stopPropagation();
    setSelectedImageForMockup(image);
    setMockupSelectorOpen(true);
  };

  // Handle mockup generated successfully
  const handleMockupGenerated = (mockupUrl: string, cost: number) => {
    console.log('Mockup generated:', mockupUrl, 'Cost:', cost);
    // Optionally refresh images or show success message
    setMockupSelectorOpen(false);
    setSelectedImageForMockup(null);
  };

  // Handle creating variation
  const handleCreateVariation = async (e: React.MouseEvent, image: ImageContent) => {
    e.stopPropagation();

    setGeneratingVariation(image.content_id);

    try {
      const response = await api.post('/api/content/variations/generate', {
        source_image_url: image.content_body,
        variation_strength: 0.3,  // Subtle variation
        provider: 'dall-e'
      });

      if (response.data.success) {
        console.log('Variation generated:', response.data.variation_url);
        // Refresh images to show new variation
        window.location.reload();
      } else {
        setError('Failed to generate variation');
      }
    } catch (err) {
      console.error('Variation error:', err);
      setError('Failed to generate variation');
    } finally {
      setGeneratingVariation(null);
    }
  };

  // Filter and sort images
  const filteredImages = images
    .filter((img) => {
      // Campaign filter
      if (selectedCampaign !== "all" && img.campaign_id !== selectedCampaign) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          img.content_title?.toLowerCase().includes(query) ||
          img.campaign_title?.toLowerCase().includes(query) ||
          img.content_metadata?.image_type?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "campaign":
          return (a.campaign_title || "").localeCompare(b.campaign_title || "");
        case "cost":
          return (b.content_metadata?.cost || 0) - (a.content_metadata?.cost || 0);
        default:
          return 0;
      }
    });

  const totalCost = images.reduce((sum, img) => sum + (img.content_metadata?.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <ImageIcon className="h-6 w-6 text-purple-600" />
                <span>Image Gallery</span>
              </h1>
              <p className="text-gray-600">
                {images.length} images • ${totalCost.toFixed(4)} total cost
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Campaign filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title || campaign.product_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="campaign">Sort by Campaign</option>
                <option value="cost">Sort by Cost</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.content_id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/campaigns/${image.campaign_id}/content/${image.content_id}`)}
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {image.content_body ? (
                    // Use regular img tag to bypass Next.js Image optimization issues
                    <img
                      src={image.content_body}
                      alt={image.content_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image load error:", image.content_body);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  {/* R2 Status Badge */}
                  {image.content_metadata?.r2_uploaded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>R2</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {image.content_title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {image.campaign_title}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {image.content_metadata?.provider && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Sparkles className="h-3 w-3" />
                        <span className="capitalize">{image.content_metadata.provider}</span>
                      </div>
                    )}
                    {image.content_metadata?.cost !== undefined && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <DollarSign className="h-3 w-3" />
                        <span>${image.content_metadata.cost.toFixed(4)}</span>
                      </div>
                    )}
                    {image.content_metadata?.image_dimensions && (
                      <div className="text-gray-600 col-span-2">
                        {image.content_metadata.image_dimensions}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleCreateVariation(e, image)}
                        disabled={generatingVariation === image.content_id}
                        className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                        title="Create Unique Variation"
                      >
                        {generatingVariation === image.content_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleCreateMockup(e, image)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Create Professional Mockup"
                      >
                        <Wand2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(image.content_body, '_blank');
                        }}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCampaign !== "all"
                ? "Try adjusting your filters"
                : "Generate your first image to get started"}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Mockup Template Selector Modal */}
      {mockupSelectorOpen && selectedImageForMockup && (
        <MockupTemplateSelector
          imageUrl={selectedImageForMockup.content_body}
          onMockupGenerated={handleMockupGenerated}
          onClose={() => {
            setMockupSelectorOpen(false);
            setSelectedImageForMockup(null);
          }}
        />
      )}
    </div>
  );
}
