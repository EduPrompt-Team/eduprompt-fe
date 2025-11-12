import { api } from '@/lib/api'

export interface ApiKey {
  apiKeyId: number
  packageId: number
  provider: string
  keyValue?: string
  isActive?: boolean
  createdAt?: string
  expiresAt?: string | null
  [key: string]: any
}

export interface CreateApiKeyRequest {
  packageId: number
  provider: string
  keyValue: string
  isActive?: boolean
}

class ApiKeyService {
  // GET /api/api-keys/package/{packageId}
  async getByPackage(packageId: number): Promise<ApiKey[]> {
    const { data } = await api.get(`/api/api-keys/package/${packageId}`)
    return data
  }

  // GET /api/api-keys/active/package/{packageId}
  async getActiveByPackage(packageId: number): Promise<ApiKey[]> {
    const { data } = await api.get(`/api/api-keys/active/package/${packageId}`)
    return data
  }

  // GET /api/api-keys/provider/{provider}
  async getActiveByProvider(provider: string): Promise<ApiKey | null> {
    try {
      const { data } = await api.get(`/api/api-keys/provider/${provider}`)
      return data
    } catch (error) {
      console.warn('[apiKeyService] No active key found for provider', provider)
      return null
    }
  }

  // POST /api/api-keys
  async create(payload: CreateApiKeyRequest): Promise<ApiKey> {
    const { data } = await api.post('/api/api-keys', payload)
    return data
  }

  // PUT /api/api-keys/{apiKeyId}
  async update(apiKeyId: number, payload: CreateApiKeyRequest): Promise<ApiKey> {
    const { data } = await api.put(`/api/api-keys/${apiKeyId}`, payload)
    return data
  }

  // DELETE /api/api-keys/{apiKeyId}
  async remove(apiKeyId: number): Promise<void> {
    await api.delete(`/api/api-keys/${apiKeyId}`)
  }
}

export const apiKeyService = new ApiKeyService()
