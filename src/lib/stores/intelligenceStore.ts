import { CampaignIntelligence } from "@/types"

// lib/stores/intelligenceStore.ts
interface IntelligenceStore {
  intelligence: CampaignIntelligence | null
  isAnalyzing: boolean
  keywords: string[]
  suggestedKeywords: string[]
  analyzeContent: (campaignId: string) => Promise<void>
  updateKeywords: (keywords: string[]) => Promise<void>
}