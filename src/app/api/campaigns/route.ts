// =====================================
// File: src/app/api/campaigns/route.ts
// =====================================

import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API route that handles campaign-related requests
 */

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authorization = request.headers.get('authorization');
    
    // Backend URL - adjust this to match your FastAPI server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const apiUrl = `${backendUrl}/campaigns`;
    
    // For demo purposes, let's provide mock campaigns
    // In production, this would call your actual FastAPI backend
    if (process.env.NODE_ENV === 'development') {
      // Mock campaigns data
      const mockCampaigns = [
        {
          id: 'campaign_health_supplement_001',
          name: 'Premium Health Supplement Launch',
          description: 'Natural health supplement targeting wellness-conscious consumers aged 25-45',
          intelligence_count: 12,
          created_at: '2024-01-15T10:00:00Z',
          status: 'active'
        },
        {
          id: 'campaign_fitness_gear_002', 
          name: 'Fitness Equipment Q1 Campaign',
          description: 'High-performance fitness equipment for home gym enthusiasts',
          intelligence_count: 8,
          created_at: '2024-02-01T14:30:00Z',
          status: 'active'
        },
        {
          id: 'campaign_beauty_skincare_003',
          name: 'Organic Skincare Collection',
          description: 'Premium organic skincare line targeting eco-conscious millennials',
          intelligence_count: 15,
          created_at: '2024-02-10T09:15:00Z',
          status: 'active'
        },
        {
          id: 'campaign_tech_gadget_004',
          name: 'Smart Home Automation',
          description: 'Cutting-edge smart home devices for tech-savvy households',
          intelligence_count: 6,
          created_at: '2024-03-01T16:45:00Z',
          status: 'draft'
        }
      ];

      const mockResponse = {
        success: true,
        campaigns: mockCampaigns,
        total: mockCampaigns.length,
        message: 'Campaigns loaded successfully'
      };
      
      return NextResponse.json(mockResponse);
    }
    
    // Production: Forward to FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Campaigns API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to load campaigns'
      },
      { status: 500 }
    );
  }
}