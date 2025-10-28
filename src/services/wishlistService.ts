import { api } from '@/lib/api'

export interface WishlistItem {
  wishlistId: number
  userId: number
  packageId: number
  addedDate: string
  [key: string]: any
}

export interface CreateWishlistRequest {
  packageId: number
}

class WishlistService {
  // POST /api/Wishlists
  async addToWishlist(request: CreateWishlistRequest): Promise<WishlistItem> {
    const { data } = await api.post('/api/Wishlists', request)
    return data
  }

  // DELETE /api/Wishlists/{id}
  async removeFromWishlist(id: number): Promise<void> {
    await api.delete(`/api/Wishlists/${id}`)
  }

  // GET /api/Wishlists/check/{PackageId}
  async checkInWishlist(packageId: number): Promise<boolean> {
    const { data } = await api.get(`/api/Wishlists/check/${packageId}`)
    return data
  }

  // GET /api/Wishlists/my-wishlist
  async getMyWishlist(): Promise<WishlistItem[]> {
    const { data } = await api.get('/api/Wishlists/my-wishlist')
    return data
  }
}

export const wishlistService = new WishlistService()

