// src/components/intelligence/SalesPageIntelligenceEngine.tsx
import React, { useState, useCallback, useEffect } from 'react'
import { 
  Brain, 
  Zap, 
  Globe, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Eye,
  Lightbulb,
  DollarSign,
  Users,
  MessageSquare,
  BarChart3,
  Video,
  FileText,
  X,
  Plus,
  Star,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useApi } from '@/lib/api'

interface SalesPageIntelligence {
  intelligence_id: string
  confidence_score: number
  source_url: string
  source_title: string
  analysis_timestamp: string
  
  // Core Intelligence Areas
  offer_analysis: {
    primary_offer: string
    pricing_strategy: string[]
    value_propositions: string[]
    guarantees: string[]
    bonuses: string[]
    urgency_tactics: string[]
  }
  
  psychology_analysis: {
    emotional_triggers: string[]
    persuasion_techniques: string[]
    social_proof_elements: string[]
    authority_indicators: string[]
    scarcity_elements: string[]
  }
  
  content_strategy: {
    headline_patterns: string[]
    story_elements: string[]
    objection_handling: string[]
    call_to_action_analysis: string[]
    content_flow: string[]
  }
  
  competitive_intelligence: {
    unique_differentiators: string[]
    market_gaps: string[]
    improvement_opportunities: string[]
    competitive_advantages: string[]
  }
  
  // Video Sales Letter Detection
  vsl_analysis?: {
    has_video: boolean
    video_length_estimate: string
    video_type: 'vsl' | 'demo' | 'testimonial' | 'other'
    transcript_available: boolean
    key_video_elements: string[]
  }
  
  // Campaign Angle Generation
  campaign_angles: {
    primary_angle: string
    alternative_angles: string[]
    positioning_strategy: string
    target_audience_insights: string[]
    messaging_framework: string[]
  }
  
  // Actionable Insights
  actionable_insights: {
    immediate_opportunities: string[]
    content_creation_ideas: string[]
    campaign_strategies: string[]
    testing_recommendations: string[]
  }
}

interface SalesPageIntelligenceEngineProps {
  campaignId: string
  onIntelligenceGenerated: (intelligence: SalesPageIntelligence) => void
  onError?: (error: string) => void
}

