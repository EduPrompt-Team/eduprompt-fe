import { api } from '@/lib/api'

export interface Transaction {
  transactionId: number
  paymentMethodId: number
  walletId?: number
  orderId?: number
  amount: number
  transactionType: string
  transactionDate: string
  status: string
  [key: string]: any
}

export interface CreateTransactionRequest {
  paymentMethodId: number
  walletId?: number
  orderId?: number
  amount: number
  transactionType: string
}

export interface UpdateTransactionRequest {
  amount?: number
  status?: string
}

class TransactionService {
  // GET /api/transactions
  async getAllTransactions(): Promise<Transaction[]> {
    const { data } = await api.get('/api/transactions')
    return data
  }

  // POST /api/transactions
  async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    const { data } = await api.post('/api/transactions', request)
    return data
  }

  // GET /api/transactions/{id}
  async getTransactionById(id: number): Promise<Transaction> {
    const { data } = await api.get(`/api/transactions/${id}`)
    return data
  }

  // PUT /api/transactions/{id}
  async updateTransaction(id: number, request: UpdateTransactionRequest): Promise<Transaction> {
    const { data } = await api.put(`/api/transactions/${id}`, request)
    return data
  }

  // DELETE /api/transactions/{id}
  async deleteTransaction(id: number): Promise<void> {
    await api.delete(`/api/transactions/${id}`)
  }

  // GET /api/transactions/user/{UserId}
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const { data } = await api.get(`/api/transactions/user/${userId}`)
    return data
  }

  // GET /api/transactions/wallet/{WalletId}
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    const { data } = await api.get(`/api/transactions/wallet/${walletId}`)
    return data
  }
}

export const transactionService = new TransactionService()

