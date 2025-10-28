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
  // GET /api/Transaction
  async getAllTransactions(): Promise<Transaction[]> {
    const { data } = await api.get('/api/Transaction')
    return data
  }

  // POST /api/Transaction
  async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    const { data } = await api.post('/api/Transaction', request)
    return data
  }

  // GET /api/Transaction/{id}
  async getTransactionById(id: number): Promise<Transaction> {
    const { data } = await api.get(`/api/Transaction/${id}`)
    return data
  }

  // PUT /api/Transaction/{id}
  async updateTransaction(id: number, request: UpdateTransactionRequest): Promise<Transaction> {
    const { data } = await api.put(`/api/Transaction/${id}`, request)
    return data
  }

  // DELETE /api/Transaction/{id}
  async deleteTransaction(id: number): Promise<void> {
    await api.delete(`/api/Transaction/${id}`)
  }

  // GET /api/Transaction/user/{UserId}
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const { data } = await api.get(`/api/Transaction/user/${userId}`)
    return data
  }

  // GET /api/Transaction/wallet/{WalletId}
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    const { data } = await api.get(`/api/Transaction/wallet/${walletId}`)
    return data
  }
}

export const transactionService = new TransactionService()

