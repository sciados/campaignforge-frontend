// File: src/lib/stores/inputSourceStore.ts
import { InputSource, InputSourceRequest } from "../types/inputSource"

interface InputSourceStore {
  sources: InputSource[]
  isProcessing: boolean
  addSource: (campaignId: string, source: InputSourceRequest) => Promise<void>
  removeSource: (sourceId: string) => Promise<void>
  processSource: (sourceId: string) => Promise<void>
}

// Placeholder implementation
export const useInputSourceStore = (): InputSourceStore => {
  return {
    sources: [],
    isProcessing: false,
    addSource: async (campaignId: string, source: InputSourceRequest) => {
      console.log('Adding source:', campaignId, source)
    },
    removeSource: async (sourceId: string) => {
      console.log('Removing source:', sourceId)
    },
    processSource: async (sourceId: string) => {
      console.log('Processing source:', sourceId)
    }
  }
}