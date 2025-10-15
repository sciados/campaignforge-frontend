# Product Image Scraper - Frontend Integration Guide

## Overview

The product image scraper API is **live and working**, but there's currently **no frontend UI** to trigger it. This guide explains where and how to integrate it into the campaign workflow.

---

## Current Campaign Workflow

```
1. Create Campaign
   ↓
2. Add Inputs (Sales Page URL + other sources)
   /campaigns/{id}/inputs
   ↓
3. Analyze Intelligence
   POST /api/intelligence/analyze (with sales_page_url)
   ↓
4. Generate Content
   /campaigns/{id}/generate
```

---

## Proposed Integration Points

### **Option 1: Automatic (Recommended) ✅**

**When:** During intelligence analysis (Step 3)
**Where:** `/campaigns/{id}/inputs` - After user clicks "Analyze" button
**Why:** Seamless, automatic, no extra user action needed

**Flow:**
```
User clicks "Analyze" button
  ↓
Frontend calls: POST /api/intelligence/analyze
  {
    "campaign_id": "abc-123",
    "sales_page_url": "https://example.com/product",
    "analyze_content": true,
    "analyze_images": true  // NEW PARAMETER
  }
  ↓
Backend (in intelligence service):
  1. Analyzes sales page intelligence (existing)
  2. Triggers product image scraper (new)
     POST /api/intelligence/product-images/scrape
  ↓
Result:
  - Intelligence extracted ✓
  - Product images scraped & saved to R2/database ✓
  - User sees images available in content generation
```

**Implementation:**
```typescript
// src/app/campaigns/[id]/inputs/page.tsx

const handleAnalyze = async () => {
  try {
    setAnalyzing(true);

    const response = await api.post('/api/intelligence/analyze', {
      campaign_id: params.id,
      inputs: validInputs,
      analyze_images: true,  // NEW: Enable image scraping
    });

    // Backend automatically scrapes images during analysis
    // No additional frontend code needed!

    startCompletionPolling(response.analysis_id);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

---

### **Option 2: Manual Button (Alternative)**

**When:** After analysis complete, before content generation
**Where:** `/campaigns/{id}/generate` - New "Extract Product Images" button
**Why:** Gives user control, can re-scrape if needed

**Flow:**
```
User completes intelligence analysis
  ↓
User navigates to /campaigns/{id}/generate
  ↓
User sees "Extract Product Images" button
  ↓
User clicks button
  ↓
Frontend calls: POST /api/intelligence/product-images/scrape
  {
    "campaign_id": "abc-123",
    "sales_page_url": "https://example.com/product",
    "max_images": 10
  }
  ↓
Backend scrapes images → Saves to R2/database
  ↓
Frontend shows image gallery with quality scores
  ↓
User selects images to use in content generation
```

**Implementation:**
```typescript
// src/app/campaigns/[id]/generate/page.tsx

import { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/api';

export default function ContentGenerationPage({ params }) {
  const api = useApi();
  const [scrapingImages, setScrapingImages] = useState(false);
  const [scrapedImages, setScrapedImages] = useState([]);
  const [campaign, setCampaign] = useState(null);

  const handleScrapeImages = async () => {
    try {
      setScrapingImages(true);

      const response = await api.post('/api/intelligence/product-images/scrape', {
        campaign_id: params.id,
        sales_page_url: campaign.salespage_url,
        max_images: 10
      });

      if (response.success) {
        setScrapedImages(response.images);
        // Show success message
        alert(`Successfully scraped ${response.images_saved} images!`);
      }
    } catch (error) {
      console.error('Image scraping failed:', error);
      alert('Failed to scrape images');
    } finally {
      setScrapingImages(false);
    }
  };

  return (
    <div>
      {/* Existing content generation UI */}

      {/* NEW: Product Images Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Product Images</h3>

        {scrapedImages.length === 0 ? (
          <button
            onClick={handleScrapeImages}
            disabled={scrapingImages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {scrapingImages ? (
              <>
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                Extracting Images...
              </>
            ) : (
              <>
                <ImageIcon className="inline w-4 h-4 mr-2" />
                Extract Product Images
              </>
            )}
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {scrapedImages.map(img => (
              <div key={img.r2_path} className="border rounded-lg p-2">
                <img src={img.url} alt="Product" className="w-full h-32 object-cover rounded" />
                <div className="mt-2 text-xs">
                  <span className="font-semibold">Quality: {img.metadata.quality_score.toFixed(1)}</span>
                  <div className="flex gap-1 mt-1">
                    {img.metadata.is_hero && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Hero</span>}
                    {img.metadata.is_product && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Product</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing content generation forms */}
    </div>
  );
}
```

---

### **Option 3: Campaign Detail Page (Additional)**

**When:** Anytime after campaign creation
**Where:** `/campaigns/{id}` - New "Product Images" tab
**Why:** Central management, can view/delete/re-scrape images

**Implementation:**
```typescript
// src/app/campaigns/[id]/page.tsx

<div className="tabs">
  <button onClick={() => setActiveTab('overview')}>Overview</button>
  <button onClick={() => setActiveTab('content')}>Content</button>
  <button onClick={() => setActiveTab('images')}>Product Images</button> {/* NEW */}
  <button onClick={() => setActiveTab('settings')}>Settings</button>
</div>

{activeTab === 'images' && (
  <ProductImagesTab campaignId={params.id} salesPageUrl={campaign.salespage_url} />
)}
```

---

## API Integration

### 1. Add to API Client

```typescript
// src/lib/api.ts

export class Api {
  // ... existing methods

  /**
   * Scrape product images from sales page
   */
  async scrapeProductImages(data: {
    campaign_id: string;
    sales_page_url: string;
    max_images?: number;
  }) {
    return this.post('/api/intelligence/product-images/scrape', data);
  }

  /**
   * Get scraped images for campaign
   */
  async getScrapedImages(campaignId: string, imageType?: 'hero' | 'product' | 'lifestyle') {
    const params = imageType ? `?image_type=${imageType}` : '';
    return this.get(`/api/intelligence/product-images/${campaignId}${params}`);
  }

  /**
   * Delete scraped image
   */
  async deleteScrapedImage(campaignId: string, imageId: string) {
    return this.delete(`/api/intelligence/product-images/${campaignId}/${imageId}`);
  }

  /**
   * Analyze images on page (preview without saving)
   */
  async analyzeProductImagesOnPage(url: string) {
    return this.post('/api/intelligence/product-images/analyze-url', { url });
  }
}
```

---

## Component: ProductImagesTab

Create a new component for managing scraped images:

```typescript
// src/components/campaigns/ProductImagesTab.tsx

import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import { Image as ImageIcon, Trash2, Download, RefreshCw } from 'lucide-react';

interface ProductImagesTabProps {
  campaignId: string;
  salesPageUrl?: string;
}

export default function ProductImagesTab({ campaignId, salesPageUrl }: ProductImagesTabProps) {
  const api = useApi();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [filter, setFilter] = useState<'all' | 'hero' | 'product' | 'lifestyle'>('all');

  useEffect(() => {
    loadImages();
  }, [campaignId, filter]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const imageType = filter === 'all' ? undefined : filter;
      const response = await api.getScrapedImages(campaignId, imageType);
      setImages(response.images || []);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!salesPageUrl) {
      alert('No sales page URL found for this campaign');
      return;
    }

    try {
      setScraping(true);
      const response = await api.scrapeProductImages({
        campaign_id: campaignId,
        sales_page_url: salesPageUrl,
        max_images: 10
      });

      if (response.success) {
        alert(`Successfully scraped ${response.images_saved} images!`);
        loadImages(); // Reload to show new images
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      alert('Failed to scrape images');
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      await api.deleteScrapedImage(campaignId, imageId);
      loadImages(); // Reload after delete
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Images</h2>
          <p className="text-gray-600">Images extracted from your sales page</p>
        </div>

        <button
          onClick={handleScrape}
          disabled={scraping || !salesPageUrl}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {scraping ? (
            <>
              <RefreshCw className="inline w-4 h-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <ImageIcon className="inline w-4 h-4 mr-2" />
              {images.length > 0 ? 'Re-scrape Images' : 'Extract Images'}
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'hero', 'product', 'lifestyle'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-lg ${
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
        <div className="text-center py-12">Loading images...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            {salesPageUrl
              ? 'No images extracted yet. Click "Extract Images" to get started.'
              : 'Add a sales page URL to extract product images.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img: any) => (
            <div key={img.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={img.cdn_url}
                  alt={img.alt_text || 'Product image'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-2">
                {/* Quality Score */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quality</span>
                  <span className="text-lg font-bold text-purple-600">
                    {img.quality_score.toFixed(0)}
                  </span>
                </div>

                {/* Dimensions */}
                <div className="text-xs text-gray-500">
                  {img.width} × {img.height} • {(img.file_size / 1024).toFixed(0)} KB
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {img.is_hero && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      Hero
                    </span>
                  )}
                  {img.is_product && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Product
                    </span>
                  )}
                  {img.is_lifestyle && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Lifestyle
                    </span>
                  )}
                </div>

                {/* Usage */}
                {img.times_used > 0 && (
                  <div className="text-xs text-gray-500">
                    Used {img.times_used} times
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={img.cdn_url}
                    download
                    className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 text-center"
                  >
                    <Download className="inline w-3 h-3 mr-1" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                  >
                    <Trash2 className="inline w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Recommended Implementation Plan

### **Phase 1: Automatic Scraping (Week 1) ✅ RECOMMENDED**

1. Update intelligence analysis endpoint to include image scraping
2. Modify backend `/api/intelligence/analyze` to automatically trigger scraper
3. No frontend changes needed (works automatically)
4. Users get images without extra action

### **Phase 2: Image Gallery (Week 2)**

1. Create `ProductImagesTab` component
2. Add "Product Images" tab to campaign detail page
3. Users can view, download, delete scraped images
4. Show quality scores and image classifications

### **Phase 3: Content Generation Integration (Week 3)**

1. Add image picker to content generation forms
2. Allow users to select scraped images for:
   - Email headers
   - Social media posts
   - Ad creative backgrounds
3. Integrate with composite image system

### **Phase 4: Advanced Features (Week 4)**

1. Image preview before content generation
2. Image editing/cropping tools
3. Bulk operations (delete multiple, download all)
4. A/B testing with different product images

---

## Backend Status

✅ **All backend endpoints are LIVE and working:**

- `POST /api/intelligence/product-images/scrape` - Scrape & save images
- `GET /api/intelligence/product-images/{campaign_id}` - Fetch images from database
- `DELETE /api/intelligence/product-images/{campaign_id}/{image_id}` - Delete image
- `POST /api/intelligence/product-images/analyze-url` - Preview images

✅ **Database persistence complete:**
- Images saved to Cloudflare R2 storage
- Metadata saved to `scraped_images` table
- Foreign key relationships with campaigns/users
- Quality scoring and classification

✅ **Ready for frontend integration immediately!**

---

## Summary

**Where to trigger scraping:**
1. **Automatically** during intelligence analysis (recommended)
2. **Manually** via button on content generation page
3. **Centrally** via new Product Images tab on campaign detail page

**Next step:** Implement automatic scraping (Phase 1) for seamless user experience.

---

**Questions? Check:**
- `DATABASE_PERSISTENCE_FLOW.md` - Complete technical flow
- `PRODUCT_IMAGE_SCRAPER_GUIDE.md` - API details
- `COMPLETE_IMAGE_WORKFLOW.md` - End-to-end workflow
