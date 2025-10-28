import { TransactionStatus } from '@/types/status'

export interface TransactionDto {
  transactionId: number
  paymentMethodId: number
  walletId: number
  orderId?: number | null
  amount: number
  transactionType: string
  transactionDate: string
  status?: TransactionStatus | null
  transactionReference?: string | null
}


