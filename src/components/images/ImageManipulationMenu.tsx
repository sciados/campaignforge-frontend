"use client";

import React, { useState } from 'react';
import { Wand2, Scissors, Sparkles, Download, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/api';
import MockupTemplateSelector from '@/components/mockups/MockupTemplateSelector';

interface ImageManipulationMenuProps {
  imageUrl: string;
  imageName?: string;
  onImageUpdated?: (newImageUrl: string, operation: string) => void;
}

export default function ImageManipulationMenu({
  imageUrl,
  imageName,
  onImageUpdated
}: ImageManipulationMenuProps) {
  const api = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [mockupModalOpen, setMockupModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/content/image-manipulation/remove-background', {
        image_url: imageUrl,
        provider: 'auto', // Let backend choose best provider
        size: 'auto'
      });

      if (response.success) {
        setProcessedImage(response.transparent_url);
        if (onImageUpdated) {
          onImageUpdated(response.transparent_url, 'background-removed');
        }
        alert(`Background removed successfully! Cost: $${response.cost?.toFixed(2) || '0.00'}`);
      } else {
        setError(response.error || 'Failed to remove background');
      }
    } catch (err: any) {
      console.error('Background removal error:', err);
      setError(err.message || 'Failed to remove background');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleMockupGenerated = (mockupUrl: string, cost: number) => {
    setProcessedImage(mockupUrl);
    if (onImageUpdated) {
      onImageUpdated(mockupUrl, 'mockup-generated');
    }
    alert(`Mockup generated successfully! Cost: $${cost.toFixed(2)}`);
    setMockupModalOpen(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedImage || imageUrl;
    link.download = imageName || 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="relative inline-block">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Wand2 className="w-4 h-4" />
          <span>Edit</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
              {/* Error Display */}
              {error && (
                <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-200">
                  {error}
                </div>
              )}

              {/* Menu Items */}
              <div className="py-2">
                {/* Remove Background */}
                <button
                  onClick={handleRemoveBackground}
                  disabled={loading}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <Scissors className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Remove Background</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Create transparent PNG (~$0.10-0.20)
                    </div>
                  </div>
                </button>

                {/* Generate Mockup */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setMockupModalOpen(true);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Generate Mockup</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Apply to bottle, box, or lifestyle scene
                    </div>
                  </div>
                </button>

                {/* Download (if processed) */}
                {processedImage && (
                  <>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">Download Result</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Save processed image
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Info Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  💡 Remove background first, then use in mockups for best results
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mockup Template Selector Modal */}
      {mockupModalOpen && (
        <MockupTemplateSelector
          imageUrl={processedImage || imageUrl}
          onMockupGenerated={handleMockupGenerated}
          onClose={() => setMockupModalOpen(false)}
        />
      )}
    </>
  );
}
