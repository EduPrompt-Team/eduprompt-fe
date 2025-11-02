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
  durationDays?: number
  durationMonths?: number
}

export interface UpdatePackageRequest {
  packageName?: string
  description?: string
  price?: number
  isActive?: boolean
  categoryId?: number
  durationDays?: number
  durationMonths?: number
}

class PackageService {
  // GET /api/packages
  async getAllPackages(): Promise<Package[]> {
    const { data } = await api.get('/api/packages')
    return data
  }

  // POST /api/packages
  async createPackage(request: CreatePackageRequest): Promise<Package> {
    const { data } = await api.post('/api/packages', request)
    return data
  }

  // GET /api/packages/{PackageId}
  async getPackageById(packageId: number): Promise<Package> {
    const { data } = await api.get(`/api/packages/${packageId}`)
    return data
  }

  // PUT /api/packages/{PackageId}
  async updatePackage(packageId: number, request: UpdatePackageRequest): Promise<Package> {
    const { data } = await api.put(`/api/packages/${packageId}`, request)
    return data
  }

  // DELETE /api/packages/{PackageId}
  async deletePackage(packageId: number): Promise<void> {
    await api.delete(`/api/packages/${packageId}`)
  }

  // GET /api/packages/active
  async getActivePackages(): Promise<Package[]> {
    const { data } = await api.get('/api/packages/active')
    return data
  }

  // GET /api/packages/category/{CategoryId}
  async getPackagesByCategory(categoryId: number): Promise<Package[]> {
    const { data } = await api.get(`/api/packages/category/${categoryId}`)
    return data
  }

  // GET /api/packages/price-range
  async getPackagesByPriceRange(minPrice: number, maxPrice: number): Promise<Package[]> {
    const { data } = await api.get('/api/packages/price-range', {
      params: { minPrice, maxPrice }
    })
    return data
  }

  // GET /api/packages/search
  async searchPackages(searchTerm: string): Promise<Package[]> {
    const { data } = await api.get('/api/packages/search', {
      params: { searchTerm }
    })
    return data
  }
}

export const packageService = new PackageService()

