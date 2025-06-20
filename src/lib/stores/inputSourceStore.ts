// lib/stores/inputSourceStore.ts
interface InputSourceStore {
  sources: InputSource[]
  isProcessing: boolean
  addSource: (campaignId: string, source: InputSourceRequest) => Promise<void>
  removeSource: (sourceId: string) => Promise<void>
  processSource: (sourceId: string) => Promise<void>
}