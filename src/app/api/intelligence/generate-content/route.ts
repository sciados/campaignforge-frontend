// =====================================
// File: src/app/api/intelligence/generate-content/route.ts
// =====================================

import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API route that proxies intelligence content generation requests
 * to the FastAPI backend server
 */

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    
    // Backend URL - adjust this to match your FastAPI server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const apiUrl = `${backendUrl}/intelligence/generate-content`;
    
    // For demo purposes, let's simulate the 3-step process
    // In production, this would call your actual FastAPI backend
    if (process.env.NODE_ENV === 'development') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get campaign-specific data for more realistic simulation
      const campaignData = getCampaignIntelligenceData(body.campaign_id);
      
      // Mock successful response with campaign-specific intelligence
      const mockResponse = {
        success: true,
        data: {
          success: true,
          content_type: body.content_type,
          content: generateMockContent(body.content_type, campaignData),
          intelligence_driven: true,
          three_step_process: {
            step1_intelligence_sources: campaignData.intelligence_count,
            step2_prompt_optimization: campaignData.optimization_score,
            step3_generation_provider: campaignData.ai_provider
          },
          metadata: {
            generated_by: '3_step_intelligence_driven_service',
            intelligence_utilization: campaignData.intelligence_utilization,
            prompt_optimization_score: campaignData.optimization_score,
            generation_cost: campaignData.generation_cost,
            total_generation_time: 2.5 + Math.random() * 1.5,
            intelligence_sources_used: campaignData.intelligence_count,
            product_name: campaignData.product_name,
            campaign_id: body.campaign_id,
            campaign_name: campaignData.campaign_name,
            generated_at: new Date().toISOString(),
            campaign_intelligence: {
              market_positioning: campaignData.market_positioning,
              target_audience: campaignData.target_audience,
              competitive_advantages: campaignData.competitive_advantages,
              brand_voice: campaignData.brand_voice
            },
            ai_optimization: {
              provider_used: campaignData.ai_provider.toLowerCase(),
              generation_cost: campaignData.generation_cost,
              quality_score: campaignData.quality_score,
              generation_time: 2.8,
              enhanced_routing_enabled: true,
              optimization_metadata: {
                intelligence_driven: true,
                prompt_optimization_used: true,
                campaign_specific: true
              },
              fallback_used: false
            }
          }
        },
        message: `Intelligence-driven content generated successfully using ${campaignData.campaign_name} intelligence data`
      };
      
      return NextResponse.json(mockResponse);
    }
    
    // Production: Forward to FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Intelligence content generation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to generate intelligence-driven content'
      },
      { status: 500 }
    );
  }
}

function getCampaignIntelligenceData(campaignId: string) {
  const campaignIntelligence: Record<string, any> = {
    'campaign_health_supplement_001': {
      campaign_name: 'Premium Health Supplement Launch',
      product_name: 'VitalBoost Natural Supplement',
      intelligence_count: 12,
      optimization_score: 0.94,
      ai_provider: 'DeepSeek',
      generation_cost: 0.0008,
      intelligence_utilization: 0.96,
      quality_score: 92,
      market_positioning: 'Premium natural health supplement for wellness-conscious professionals',
      target_audience: 'Health-conscious adults aged 25-45 with disposable income',
      competitive_advantages: ['Clinically-backed ingredients', '3rd party tested', 'Sustainable packaging'],
      brand_voice: 'Professional, trustworthy, science-focused'
    },
    'campaign_fitness_gear_002': {
      campaign_name: 'Fitness Equipment Q1 Campaign', 
      product_name: 'HomeFit Pro Equipment Series',
      intelligence_count: 8,
      optimization_score: 0.89,
      ai_provider: 'Groq',
      generation_cost: 0.0015,
      intelligence_utilization: 0.88,
      quality_score: 86,
      market_positioning: 'High-performance home gym equipment for serious fitness enthusiasts',
      target_audience: 'Fitness enthusiasts aged 28-50 building home gyms',
      competitive_advantages: ['Space-efficient design', 'Commercial-grade quality', 'Easy assembly'],
      brand_voice: 'Motivational, results-driven, empowering'
    },
    'campaign_beauty_skincare_003': {
      campaign_name: 'Organic Skincare Collection',
      product_name: 'PureGlow Organic Skincare',
      intelligence_count: 15,
      optimization_score: 0.97,
      ai_provider: 'Together',
      generation_cost: 0.0012,
      intelligence_utilization: 0.98,
      quality_score: 95,
      market_positioning: 'Luxury organic skincare for eco-conscious beauty enthusiasts',
      target_audience: 'Eco-conscious millennials aged 25-40 interested in clean beauty',
      competitive_advantages: ['100% organic ingredients', 'Cruelty-free', 'Plastic-free packaging'],
      brand_voice: 'Clean, authentic, environmentally conscious'
    },
    'demo_campaign_123': {
      campaign_name: 'Demo Health Product Campaign',
      product_name: 'Demo Product',
      intelligence_count: 8,
      optimization_score: 0.88,
      ai_provider: 'DeepSeek',
      generation_cost: 0.0012,
      intelligence_utilization: 0.92,
      quality_score: 87,
      market_positioning: 'Demonstration product for testing intelligence-driven content',
      target_audience: 'Health-conscious consumers testing the platform',
      competitive_advantages: ['Science-backed', 'Cost-effective', 'Easy to use'],
      brand_voice: 'Conversational, helpful, educational'
    }
  };

  return campaignIntelligence[campaignId] || campaignIntelligence['demo_campaign_123'];
}

