// src/app/campaigns/create-workflow/page.tsx - UPDATED with complete workflow integration
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Brain,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { useCampaignStore } from "@/lib/stores/campaignStore";
import { useIntelligenceWorkflow } from "@/lib/services/intelligenceWorkflowService";

// Import step components
import Step1Setup from "./components/Step1Setup";
import Step2ContentGeneration from "./components/Step2ContentGeneration";

interface WorkflowState {
  currentStep: number;
  campaignData: {
    id?: string;
    title: string;
    description: string;
    keywords: string[];
    target_audience: string;
    product_info?: any; // Product information from Content Library
  };
  isStep1Locked: boolean;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  intelligenceEnhanced: boolean;
  intelligenceId?: string;
  confidenceScore: number;
}

export default function CreateWorkflowPage() {
  const router = useRouter();
  const api = useApi();
  const { createCampaign } = useCampaignStore();
  const {
    isAnalyzing,
    analysisProgress,
    currentStep: analysisStep,
    error: workflowError,
    runCompleteWorkflow,
    getEnhancedIntelligenceForContent,
  } = useIntelligenceWorkflow();

  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 1,
    campaignData: {
      title: "",
      description: "",
      keywords: [],
      target_audience: ""
    },
    isStep1Locked: false,
    isAnalyzing: false,
    analysisComplete: false,
    intelligenceEnhanced: false,
    confidenceScore: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Initialize workflow with selected product from Content Library
  useEffect(() => {
    const selectedProduct = localStorage.getItem('selectedProduct');
    if (selectedProduct) {
      try {
        const productData = JSON.parse(selectedProduct);
        console.log('Loading selected product for campaign:', productData);

        setWorkflow(prev => ({
          ...prev,
          campaignData: {
            ...prev.campaignData,
            title: `${productData.product_name} Campaign`,
            description: `Marketing campaign for ${productData.product_name} by ${productData.vendor_name}`,
            product_info: productData
          }
        }));

        // Clear the selected product from localStorage after using it
        localStorage.removeItem('selectedProduct');
      } catch (error) {
        console.error('Failed to parse selected product data:', error);
      }
    }
  }, []);

  // Auto-advance to Step 3 when analysis completes
  useEffect(() => {
    if (
      workflow.currentStep === 2 &&
      workflow.analysisComplete &&
      !isAnalyzing
    ) {
      console.log("Analysis complete, advancing to Step 3");
      setTimeout(() => {
        setWorkflow((prev) => ({ ...prev, currentStep: 3 }));
      }, 1500);
    }
  }, [workflow.analysisComplete, isAnalyzing, workflow.currentStep]);

  const handleStep1Complete = async (campaignData: {
    title: string;
    description: string;
    keywords: string[];
    target_audience: string;
  }) => {
    setIsCreating(true);
    setError(null);

    try {
      console.log("Creating campaign with basic data:", campaignData);
      console.log("Product info from workflow:", workflow.campaignData.product_info);

      // Create campaign with simplified data including product info
      const campaignPayload = {
        ...campaignData,
        campaign_type: "universal",
        product_info: workflow.campaignData.product_info
      };

      const campaign = await createCampaign(campaignPayload);

      console.log("Campaign created successfully:", campaign.id);

      // Navigate to campaign inputs management page
      router.push(`/campaigns/${campaign.id}/inputs`);
      
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create campaign"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const startCompleteAnalysisWorkflow = async (
    campaignId: string,
    campaignData: any
  ) => {
    try {
      console.log(
        "Starting complete analysis workflow for campaign:",
        campaignId
      );

      setWorkflow((prev) => ({ ...prev, isAnalyzing: true }));

      // Run the complete workflow: Analysis + Storage + Enhancement
      const result = await runCompleteWorkflow(
        campaignId,
        {
          salespage_url: campaignData.salespage_url,
          product_name: campaignData.product_name,
          auto_enhance: true,
        },
        (progress, step) => {
          // Update UI with progress
          console.log(`Workflow progress: ${progress}% - ${step}`);
        }
      );

      console.log("Complete workflow result:", result);

      setWorkflow((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysisComplete: true,
        intelligenceEnhanced: result.enhanced,
        intelligenceId: result.intelligence_id,
        confidenceScore: result.confidence_score,
      }));
    } catch (error) {
      console.error("Complete analysis workflow failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Analysis workflow failed";
      setError(`Analysis failed: ${errorMessage}`);

      setWorkflow((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysisComplete: false,
      }));
    }
  };

  const handleContentGenerated = () => {
    // Redirect to campaign content library
    if (workflow.campaignData.id) {
      router.push(`/campaigns/${workflow.campaignData.id}/content`);
    }
  };

  const handleGoToCampaign = () => {
    if (workflow.campaignData.id) {
      router.push(`/campaigns/${workflow.campaignData.id}`);
    }
  };

  const handleRetryAnalysis = async () => {
    if (!workflow.campaignData.id) return;

    setError(null);
    await startCompleteAnalysisWorkflow(
      workflow.campaignData.id,
      workflow.campaignData
    );
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < workflow.currentStep) return "completed";
    if (stepNumber === workflow.currentStep) return "active";
    return "pending";
  };

  const getStepIcon = (stepNumber: number, status: string) => {
    if (status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === "active" && stepNumber === 2) {
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    }
    if (status === "active" && stepNumber === 3) {
      return <Sparkles className="h-5 w-5 text-purple-600" />;
    }
    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
          status === "active"
            ? "bg-purple-600 text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {stepNumber}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/campaigns")}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create New Campaign
              </h1>
              <p className="text-sm text-gray-500">
                Enhanced auto-analysis with intelligence enhancement • Step{" "}
                {workflow.currentStep} of 3
              </p>
            </div>
          </div>

          {workflow.campaignData.id && (
            <button
              onClick={handleGoToCampaign}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              Go to Campaign
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { num: 1, title: "Setup Campaign" },
              { num: 2, title: "AI Analysis & Enhancement" },
              { num: 3, title: "Generate Content" },
            ].map((step, index) => {
              const status = getStepStatus(step.num);

              return (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStepIcon(step.num, status)}
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-medium ${
                          status === "active"
                            ? step.num === 2
                              ? "text-blue-600"
                              : "text-purple-600"
                            : status === "completed"
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.num === 2 && workflow.currentStep === 2 && (
                        <div
                          className={`text-xs mt-1 ${
                            workflow.analysisComplete
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {workflow.analysisComplete
                            ? "Complete!"
                            : "Processing..."}
                        </div>
                      )}
                    </div>
                  </div>

                  {index < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        step.num < workflow.currentStep
                          ? "bg-green-500"
                          : workflow.currentStep === 2 && step.num === 1
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Analysis Progress Bar */}
          {workflow.currentStep === 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {workflow.analysisComplete
                        ? "Analysis & Enhancement Complete!"
                        : "AI-Powered Intelligence Analysis"}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {workflow.analysisComplete
                        ? `Intelligence extracted and enhanced${
                            workflow.intelligenceEnhanced
                              ? " with AI amplification"
                              : ""
                          }`
                        : analysisStep ||
                          "Analyzing salespage and enhancing intelligence..."}
                    </p>
                  </div>
                </div>
                {workflow.analysisComplete && (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {workflow.analysisComplete ? "Complete" : "Progress"}
                  </span>
                  <span className="text-sm text-blue-700">
                    {workflow.analysisComplete
                      ? "100"
                      : Math.round(analysisProgress)}
                    %
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      workflow.analysisComplete ? "bg-green-500" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${
                        workflow.analysisComplete ? 100 : analysisProgress
                      }%`,
                    }}
                  />
                </div>
              </div>

              {workflow.campaignData.title && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Campaign: {workflow.campaignData.title}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {workflow.campaignData.description}
                  </p>
                  {workflow.confidenceScore > 0 && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-700">Confidence:</span>
                      <span className="font-medium text-blue-900">
                        {Math.round(workflow.confidenceScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {workflow.analysisComplete && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">
                      Intelligence analysis complete
                      {workflow.intelligenceEnhanced
                        ? " with AI enhancement"
                        : ""}
                      ! Moving to Step 3...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {(error || workflowError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error || workflowError}</p>
                {workflow.currentStep === 2 && (
                  <button
                    onClick={handleRetryAnalysis}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Analysis
                  </button>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {workflow.currentStep === 1 && (
            <Step1Setup
              onComplete={handleStep1Complete}
              isLoading={isCreating}
            />
          )}

          {workflow.currentStep === 2 && (
            <div className="p-8 text-center">
              {workflow.isAnalyzing || isAnalyzing ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      AI is analyzing and enhancing your intelligence...
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We are extracting insights from your salespage and
                      automatically enhancing them with AI-powered competitive
                      intelligence. This usually takes 60-90 seconds.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Enhanced Workflow:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Analyzing product features and benefits</li>
                      <li>• Identifying target audience signals</li>
                      <li>• Extracting key selling points</li>
                      <li>• Finding competitive advantages</li>
                      <li>• Enhancing with AI-powered insights</li>
                      <li>• Adding scientific backing and credibility</li>
                    </ul>
                  </div>
                </div>
              ) : workflow.analysisComplete ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Intelligence Analysis & Enhancement Complete!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Your product intelligence has been extracted and enhanced
                      with AI amplification. Ready to generate high-converting
                      content.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-green-900 mb-2">
                      Intelligence Enhanced:
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ Product positioning and benefits</li>
                      <li>✅ Target audience insights</li>
                      <li>✅ Competitive differentiation</li>
                      <li>✅ Key messaging frameworks</li>
                      {workflow.intelligenceEnhanced && (
                        <>
                          <li>✅ AI-powered scientific backing</li>
                          <li>✅ Enhanced credibility markers</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="h-10 w-10 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We could not analyze your salespage. Please check the URL
                      and try again.
                    </p>
                  </div>
                  <button
                    onClick={handleRetryAnalysis}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {workflow.currentStep === 3 && workflow.campaignData.id && (
            <Step2ContentGeneration
              campaignId={workflow.campaignData.id}
              campaignTitle={workflow.campaignData.title}
              sourcesAnalyzed={1}
              onContentGenerated={handleContentGenerated}
              analysisComplete={workflow.analysisComplete}
              intelligenceEnhanced={workflow.intelligenceEnhanced}
              getEnhancedIntelligence={getEnhancedIntelligenceForContent}
            />
          )}
        </div>

        {/* Enhanced Workflow Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">
            🚀 Enhanced Auto-Analysis Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Step 1: Setup</div>
              <div className="text-blue-700">
                Campaign details + product info
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">
                Step 2: AI Analysis & Enhancement
              </div>
              <div className="text-blue-700">
                Automatic intelligence extraction + AI amplification
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Step 3: Generate</div>
              <div className="text-blue-700">
                Create content using enhanced insights
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">
              <strong>NEW:</strong> Complete integration! We automatically
              analyze your salespage, store the intelligence in the database,
              enhance it with AI amplification, and make it available for
              powerful content generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
