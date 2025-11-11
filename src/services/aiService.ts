import { api } from '@/lib/api'

export interface AISuggestionRequest {
  outputName?: string
  model?: string
  parameters?: Record<string, any>
}

export interface AISuggestionResponse {
  expectedOutputId: number
  generatedOutput: string
  message: string
}

class AIService {
  // POST /api/ai/suggestions/{instanceId}
  async generateSuggestions(instanceId: number, request: AISuggestionRequest): Promise<AISuggestionResponse> {
    const { data } = await api.post(`/api/ai/suggestions/${instanceId}`, request)
    return data
  }
}

export const aiService = new AIService()