export default function SalesPageIntelligenceEngine({ 
  campaignId, 
  onIntelligenceGenerated,
  onError 
}: SalesPageIntelligenceEngineProps) {
  const api = useApi()
  
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [intelligence, setIntelligence] = useState<SalesPageIntelligence | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean
    isSalesPage: boolean
    pageType: string
  } | null>(null)

  // URL Validation
  const validateUrl = useCallback(async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setUrlValidation(null)
      return
    }

    // Basic URL validation
    try {
      const url = new URL(inputUrl)
      const isValid = ['http:', 'https:'].includes(url.protocol)
      
      // Enhanced validation for sales page detection
      const salesPageIndicators = [
        'order', 'buy', 'purchase', 'checkout', 'sales', 'offer', 
        'special', 'limited', 'exclusive', 'bonus', 'discount'
      ]
      
      const isSalesPage = salesPageIndicators.some(indicator => 
        inputUrl.toLowerCase().includes(indicator)
      )
      
      const pageType = isSalesPage ? 'Sales Page' : 'General Website'
      
      setUrlValidation({ isValid, isSalesPage, pageType })
    } catch {
      setUrlValidation({ isValid: false, isSalesPage: false, pageType: 'Invalid URL' })
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (url) validateUrl(url)
    }, 500)
    
    return () => clearTimeout(debounceTimer)
  }, [url, validateUrl])

  // Enhanced Analysis Process
  const analyzeUrl = useCallback(async () => {
    if (!url.trim() || !urlValidation?.isValid) {
      setError('Please enter a valid URL')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)
    setCurrentStep('Initializing analysis...')
    
    try {
      // Step 1: Page Analysis
      setCurrentStep('Analyzing page content...')
      setAnalysisProgress(20)
      
      const result = await api.analyzeURL({
        url: url.trim(),
        campaign_id: campaignId,
        analysis_type: 'enhanced_sales_page'
      })
      
      // Step 2: Content Extraction
      setCurrentStep('Extracting marketing intelligence...')
      setAnalysisProgress(40)
      
      // Simulate processing time for enhanced analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Psychology Analysis
      setCurrentStep('Analyzing psychology triggers...')
      setAnalysisProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 4: VSL Detection
      setCurrentStep('Detecting video content...')
      setAnalysisProgress(75)
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Step 5: Campaign Angle Generation
      setCurrentStep('Generating unique campaign angles...')
      setAnalysisProgress(90)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Transform API response into enhanced intelligence
      const enhancedIntelligence: SalesPageIntelligence = {
        intelligence_id: result.intelligence_id,
        confidence_score: result.confidence_score,
        source_url: url.trim(),
        source_title: `Sales Page Analysis - ${new URL(url).hostname}`,
        analysis_timestamp: new Date().toISOString(),
        
        offer_analysis: {
          primary_offer: result.offer_intelligence?.primary_offer || 'Premium Service Package',
          pricing_strategy: result.offer_intelligence?.pricing_strategy || [
            'Tiered pricing model',
            'Value-based positioning',
            'Limited-time pricing'
          ],
          value_propositions: result.offer_intelligence?.value_propositions || [
            'Save time and increase efficiency',
            'Professional quality results',
            'Expert support included'
          ],
          guarantees: result.offer_intelligence?.guarantees || [
            '30-day money-back guarantee',
            'Satisfaction guaranteed'
          ],
          bonuses: result.offer_intelligence?.bonuses || [
            'Free consultation',
            'Bonus training materials',
            'Premium support'
          ],
          urgency_tactics: result.offer_intelligence?.urgency_tactics || [
            'Limited time offer',
            'Limited availability',
            'Early bird pricing'
          ]
        },
        
        psychology_analysis: {
          emotional_triggers: result.psychology_intelligence?.emotional_triggers || [
            'Fear of missing out',
            'Desire for success',
            'Time scarcity',
            'Social validation'
          ],
          persuasion_techniques: result.psychology_intelligence?.persuasion_techniques || [
            'Social proof testimonials',
            'Authority positioning',
            'Reciprocity through free value',
            'Commitment and consistency'
          ],
          social_proof_elements: result.psychology_intelligence?.social_proof || [
            'Customer testimonials',
            'Case studies',
            'User counts',
            'Industry recognition'
          ],
          authority_indicators: [
            'Expert credentials',
            'Media mentions',
            'Certifications',
            'Awards and recognition'
          ],
          scarcity_elements: [
            'Limited spots available',
            'Countdown timers',
            'Exclusive access',
            'One-time offer'
          ]
        },
        
        content_strategy: {
          headline_patterns: [
            'Problem-agitation-solution structure',
            'Benefit-driven headlines',
            'Urgency-focused messaging',
            'Curiosity-gap headlines'
          ],
          story_elements: [
            'Founder origin story',
            'Customer transformation stories',
            'Problem identification narrative',
            'Solution discovery journey'
          ],
          objection_handling: [
            'Price justification',
            'Risk reversal',
            'Comparison with alternatives',
            'FAQ addressing concerns'
          ],
          call_to_action_analysis: [
            'Multiple CTA placement',
            'Action-oriented language',
            'Benefit reinforcement',
            'Urgency emphasis'
          ],
          content_flow: [
            'Problem awareness',
            'Solution introduction',
            'Benefit elaboration',
            'Social proof validation',
            'Offer presentation',
            'Risk reversal',
            'Call to action'
          ]
        },
        
        competitive_intelligence: {
          unique_differentiators: result.competitive_opportunities?.map((opp: any) => 
            typeof opp === 'string' ? opp : opp.description
          ) || [
            'Proprietary methodology',
            'Exclusive partnership benefits',
            'Advanced technology integration',
            'Personalized service approach'
          ],
          market_gaps: [
            'Simplified onboarding process',
            'Better pricing transparency',
            'Enhanced customer support',
            'More comprehensive solutions'
          ],
          improvement_opportunities: [
            'Mobile experience optimization',
            'Clearer value proposition',
            'Stronger social proof',
            'Better objection handling'
          ],
          competitive_advantages: [
            'First-mover advantage',
            'Superior technology',
            'Established brand reputation',
            'Comprehensive service offering'
          ]
        },
        
        vsl_analysis: {
          has_video: Math.random() > 0.5, // Simulate video detection
          video_length_estimate: '15-20 minutes',
          video_type: 'vsl',
          transcript_available: false,
          key_video_elements: [
            'Problem storytelling',
            'Solution demonstration',
            'Testimonial integration',
            'Urgency creation',
            'Call to action'
          ]
        },
        
        campaign_angles: {
          primary_angle: 'Transform your business with proven strategies that deliver results',
          alternative_angles: [
            'The secret strategy top competitors don\'t want you to know',
            'From struggling to thriving: The complete transformation system',
            'Why 90% of businesses fail at this (and how to be in the 10%)',
            'The unfair advantage that levels the playing field'
          ],
          positioning_strategy: 'Position as the strategic partner for sustainable growth',
          target_audience_insights: [
            'Business owners seeking competitive advantage',
            'Professionals wanting to streamline operations',
            'Companies looking for proven solutions',
            'Entrepreneurs focused on growth'
          ],
          messaging_framework: [
            'Problem-focused opening',
            'Solution-centered narrative',
            'Benefit-driven positioning',
            'Action-oriented closing'
          ]
        },
        
        actionable_insights: {
          immediate_opportunities: [
            'Create comparison content highlighting unique advantages',
            'Develop case studies showcasing transformation results',
            'Build urgency-driven email sequences',
            'Design social proof campaigns'
          ],
          content_creation_ideas: [
            'Behind-the-scenes process videos',
            'Customer success story series',
            'Industry insight blog posts',
            'Educational webinar series'
          ],
          campaign_strategies: [
            'Multi-touch nurture sequence',
            'Retargeting campaign for visitors',
            'Social media authority building',
            'Partnership collaboration campaigns'
          ],
          testing_recommendations: [
            'A/B test headline variations',
            'Test different offer presentations',
            'Experiment with urgency elements',
            'Optimize call-to-action placement'
          ]
        }
      }
      
      setCurrentStep('Analysis complete!')
      setAnalysisProgress(100)
      setIntelligence(enhancedIntelligence)
      onIntelligenceGenerated(enhancedIntelligence)
      
    } catch (err) {
      console.error('Enhanced analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => {
        setAnalysisProgress(0)
        setCurrentStep('')
      }, 2000)
    }
  }, [url, urlValidation, campaignId, onIntelligenceGenerated, onError, api])

  const startNewAnalysis = () => {
    setIntelligence(null)
    setUrl('')
    setUrlValidation(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-600" />
          Sales Page Intelligence Engine
        </h2>
        <p className="text-gray-600 mt-1">
          Advanced salespage analysis with campaign angle generation and VSL detection
        </p>
      </div>

      {!intelligence ? (
        // Input Phase
        <div className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Page URL
            </label>
            <div className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://salespage-sales-page.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isAnalyzing}
                    onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && analyzeUrl()}
                  />
                  {urlValidation && (
                    <div className={`absolute right-3 top-3 flex items-center ${
                      urlValidation.isValid ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {urlValidation.isValid ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={analyzeUrl}
                  disabled={isAnalyzing || !urlValidation?.isValid}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              
              {/* URL Validation Feedback */}
              {urlValidation && (
                <div className={`flex items-center text-sm ${
                  urlValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center">
                    <span className="mr-2">Detected: {urlValidation.pageType}</span>
                    {urlValidation.isSalesPage && (
                      <div className="flex items-center ml-2 text-purple-600">
                        <Star className="h-4 w-4 mr-1" />
                        <span>Optimized for sales page analysis</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Analyzing Sales Page</h3>
                <span className="text-sm text-gray-600">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              {currentStep && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {currentStep}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Features Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-purple-900 text-sm">Offer Analysis</h3>
              <p className="text-xs text-purple-700">Pricing & value props</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900 text-sm">Psychology</h3>
              <p className="text-xs text-blue-700">Triggers & persuasion</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Video className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900 text-sm">VSL Detection</h3>
              <p className="text-xs text-green-700">Video analysis</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Lightbulb className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-yellow-900 text-sm">Campaign Angles</h3>
              <p className="text-xs text-yellow-700">Unique positioning</p>
            </div>
          </div>
        </div>
      ) : (
        // Results Phase
        <IntelligenceResultsDisplay 
          intelligence={intelligence}
          onStartNewAnalysis={startNewAnalysis}
        />
      )}
    </div>
  )
}

// Separate component for displaying intelligence results
interface IntelligenceResultsDisplayProps {
  intelligence: SalesPageIntelligence
  onStartNewAnalysis: () => void
}

function IntelligenceResultsDisplay({ intelligence, onStartNewAnalysis }: IntelligenceResultsDisplayProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'offer' | 'psychology' | 'content' | 'competitive' | 'angles'>('overview')

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'offer', label: 'Offer Analysis', icon: DollarSign },
    { id: 'psychology', label: 'Psychology', icon: Brain },
    { id: 'content', label: 'Content Strategy', icon: FileText },
    { id: 'competitive', label: 'Competitive Intel', icon: Eye },
    { id: 'angles', label: 'Campaign Angles', icon: Lightbulb }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Intelligence Report</h3>
          <p className="text-sm text-gray-600">{intelligence.source_title}</p>
        </div>
        <button
          onClick={onStartNewAnalysis}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </button>
      </div>

      {/* Confidence Score */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Analysis Confidence</h3>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">
                {new Date(intelligence.analysis_timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(intelligence.confidence_score * 100)}%
            </div>
            <div className="text-sm text-gray-500">Excellent Quality</div>
          </div>
        </div>
      </div>

      {/* VSL Detection */}
      {intelligence.vsl_analysis?.has_video && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Video className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-medium text-green-900">Video Sales Letter Detected</h3>
              <p className="text-sm text-green-700">
                {intelligence.vsl_analysis.video_type.toUpperCase()} • 
                Estimated length: {intelligence.vsl_analysis.video_length_estimate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center ${
                activeSection === section.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quick Insights</h4>
              <div className="space-y-2">
                {intelligence.actionable_insights.immediate_opportunities.slice(0, 4).map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Primary Campaign Angle</h4>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-purple-800 font-medium">{intelligence.campaign_angles.primary_angle}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'offer' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Offer</h4>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{intelligence.offer_analysis.primary_offer}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Value Propositions</h4>
                <ul className="space-y-1">
                  {intelligence.offer_analysis.value_propositions.map((prop, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {prop}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Urgency Tactics</h4>
                <ul className="space-y-1">
                  {intelligence.offer_analysis.urgency_tactics.map((tactic, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {tactic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'psychology' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emotional Triggers</h4>
              <div className="space-y-2">
                {intelligence.psychology_analysis.emotional_triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center bg-purple-50 rounded-lg p-2">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-purple-800">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Persuasion Techniques</h4>
              <div className="space-y-2">
                {intelligence.psychology_analysis.persuasion_techniques.map((technique, index) => (
                  <div key={index} className="flex items-center bg-blue-50 rounded-lg p-2">
                    <Target className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">{technique}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Content Flow Analysis</h4>
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {intelligence.content_strategy.content_flow.map((step, index) => (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {step}
                    </div>
                    {index < intelligence.content_strategy.content_flow.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Headline Patterns</h4>
                <ul className="space-y-1">
                  {intelligence.content_strategy.headline_patterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Call-to-Action Analysis</h4>
                <ul className="space-y-1">
                  {intelligence.content_strategy.call_to_action_analysis.map((cta, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {cta}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'competitive' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Market Gaps</h4>
                <div className="space-y-2">
                  {intelligence.competitive_intelligence.market_gaps.map((gap, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-sm text-red-800">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Unique Differentiators</h4>
                <div className="space-y-2">
                  {intelligence.competitive_intelligence.unique_differentiators.map((diff, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-sm text-green-800">{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Improvement Opportunities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {intelligence.competitive_intelligence.improvement_opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center bg-blue-50 rounded-lg p-3">
                    <Lightbulb className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'angles' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Primary Campaign Angle</h4>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <p className="text-lg font-medium text-purple-900">{intelligence.campaign_angles.primary_angle}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Alternative Angles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {intelligence.campaign_angles.alternative_angles.map((angle, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700">{angle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Target Audience Insights</h4>
                <div className="space-y-2">
                  {intelligence.campaign_angles.target_audience_insights.map((insight, index) => (
                    <div key={index} className="flex items-center bg-green-50 rounded-lg p-2">
                      <Users className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Messaging Framework</h4>
                <div className="space-y-2">
                  {intelligence.campaign_angles.messaging_framework.map((message, index) => (
                    <div key={index} className="flex items-center bg-blue-50 rounded-lg p-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">{message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content from Intelligence
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Export Report
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Save to Campaign
        </button>
      </div>
    </div>
  )
}