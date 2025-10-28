import { OrderStatus } from '@/types/status'

export interface OrderDto {
  orderId: number
  userId: number
  packageId?: number | null
  totalAmount: number
  orderDate: string
  notes?: string | null
  status?: OrderStatus | null
}


