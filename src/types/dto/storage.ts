export interface StorageTemplateDto {
  storageId: number
  userId: number
  packageId: number
  templateName: string
  isFavorite: boolean
  createdAt: string
  templateContent?: string | null
  grade?: string | null
  subject?: string | null
  chapter?: string | null
  isPublic: boolean
}

export interface TemplateArchitectureDto {
  architectureId: number
  storageId: number
  architectureName: string
  architectureType: string
  configurationJson?: string | null
}


