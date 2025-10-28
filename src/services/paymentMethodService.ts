import { api } from '@/lib/api'

export interface PaymentMethod {
  paymentMethodId: number
  userId: number
  methodName: string
  provider: string
  isActive: boolean
  isDefault?: boolean
  [key: string]: any
}

export interface CreatePaymentMethodRequest {
  methodName: string
  provider: string
}

export interface UpdatePaymentMethodRequest {
  methodName?: string
  provider?: string
  isActive?: boolean
}

class PaymentMethodService {
  // GET /api/PaymentMethod
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await api.get('/api/PaymentMethod')
    return data
  }

  // POST /api/PaymentMethod
  async createPaymentMethod(request: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const { data } = await api.post('/api/PaymentMethod', request)
    return data
  }

  // GET /api/PaymentMethod/{id}
  async getPaymentMethodById(id: number): Promise<PaymentMethod> {
    const { data } = await api.get(`/api/PaymentMethod/${id}`)
    return data
  }

  // PUT /api/PaymentMethod/{id}
  async updatePaymentMethod(id: number, request: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    const { data } = await api.put(`/api/PaymentMethod/${id}`, request)
    return data
  }

  // DELETE /api/PaymentMethod/{id}
  async deletePaymentMethod(id: number): Promise<void> {
    await api.delete(`/api/PaymentMethod/${id}`)
  }

  // POST /api/PaymentMethod/{id}/set-default
  async setAsDefault(id: number, userId: number): Promise<void> {
    await api.post(`/api/PaymentMethod/${id}/set-default`, null, {
      params: { userId }
    })
  }

  // GET /api/PaymentMethod/user/{UserId}
  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    const { data } = await api.get(`/api/PaymentMethod/user/${userId}`)
    return data
  }

  // GET /api/PaymentMethod/user/{UserId}/default
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod> {
    const { data } = await api.get(`/api/PaymentMethod/user/${userId}/default`)
    return data
  }
}

export const paymentMethodService = new PaymentMethodService()

