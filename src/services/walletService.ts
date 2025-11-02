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
  // POST /api/wallets
  async createWallet(): Promise<Wallet> {
    // Gửi empty object để đảm bảo Content-Type: application/json
    // Backend sẽ tự lấy userId từ token
    const { data } = await api.post('/api/wallets', {})
    return data
  }

  // GET /api/wallets/{WalletId}
  async getWalletById(walletId: number): Promise<Wallet> {
    const { data } = await api.get(`/api/wallets/${walletId}`)
    return data
  }

  // PUT /api/wallets/{WalletId}
  async updateWallet(walletId: number, request: Partial<Wallet>): Promise<Wallet> {
    const { data } = await api.put(`/api/wallets/${walletId}`, request)
    return data
  }

  // DELETE /api/wallets/{WalletId}
  async deleteWallet(walletId: number): Promise<void> {
    await api.delete(`/api/wallets/${walletId}`)
  }

  // POST /api/wallets/add-funds
  async addFunds(request: AddFundsRequest): Promise<Wallet> {
    const { data } = await api.post('/api/wallets/add-funds', request)
    return data
  }

  // GET /api/wallets/balance/{UserId}
  async getWalletBalance(userId: number): Promise<number> {
    const { data } = await api.get(`/api/wallets/balance/${userId}`)
    return data
  }

  // POST /api/wallets/deduct-funds
  async deductFunds(request: DeductFundsRequest): Promise<Wallet> {
    const { data } = await api.post('/api/wallets/deduct-funds', request)
    return data
  }

  // GET /api/wallets/user/{UserId}
  async getWalletByUserId(userId: number): Promise<Wallet> {
    const { data } = await api.get(`/api/wallets/user/${userId}`)
    return data
  }
}

export const walletService = new WalletService()

