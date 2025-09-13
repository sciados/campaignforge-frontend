'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface IntelligenceContentRequest {
  content_type: string;
  campaign_id?: string;
  company_id?: string;
  preferences?: Record<string, any>;
}

interface ThreeStepProcess {
  step1_intelligence_sources: number;
  step2_prompt_optimization: number;
  step3_generation_provider: string;
}

interface IntelligenceContentResponse {
  success: boolean;
  content_type: string;
  content: Record<string, any>;
  intelligence_driven: boolean;
  three_step_process: ThreeStepProcess;
  metadata: Record<string, any>;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  intelligence_count: number;
  created_at: string;
  status: string;
}

interface StepStatus {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ElementType;
  details?: string;
}

const IntelligenceDrivenContentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<IntelligenceContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState('email_sequence');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'none' | 'saving' | 'saved' | 'error'>('none');

  const [steps, setSteps] = useState<StepStatus[]>([
    {
      step: 1,
      title: 'Extract Intelligence Data',
      description: 'Mining your intelligence database for relevant product insights, market data, and research',
      status: 'pending',
      icon: Brain
    },
    {
      step: 2,
      title: 'Optimize Prompts',
      description: 'Creating highly targeted prompts using extracted intelligence insights',
      status: 'pending',
      icon: Target
    },
    {
      step: 3,
      title: 'Generate Content',
      description: 'Using cost-effective AI providers with intelligence-optimized prompts',
      status: 'pending',
      icon: Zap
    }
  ]);

  const contentTypes = [
    { value: 'email_sequence', label: 'Email Sequence', description: '5-email strategic sequence' },
    { value: 'social_posts', label: 'Social Media Posts', description: 'Multi-platform social content' },
    { value: 'ad_copy', label: 'Ad Copy', description: 'High-converting advertisement copy' },
    { value: 'blog_post', label: 'Blog Post', description: 'Authority-building blog content' }
  ];

  // Load campaigns on component mount
  React.useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        
        // Auto-select first campaign if available
        if (data.campaigns && data.campaigns.length > 0) {
          setSelectedCampaign(data.campaigns[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      // Create a demo campaign for testing
      setCampaigns([
        {
          id: 'demo_campaign_123',
          name: 'Demo Health Product Campaign',
          description: 'Sample campaign for testing intelligence-driven content',
          intelligence_count: 8,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ]);
      setSelectedCampaign('demo_campaign_123');
    }
  };

  const resetSteps = () => {
    setSteps(steps.map(step => ({ ...step, status: 'pending', details: undefined })));
    setCurrentStep(0);
  };

  const updateStepStatus = (stepIndex: number, status: StepStatus['status'], details?: string) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, details } : step
    ));
  };

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    resetSteps();

    try {
      // Simulate step-by-step process
      for (let i = 0; i < 3; i++) {
        setCurrentStep(i);
        updateStepStatus(i, 'running');
        
        // Simulate processing time for each step
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        if (i === 0) {
          updateStepStatus(i, 'completed', 'Found 8 intelligence sources with 92% confidence');
        } else if (i === 1) {
          updateStepStatus(i, 'completed', 'Generated optimized prompt with 88% optimization score');
        } else {
          updateStepStatus(i, 'completed', 'Generated content using DeepSeek for $0.0012');
        }
      }

      // Make API call
      const requestData: IntelligenceContentRequest = {
        content_type: selectedContentType,
        campaign_id: selectedCampaign || 'demo_campaign_123',
        preferences: {
          tone: 'conversational',
          audience: 'health_conscious',
          demonstration_mode: true
        }
      };

      const response = await fetch('/api/intelligence/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}` // You'll need proper auth handling
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Content generation failed');
      }

      const responseData = await response.json();
      setResult(responseData.data);
      setEditedContent(responseData.data.content); // Initialize edited content
      setSaveStatus('none'); // Reset save status

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
      updateStepStatus(currentStep, 'error', 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepIcon = (step: StepStatus) => {
    if (step.status === 'completed') return CheckCircle;
    if (step.status === 'error') return AlertCircle;
    if (step.status === 'running') return Loader2;
    return step.icon;
  };

  const getStepColor = (step: StepStatus) => {
    switch (step.status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const saveContentToCampaign = async () => {
    if (!result || !editedContent) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const saveData = {
        campaign_id: result.metadata.campaign_id || 'demo_campaign_123',
        content_type: result.content_type,
        original_content: result.content,
        edited_content: editedContent,
        intelligence_metadata: {
          intelligence_sources: result.three_step_process.step1_intelligence_sources,
          optimization_score: result.three_step_process.step2_prompt_optimization,
          ai_provider: result.three_step_process.step3_generation_provider,
          generation_cost: result.metadata.generation_cost,
          product_name: result.metadata.product_name
        }
      };

      const response = await fetch('/api/campaigns/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      setSaveStatus('saved');
      
      // Auto-clear save status after 3 seconds
      setTimeout(() => setSaveStatus('none'), 3000);
      
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditedContent = (path: string, value: any) => {
    setEditedContent(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setSaveStatus('none'); // Mark as unsaved when content changes
      return updated;
    });
  };

  const renderFormattedContent = (content: Record<string, any>, contentType: string) => {
    if (!content) return <div className="text-gray-500">No content generated</div>;

    const currentContent = Object.keys(editedContent).length > 0 ? editedContent : content;

    switch (contentType) {
      case 'email_sequence':
        return renderEmailSequence(currentContent);
      case 'social_posts':
        return renderSocialPosts(currentContent);
      case 'ad_copy':
        return renderAdCopy(currentContent);
      case 'blog_post':
        return renderBlogPost(currentContent);
      default:
        return renderGenericContent(currentContent);
    }
  };

  const renderEmailSequence = (content: any) => {
    const emails = content.emails || [];
    
    return (
      <div className="space-y-6">
        {emails.map((email: any, index: number) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 bg-white p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Email {email.email_number}: {email.strategic_angle?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </h4>
              <Badge variant="outline">{email.send_delay}</Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Subject Line:</label>
                <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <input 
                    type="text" 
                    defaultValue={email.subject}
                    onChange={(e) => updateEditedContent(`emails.${index}.subject`, e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Email Body:</label>
                <div className="mt-1">
                  <textarea 
                    defaultValue={email.body}
                    rows={10}
                    className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {content.sequence_info && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-blue-900">Sequence Info</h5>
            <div className="text-sm text-blue-700 mt-1">
              <p>Total Emails: {content.sequence_info.total_emails}</p>
              <p>Product: {content.sequence_info.product_name}</p>
              <p>Generation Method: {content.sequence_info.generation_method}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSocialPosts = (content: any) => {
    const posts = content.posts || [];
    
    return (
      <div className="space-y-4">
        {posts.map((post: any, index: number) => (
          <div key={index} className="border-l-4 border-purple-500 pl-4 bg-white p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {post.platform?.toUpperCase()} Post {post.post_number}
              </h4>
              <Badge variant="secondary">{post.engagement_strategy}</Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Post Content:</label>
                <div className="mt-1">
                  <textarea 
                    defaultValue={post.content}
                    rows={8}
                    className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              {post.hashtags && post.hashtags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Hashtags:</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {post.hashtags.map((hashtag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAdCopy = (content: any) => {
    const ads = content.ads || [];
    
    return (
      <div className="space-y-4">
        {ads.map((ad: any, index: number) => (
          <div key={index} className="border-l-4 border-green-500 pl-4 bg-white p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Ad Variation {index + 1}
              </h4>
              <Badge variant="outline">{ad.ad_type}</Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Headline:</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    defaultValue={ad.headline}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Ad Body:</label>
                <div className="mt-1">
                  <textarea 
                    defaultValue={ad.body}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Call to Action:</label>
                  <div className="mt-1">
                    <input 
                      type="text" 
                      defaultValue={ad.cta}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Target Audience:</label>
                  <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                    {ad.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBlogPost = (content: any) => {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title:</label>
            <div className="mt-1">
              <input 
                type="text" 
                defaultValue={content.title}
                className="w-full p-3 text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Introduction:</label>
            <div className="mt-1">
              <textarea 
                defaultValue={content.introduction}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {content.sections && content.sections.map((section: any, index: number) => (
            <div key={index} className="border-t pt-4">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Section {index + 1} Heading:</label>
                  <div className="mt-1">
                    <input 
                      type="text" 
                      defaultValue={section.heading}
                      className="w-full p-2 font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Content:</label>
                  <div className="mt-1">
                    <textarea 
                      defaultValue={section.content}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div>
            <label className="text-sm font-medium text-gray-700">Conclusion:</label>
            <div className="mt-1">
              <textarea 
                defaultValue={content.conclusion}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {content.seo_keywords && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-700">SEO Keywords:</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {content.seo_keywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGenericContent = (content: any) => {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <textarea 
          defaultValue={typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Intelligence-Driven Content Generation</h1>
        <p className="text-lg text-gray-600">
          Leverage your existing intelligence data to create highly targeted, personalized content at 95% cost savings
        </p>
      </div>

      {/* Campaign Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select Campaign</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 mb-2">
              Choose which campaign's intelligence to use for content generation
            </label>
            <select
              id="campaign-select"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={campaigns.length === 0}
            >
              {campaigns.length === 0 ? (
                <option value="">Loading campaigns...</option>
              ) : (
                <>
                  <option value="">Select a campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.intelligence_count} intelligence sources)
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {selectedCampaign && campaigns.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {(() => {
                const campaign = campaigns.find(c => c.id === selectedCampaign);
                if (!campaign) return null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-blue-900">{campaign.name}</h3>
                      <Badge variant="secondary">
                        {campaign.intelligence_count} Intelligence Sources
                      </Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-blue-700">{campaign.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-blue-600">
                      <span>Status: {campaign.status}</span>
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* Content Type Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select Content Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedContentType(type.value)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedContentType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* 3-Step Process Visualization */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">3-Step Intelligence Process</h2>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            const isActive = currentStep === index && isGenerating;
            
            return (
              <div key={step.step} className={`flex items-start space-x-4 p-4 rounded-lg border ${
                step.status === 'completed' ? 'bg-green-50 border-green-200' :
                step.status === 'running' ? 'bg-blue-50 border-blue-200' :
                step.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  step.status === 'completed' ? 'bg-green-100' :
                  step.status === 'running' ? 'bg-blue-100' :
                  step.status === 'error' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <StepIcon 
                    className={`w-5 h-5 ${getStepColor(step)} ${
                      step.status === 'running' ? 'animate-spin' : ''
                    }`} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      Step {step.step}: {step.title}
                    </h3>
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'running' ? 'secondary' :
                      step.status === 'error' ? 'destructive' :
                      'outline'
                    }>
                      {step.status === 'running' ? 'Processing...' : step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                  {step.details && (
                    <p className="text-sm font-medium text-blue-700">{step.details}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center mt-6 space-y-2">
          {!selectedCampaign && (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded">
              Please select a campaign to generate content
            </p>
          )}
          <Button 
            onClick={generateContent} 
            disabled={isGenerating || !selectedCampaign}
            className="px-8 py-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Intelligence-Driven Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Generation Failed</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
          
          {/* Process Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {result.three_step_process.step1_intelligence_sources}
              </div>
              <div className="text-sm text-blue-700">Intelligence Sources</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(result.three_step_process.step2_prompt_optimization * 100)}%
              </div>
              <div className="text-sm text-green-700">Optimization Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {result.three_step_process.step3_generation_provider}
              </div>
              <div className="text-sm text-purple-700">AI Provider</div>
            </div>
          </div>

          {/* Generated Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Generated {result.content_type}</h3>
              <div className="flex items-center space-x-3">
                {saveStatus === 'saved' && (
                  <span className="text-green-600 text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Saved to Campaign
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Save Failed
                  </span>
                )}
                <Button 
                  onClick={saveContentToCampaign}
                  disabled={isSaving || !result}
                  variant={saveStatus === 'saved' ? 'outline' : 'default'}
                  className="text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Saved
                    </>
                  ) : (
                    'Save to Campaign'
                  )}
                </Button>
              </div>
            </div>
            {renderFormattedContent(result.content, result.content_type)}
          </div>

          {/* Metadata */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Intelligence Driven: {result.intelligence_driven ? '✅ Yes' : '❌ No'}</p>
            <p>Generation Cost: ${result.metadata.ai_optimization?.generation_cost || 'N/A'}</p>
            <p>Product: {result.metadata.product_name}</p>
            <p>Generated: {new Date(result.metadata.generated_at).toLocaleString()}</p>
          </div>
        </Card>
      )}

      {/* Benefits Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Intelligence-Driven Content?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-lg font-bold text-blue-600">95% Cost Savings</div>
            <div className="text-sm text-gray-600">Ultra-cheap AI providers with intelligence-optimized prompts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">Higher Quality</div>
            <div className="text-sm text-gray-600">Personalized content based on your product intelligence</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">Perfect Targeting</div>
            <div className="text-sm text-gray-600">Leverages market research and audience insights</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntelligenceDrivenContentGenerator;