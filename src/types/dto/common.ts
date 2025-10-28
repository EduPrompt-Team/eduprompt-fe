// Common response shapes and shared types

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ErrorResponse {
  code?: string | number
  message: string
  details?: unknown
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PagedResponse<T> {
  data: T[]
  meta: PaginationMeta
}


