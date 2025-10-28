import { api } from '@/lib/api'

export interface Wallet {
  walletId: number
  userId: number
  balance: number
  currency: string
  createdDate: string
  status: string
  [key: string]: any
}

export interface AddFundsRequest {
  userId: number
  amount: number
}

export interface DeductFundsRequest {
  userId: number
  amount: number
}

class WalletService {
  // POST /api/Wallet
  async createWallet(): Promise<Wallet> {
    const { data } = await api.post('/api/Wallet')
    return data
  }

  // GET /api/Wallet/{WalletId}
  async getWalletById(walletId: number): Promise<Wallet> {
    const { data } = await api.get(`/api/Wallet/${walletId}`)
    return data
  }

  // PUT /api/Wallet/{WalletId}
  async updateWallet(walletId: number, request: Partial<Wallet>): Promise<Wallet> {
    const { data } = await api.put(`/api/Wallet/${walletId}`, request)
    return data
  }

  // DELETE /api/Wallet/{WalletId}
  async deleteWallet(walletId: number): Promise<void> {
    await api.delete(`/api/Wallet/${walletId}`)
  }

  // POST /api/Wallet/add-funds
  async addFunds(request: AddFundsRequest): Promise<Wallet> {
    const { data } = await api.post('/api/Wallet/add-funds', request)
    return data
  }

  // GET /api/Wallet/balance/{UserId}
  async getWalletBalance(userId: number): Promise<number> {
    const { data } = await api.get(`/api/Wallet/balance/${userId}`)
    return data
  }

  // POST /api/Wallet/deduct-funds
  async deductFunds(request: DeductFundsRequest): Promise<Wallet> {
    const { data } = await api.post('/api/Wallet/deduct-funds', request)
    return data
  }

  // GET /api/Wallet/user/{UserId}
  async getWalletByUserId(userId: number): Promise<Wallet> {
    const { data } = await api.get(`/api/Wallet/user/${userId}`)
    return data
  }
}

export const walletService = new WalletService()

