import { AIHistoryStatus, PromptInstanceStatus } from '@/types/status'

export interface PromptInstanceDto {
  instanceId: number
  userId: number
  packageId: number | null // Nullable - can be null if created from StorageTemplate without package
  storageId?: number | null // Optional - storage template ID if created from template
  promptName: string
  inputJson?: string | null
  outputJson?: string | null
  executedAt: string
  processingTimeMs?: number | null
  status?: PromptInstanceStatus | null
}

export interface CreatePromptInstanceDto {
  userId: number
  packageId?: number | null // Optional - can be null or 0, will be auto-mapped from StorageTemplate if storageId is provided
  storageId?: number | null // Optional - used to auto-map packageId from StorageTemplate
  promptName: string
  inputJson?: string | null
  outputJson?: string | null
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