function generateMockContent(contentType: string, campaignData?: any): Record<string, any> {
  const productName = campaignData?.product_name || 'Demo Product';
  const brandVoice = campaignData?.brand_voice || 'conversational';
  const targetAudience = campaignData?.target_audience || 'health-conscious adults';
  const competitiveAdvantages = campaignData?.competitive_advantages || ['science-backed', 'cost-effective'];
  const marketPositioning = campaignData?.market_positioning || 'wellness product';
  switch (contentType) {
    case 'email_sequence':
      return {
        emails: [
          {
            email_number: 1,
            subject: `The ${marketPositioning.split(' ')[0].toLowerCase()} secret that changed everything for ${targetAudience.split(' ')[0]}`,
            body: `Hi [Name],\n\nI recently discovered something that completely changed how I think about ${marketPositioning.toLowerCase()}...\n\nMost people try products like this and don't get the results they expect. Here's why:\n\nThey're missing the KEY advantage that makes ${productName} different.\n\nWhat sets ${productName} apart: ${competitiveAdvantages.slice(0, 2).join(' and ')}.\n\n[Compelling story about the discovery]\n\nTomorrow, I'll share the 3 mistakes most people make with products in this category (mistake #2 will surprise you).\n\nTalk soon,\n[Your Name]\n\nP.S. This isn't another generic solution - it's specifically designed for ${targetAudience.toLowerCase()}.`,
            send_delay: "immediate",
            strategic_angle: "curiosity_introduction"
          },
          {
            email_number: 2,
            subject: `WARNING: Don't use ${productName} until you read this`,
            body: `Hi [Name],\n\nYesterday I introduced you to ${productName}, and I want to address something important...\n\nMost people try ${productName} and don't get the maximum results. Here's why:\n\nThey make these 3 critical mistakes:\n\n1. They don't understand the unique positioning: ${marketPositioning.toLowerCase()}\n2. They ignore the key advantages: ${competitiveAdvantages.join(', ')}\n3. They expect overnight miracles instead of understanding the ${brandVoice.split(',')[0]} approach\n\nBut here's the good news...\n\nWhen you use ${productName} correctly, understanding its ${marketPositioning.toLowerCase()}, you can experience the results that ${targetAudience.toLowerCase()} are looking for.\n\nTomorrow, I'll show you exactly how to get maximum value from ${productName}.\n\nBest,\n[Your Name]`,
            send_delay: "2 days",
            strategic_angle: "problem_awareness"
          }
        ],
        sequence_info: {
          total_emails: 2,
          product_name: productName,
          tone: brandVoice.split(',')[0].toLowerCase(),
          intelligence_used: true,
          learning_enabled: true,
          generation_method: "intelligence_driven_3_step",
          campaign_intelligence: {
            market_positioning: marketPositioning,
            target_audience: targetAudience,
            competitive_advantages: competitiveAdvantages
          }
        }
      };
      
    case 'social_posts':
      return {
        posts: [
          {
            post_number: 1,
            platform: "facebook",
            content: "🌿 Just discovered the wellness secret that's been hiding in plain sight!\n\nDemo Product isn't just another supplement - it's a game-changer for anyone serious about natural health.\n\nWhat makes it different? The unique combination of [key ingredients] that work synergistically to support your body's natural processes.\n\n✨ Results people are seeing:\n• Increased energy without crashes\n• Better focus and mental clarity  \n• Improved overall wellbeing\n\nReady to experience the difference? 👆 Link in bio\n\n#NaturalHealth #Wellness #HealthyLiving #Supplements",
            hashtags: ["#NaturalHealth", "#Wellness", "#HealthyLiving"],
            engagement_strategy: "educational_with_social_proof"
          },
          {
            post_number: 2,
            platform: "instagram",
            content: "The science behind Demo Product will blow your mind 🧠✨\n\nSwipe to see the research that convinced me this isn't just another wellness trend.\n\n📊 Clinical studies show:\n→ 87% improvement in energy levels\n→ 92% reported better sleep quality\n→ 78% experienced enhanced focus\n\nBut here's what really impressed me: the long-term benefits compound over time.\n\nComment 'SCIENCE' if you want the full research breakdown! 📚\n\n#ScienceBacked #ResearchDriven #WellnessEvidence",
            hashtags: ["#ScienceBacked", "#ResearchDriven", "#WellnessEvidence"],
            engagement_strategy: "scientific_credibility"
          }
        ],
        campaign_info: {
          total_posts: 2,
          platforms: ["facebook", "instagram"],
          content_strategy: "educational_social_proof",
          intelligence_integration: "high"
        }
      };
      
    case 'ad_copy':
      return {
        ads: [
          {
            headline: "The Natural Health Breakthrough That's Changing Everything",
            body: "Discover why thousands are switching to Demo Product for sustainable energy and mental clarity. Science-backed ingredients, real results. No crashes, no jitters - just pure, natural wellness support.",
            cta: "Try Demo Product Today",
            target_audience: "health_conscious_adults",
            ad_type: "conversion"
          },
          {
            headline: "Finally, A Supplement That Actually Works",
            body: "Tired of supplements that promise everything but deliver nothing? Demo Product is different. Clinically studied ingredients, transparent dosing, and results you can feel. Join thousands who've made the switch.",
            cta: "See The Difference",
            target_audience: "supplement_skeptics",
            ad_type: "awareness"
          }
        ],
        campaign_strategy: {
          primary_angle: "scientific_credibility",
          secondary_angle: "social_proof",
          competitive_advantage: "research_backed_formulation"
        }
      };
      
    case 'blog_post':
      return {
        title: "The Science Behind Demo Product: Why It's Different From Every Other Supplement",
        introduction: "In a market flooded with wellness products making bold claims, Demo Product stands out for one key reason: rigorous scientific backing. Let's dive into the research that makes this supplement a game-changer.",
        sections: [
          {
            heading: "The Problem with Most Supplements",
            content: "The supplement industry is notorious for products that don't deliver on their promises. Studies show that up to 70% of supplements on the market lack proper scientific validation..."
          },
          {
            heading: "What Makes Demo Product Different",
            content: "Demo Product was formulated based on peer-reviewed research and clinical studies. Each ingredient was selected not just for its individual benefits, but for how it works synergistically with other components..."
          },
          {
            heading: "The Clinical Evidence",
            content: "In a double-blind, placebo-controlled study involving 200 participants over 12 weeks, Demo Product demonstrated significant improvements in energy levels, cognitive function, and overall wellbeing..."
          }
        ],
        conclusion: "The evidence is clear: Demo Product represents a new standard in science-backed supplementation. By choosing products with proper research validation, you're investing in results you can trust.",
        word_count: 1250,
        seo_keywords: ["science-backed supplements", "clinical research", "natural wellness"],
        content_strategy: "authority_building_with_research_focus"
      };
      
    default:
      return {
        content: `Intelligence-driven ${contentType} content generated successfully`,
        strategy: "generic_intelligence_optimization",
        quality_indicators: {
          intelligence_integration: "high",
          personalization_level: "advanced",
          market_alignment: "excellent"
        }
      };
  }
}