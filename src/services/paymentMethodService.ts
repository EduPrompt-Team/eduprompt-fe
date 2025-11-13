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
  // GET /api/payment-methods
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await api.get('/api/payment-methods')
    return data
  }

  // POST /api/payment-methods
  async createPaymentMethod(request: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const { data } = await api.post('/api/payment-methods', request)
    return data
  }

  // GET /api/payment-methods/{id}
  async getPaymentMethodById(id: number): Promise<PaymentMethod> {
    const { data } = await api.get(`/api/payment-methods/${id}`)
    return data
  }

  // PUT /api/payment-methods/{id}
  async updatePaymentMethod(id: number, request: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    const { data } = await api.put(`/api/payment-methods/${id}`, request)
    return data
  }

  // DELETE /api/payment-methods/{id}
  async deletePaymentMethod(id: number): Promise<void> {
    await api.delete(`/api/payment-methods/${id}`)
  }

  // POST /api/payment-methods/{id}/set-default
  async setAsDefault(id: number, userId: number): Promise<void> {
    await api.post(`/api/payment-methods/${id}/set-default`, null, {
      params: { userId }
    })
  }

  // GET /api/payment-methods/user/{UserId}
  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    const { data } = await api.get(`/api/payment-methods/user/${userId}`)
    return data
  }

  // GET /api/payment-methods/user/{UserId}/default
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod> {
    const { data } = await api.get(`/api/payment-methods/user/${userId}/default`)
    return data
  }

  // GET /api/payment-methods/public - Get active payment methods (NEW) ⭐
  // NOTE: Endpoint này chưa sẵn sàng, backend trả về 400 vì hiểu nhầm "public" là ID
  // Tạm thời return empty array để dùng default paymentMethodId = 1
  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    // Endpoint chưa sẵn sàng, không gọi để tránh lỗi 400
    console.warn('[PaymentMethodService] Public endpoint not available yet, using default paymentMethodId = 1')
    return []
  }
}

export const paymentMethodService = new PaymentMethodService()

