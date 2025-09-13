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
    const apiUrl = `${backendUrl}/api/campaigns`;
    
    // Production: Forward to FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
    });
    
    if (!response.ok) {
      // If backend is not available, provide fallback mock data for development
      console.warn(`Backend not available (${response.status}), using mock data`);
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

      const fallbackResponse = {
        success: true,
        campaigns: mockCampaigns,
        total: mockCampaigns.length,
        message: 'Mock campaigns loaded (backend unavailable)'
      };
      
      return NextResponse.json(fallbackResponse);
    }
    
    const backendData = await response.json();
    
    // Transform backend response to match frontend expectations
    const transformedResponse = {
      success: true,
      campaigns: backendData.data?.campaigns || backendData.campaigns || [],
      total: backendData.data?.total || backendData.total || 0,
      message: 'Campaigns loaded successfully'
    };
    
    return NextResponse.json(transformedResponse);
    
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

export async function POST(request: NextRequest) {
  try {
    // Get the request body and authorization header
    const body = await request.json();
    const authorization = request.headers.get('authorization');
    
    // Backend URL - adjust this to match your FastAPI server  
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const apiUrl = `${backendUrl}/api/campaigns`;
    
    // Forward to FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      // If backend is not available, provide a fallback response
      console.warn(`Backend not available for campaign creation (${response.status})`);
      
      // Create a mock campaign response for development
      const mockCampaign = {
        id: `campaign_${Date.now()}`,
        name: body.name || 'New Campaign',
        description: body.description || '',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock_user',
        intelligence_count: 0
      };

      const fallbackResponse = {
        success: true,
        data: {
          campaign: mockCampaign
        },
        message: 'Campaign created successfully (mock)'
      };
      
      return NextResponse.json(fallbackResponse, { status: 201 });
    }
    
    const backendData = await response.json();
    
    // Transform backend response to match frontend expectations
    const transformedResponse = {
      success: true,
      data: backendData.data || { campaign: backendData },
      message: 'Campaign created successfully'
    };
    
    return NextResponse.json(transformedResponse, { status: 201 });
    
  } catch (error) {
    console.error('Campaign creation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create campaign'
      },
      { status: 500 }
    );
  }
}