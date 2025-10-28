import { PackageActiveFlag } from '@/types/status'

export interface PackageDto {
  packageId: number
  categoryId?: number | null
  packageName: string
  description?: string | null
  price: number
  durationDays?: number | null
  isActive: PackageActiveFlag | boolean
  createdDate: string
}

export interface PackageCategoryDto {
  categoryId: number
  categoryName: string
  description?: string | null
  displayOrder: number
}

export interface PackageDetailDto {
  detailId: number
  packageId: number
  featureName: string
  featureValue: string
  featureType: string
}


