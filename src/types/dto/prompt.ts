import { AIHistoryStatus, PromptInstanceStatus } from '@/types/status'

export interface PromptInstanceDto {
  instanceId: number
  userId: number
  packageId: number
  promptName: string
  inputJson?: string | null
  outputJson?: string | null
  executedAt: string
  processingTimeMs?: number | null
  status?: PromptInstanceStatus | null
}

export interface PromptInstanceDetailDto {
  detailId: number
  instanceId: number
  parameterName: string
  parameterValue: string
  parameterType: string
}

export interface ExpectedOutputDto {
  outputId: number
  promptInstanceId: number
  outputName: string
  validationRules?: string | null
  exampleOutput?: string | null
}

export interface AIHistoryDto {
  aiHistoryId: number
  userId: number
  conversationId?: number | null
  promptInstanceId?: number | null
  userMessage?: string | null
  aiResponse?: string | null
  executedAt: string
  processingTimeMs?: number | null
  status?: AIHistoryStatus | null
}


