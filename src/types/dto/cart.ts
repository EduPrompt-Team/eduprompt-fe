import { CartStatus } from '@/types/status'

export interface CartItemDto {
  cartDetailId: number
  cartId: number
  packageId: number
  quantity: number
  unitPrice: number
  addedDate: string
}

export interface CartDto {
  cartId: number
  userId: number
  totalItem: number
  createdDate?: string | null
  updatedDate?: string | null
  status?: CartStatus | null
  items?: CartItemDto[]
}


