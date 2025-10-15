// src/components/campaigns/ProductImagesTab.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useApi } from '@/lib/api';
import { Image as ImageIcon, Trash2, Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface ProductImagesTabProps {
  campaignId: string;
  salesPageUrl?: string;
}

interface ScrapedImage {
  id: string;
  cdn_url: string;
  width: number;
  height: number;
  file_size: number;
  format: string;
  quality_score: number;
  is_hero: boolean;
  is_product: boolean;
  is_lifestyle: boolean;
  times_used: number;
  alt_text?: string;
  is_generated?: boolean; // Flag to identify AI-generated vs scraped images
}

export default function ProductImagesTab({ campaignId, salesPageUrl }: ProductImagesTabProps) {
  const api = useApi();
  const [images, setImages] = useState<ScrapedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hero' | 'product' | 'lifestyle'>('all');

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both scraped images AND generated images
      const [scrapedResponse, generatedContentResponse] = await Promise.all([
        api.getScrapedImages(campaignId, filter === 'all' ? undefined : filter),
        api.getContentList(campaignId, false)
      ]);

      let allImages: ScrapedImage[] = [];

      // Add scraped images
      if (scrapedResponse.success && scrapedResponse.images) {
        allImages = scrapedResponse.images;
      }

      // Add generated images (filter for image content type)
      if (generatedContentResponse) {
        const generatedImages = (generatedContentResponse.items || [])
          .filter((item: any) => item.content_type === 'image' && (item.body || item.generated_content?.image_url))
          .map((item: any) => ({
            id: item.id,
            cdn_url: item.body || item.generated_content?.image_url,
            width: 1024, // Default dimensions for generated images
            height: 1024,
            file_size: 0, // Unknown for generated images
            format: 'png',
            quality_score: 100, // Generated images are high quality
            is_hero: false,
            is_product: true,
            is_lifestyle: false,
            times_used: 0,
            alt_text: item.title || 'AI-generated marketing image',
            is_generated: true // Flag to identify generated vs scraped
          }));

        allImages = [...allImages, ...generatedImages];
      }

      setImages(allImages);
    } catch (err: any) {
      console.error('Failed to load images:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [campaignId, filter, api]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleScrape = async () => {
    if (!salesPageUrl) {
      setError('No sales page URL found for this campaign');
      return;
    }

    try {
      setScraping(true);
      setError(null);

      const response = await api.scrapeProductImages({
        campaign_id: campaignId,
        sales_page_url: salesPageUrl,
        max_images: 10
      });

      if (response.success) {
        // Show success message
        alert(`Successfully scraped ${response.images_saved} images!`);
        // Reload images
        await loadImages();
      } else {
        setError(response.error || 'Failed to scrape images');
      }
    } catch (err: any) {
      console.error('Scraping failed:', err);
      setError(err.message || 'Failed to scrape images');
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;

    try {
      await api.deleteScrapedImage(campaignId, imageId);
      // Reload images after delete
      await loadImages();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Images</h2>
          <p className="text-gray-600 mt-1">
            AI-generated and scraped product images for your campaign
          </p>
        </div>

        <button
          onClick={handleScrape}
          disabled={scraping || !salesPageUrl}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            scraping || !salesPageUrl
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {scraping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {images.length > 0 ? 'Re-scrape Images' : 'Extract Images'}
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* No Sales Page URL Warning */}
      {!salesPageUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">No Sales Page URL</p>
            <p className="text-yellow-700 text-sm">
              Add a sales page URL to your campaign to extract product images.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'hero', 'product', 'lifestyle'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-4" />
          <p className="text-gray-600">Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-900 font-medium mb-2">No Product Images</p>
          <p className="text-gray-600 mb-4">
            {salesPageUrl
              ? 'Click "Extract Images" to scrape product images from your sales page.'
              : 'Add a sales page URL to extract product images.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
              {/* Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                <Image
                  src={img.cdn_url}
                  alt={img.alt_text || 'Product image'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-3">
                {/* Quality Score */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Quality</span>
                  <span className={`text-lg font-bold ${
                    img.quality_score >= 80 ? 'text-green-600' :
                    img.quality_score >= 60 ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {img.quality_score.toFixed(0)}
                  </span>
                </div>

                {/* Dimensions */}
                <div className="text-xs text-gray-500">
                  {img.width} × {img.height} • {(img.file_size / 1024).toFixed(0)} KB
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {img.is_generated && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                      AI Generated
                    </span>
                  )}
                  {img.is_hero && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      Hero
                    </span>
                  )}
                  {img.is_product && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Product
                    </span>
                  )}
                  {img.is_lifestyle && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Lifestyle
                    </span>
                  )}
                </div>

                {/* Usage */}
                {img.times_used > 0 && (
                  <div className="text-xs text-gray-500">
                    Used {img.times_used} time{img.times_used !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={img.cdn_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 text-center transition-colors"
                  >
                    <Download className="inline w-3 h-3 mr-1" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="inline w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {!loading && images.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {images.length} image{images.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
