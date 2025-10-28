export interface StorageTemplateDto {
  storageId: number
  userId: number
  packageId: number
  templateName: string
  isFavorite: boolean
  createdAt: string
}

export interface TemplateArchitectureDto {
  architectureId: number
  storageId: number
  architectureName: string
  architectureType: string
  configurationJson?: string | null
}


