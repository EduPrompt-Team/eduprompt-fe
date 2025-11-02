export interface ApiKeyDto {
  apiKeyId: number
  packageId: number
  apiProvider: string
  keyHash: string
  usageLimit?: number | null
  currentUsage: number
  expiresAt?: string | null
}
