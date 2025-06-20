import { Campaign } from "../api"

interface CampaignStore {
  currentCampaign: Campaign | null
  campaigns: Campaign[]
  isLoading: boolean
  createCampaign: (data: CampaignCreateRequest) => Promise<void>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}