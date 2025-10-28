export interface PaymentMethodDto {
  paymentMethodId: number
  methodName: string
  provider: string
  isActive: boolean
  processingFee?: number | null
}

export interface TransactionSummaryDto {
  totalAmount: number
  count: number
}


