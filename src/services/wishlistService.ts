import { api } from '@/lib/api'

export interface WishlistItem {
  wishlistId: number
  userId: number
  storageId: number | null
  packageId?: number | null
  addedAt?: string
  addedDate?: string
  notes?: string | null
  templateName?: string
  templateContent?: string
  grade?: string
  subject?: string
  chapter?: string
  isPublic?: boolean
  templateCreatedAt?: string
  [key: string]: any
}

export interface CreateWishlistRequest {
  storageId: number
  packageId?: number | null
  notes?: string | null
}

class WishlistService {
  // POST /api/Wishlists
  async addToWishlist(request: CreateWishlistRequest): Promise<WishlistItem> {
    console.log('[WishlistService] Adding to wishlist with request:', request)
    try {
    const { data } = await api.post('/api/Wishlists', request)
      console.log('[WishlistService] Wishlist add success:', data)
    return data
    } catch (error: any) {
      console.error('[WishlistService] Wishlist add error:', error)
      console.error('[WishlistService] Error response:', error?.response?.data)
      throw error
    }
  }

  // DELETE /api/Wishlists/{id}
  async removeFromWishlist(id: number): Promise<void> {
    await api.delete(`/api/Wishlists/${id}`)
  }

  // DELETE /api/Wishlists/by-storage/{storageId}
  async removeByStorageId(storageId: number): Promise<void> {
    await api.delete(`/api/Wishlists/by-storage/${storageId}`)
  }

  // GET /api/Wishlists/check/{storageId}
  async checkInWishlist(storageId: number): Promise<boolean> {
    const { data } = await api.get(`/api/Wishlists/check/${storageId}`)
    if (typeof data === 'boolean') return data
    return Boolean(data?.isInWishlist)
  }

  // GET /api/Wishlists/check/package/{packageId} (legacy)
  async checkInWishlistByPackage(packageId: number): Promise<boolean> {
    const { data } = await api.get(`/api/Wishlists/check/package/${packageId}`)
    if (typeof data === 'boolean') return data
    return Boolean(data?.isInWishlist)
  }

  // GET /api/Wishlists/my-wishlist
  async getMyWishlist(): Promise<WishlistItem[]> {
    const { data } = await api.get('/api/Wishlists/my-wishlist')
    if (Array.isArray(data)) return data
    return Array.isArray(data?.items) ? data.items : data ? [data] : []
  }
}

export const wishlistService = new WishlistService()

