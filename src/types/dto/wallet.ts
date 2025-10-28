import { WalletStatus } from '@/types/status'

export interface WalletDto {
  walletId: number
  userId: number
  balance: number
  currency: string
  createdDate: string
  updatedDate?: string | null
  status?: WalletStatus | null
}


