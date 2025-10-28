import { api } from '@/lib/api'

export interface Package {
  packageId: number
  packageName: string
  description?: string
  price: number
  isActive: boolean
  categoryId?: number
  [key: string]: any
}

export interface CreatePackageRequest {
  packageName: string
  description?: string
  price: number
  categoryId?: number
}

export interface UpdatePackageRequest {
  packageName?: string
  description?: string
  price?: number
  isActive?: boolean
  categoryId?: number
}

class PackageService {
  // GET /api/Package
  async getAllPackages(): Promise<Package[]> {
    const { data } = await api.get('/api/Package')
    return data
  }

  // POST /api/Package
  async createPackage(request: CreatePackageRequest): Promise<Package> {
    const { data } = await api.post('/api/Package', request)
    return data
  }

  // GET /api/Package/{PackageId}
  async getPackageById(packageId: number): Promise<Package> {
    const { data } = await api.get(`/api/Package/${packageId}`)
    return data
  }

  // PUT /api/Package/{PackageId}
  async updatePackage(packageId: number, request: UpdatePackageRequest): Promise<Package> {
    const { data } = await api.put(`/api/Package/${packageId}`, request)
    return data
  }

  // DELETE /api/Package/{PackageId}
  async deletePackage(packageId: number): Promise<void> {
    await api.delete(`/api/Package/${packageId}`)
  }

  // GET /api/Package/active
  async getActivePackages(): Promise<Package[]> {
    const { data } = await api.get('/api/Package/active')
    return data
  }

  // GET /api/Package/category/{CategoryId}
  async getPackagesByCategory(categoryId: number): Promise<Package[]> {
    const { data } = await api.get(`/api/Package/category/${categoryId}`)
    return data
  }

  // GET /api/Package/price-range
  async getPackagesByPriceRange(minPrice: number, maxPrice: number): Promise<Package[]> {
    const { data } = await api.get('/api/Package/price-range', {
      params: { minPrice, maxPrice }
    })
    return data
  }

  // GET /api/Package/search
  async searchPackages(searchTerm: string): Promise<Package[]> {
    const { data } = await api.get('/api/Package/search', {
      params: { searchTerm }
    })
    return data
  }
}

export const packageService = new PackageService()

