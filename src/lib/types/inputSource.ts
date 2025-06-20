// File: src/lib/types/inputSource.ts

export interface InputSource {
  id: string
  campaign_id: string
  source_type: 'url' | 'file' | 'video' | 'document' | 'batch'
  source_url?: string
  source_content?: string
  file_name?: string
  file_path?: string
  file_size?: number
  file_type?: string
  processing_status: 'pending' | 'processing' | 'completed' | 'error' | 'queued'
  processing_progress?: number
  analysis_results?: InputSourceAnalysis
  error_message?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface InputSourceAnalysis {
  content_type?: string
  word_count?: number
  keywords_extracted?: string[]
  summary?: string
  confidence_score?: number
  language?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  key_insights?: string[]
  competitive_intelligence?: any
  vsl_detected?: boolean
  video_duration?: number
}

export interface InputSourceRequest {
  source_type: 'url' | 'file' | 'video' | 'document' | 'batch'
  source_url?: string
  source_content?: string
  file_name?: string
  file_size?: number
  file_type?: string
  metadata?: Record<string, any>
}

export interface BatchInputRequest {
  campaign_id: string
  urls: string[]
  analysis_type?: 'basic' | 'comprehensive' | 'competitive'
  batch_name?: string
}

export interface FileUploadRequest {
  campaign_id: string
  file: File
  file_type: string
  processing_options?: {
    extract_text?: boolean
    analyze_images?: boolean
    detect_tables?: boolean
  }
}

export interface URLAnalysisRequest {
  campaign_id: string
  url: string
  analysis_depth: 'basic' | 'comprehensive' | 'competitive'
  include_vsl_detection?: boolean
  extract_content?: boolean
}

export interface ProcessingQueueItem {
  id: string
  source_id: string
  campaign_id: string
  queue_position: number
  estimated_completion: string
  processing_type: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

export type InputSourceStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'queued'
  | 'validating'
  | 'extracting'
  | 'analyzing'