import { api } from '@/lib/api'

export interface OrderItem {
  orderItemId: number
  orderId: number
  packageId: number
  quantity: number
  unitPrice: number
  [key: string]: any
}

export interface Order {
  orderId: number
  userId: number
  orderNumber: string
  totalAmount: number
  orderDate: string
  status: string
  items: OrderItem[]
  [key: string]: any
}

export interface CreateOrderFromCartRequest {
  notes?: string
}

class OrderService {
  // GET /api/Order
  async getAllOrders(): Promise<Order[]> {
    const { data } = await api.get('/api/Order')
    return data
  }

  // GET /api/Order/{orderId}
  async getOrderById(orderId: number): Promise<Order> {
    const { data } = await api.get(`/api/Order/${orderId}`)
    return data
  }

  // POST /api/Order/{orderId}/cancel
  async cancelOrder(orderId: number): Promise<void> {
    await api.post(`/api/Order/${orderId}/cancel`)
  }

  // PATCH /api/Order/{orderId}/status
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const { data } = await api.patch(`/api/Order/${orderId}/status`, null, {
      params: { status }
    })
    return data
  }

  // GET /api/Order/admin/{orderId}
  async getOrderByIdAdmin(orderId: number): Promise<Order> {
    const { data } = await api.get(`/api/Order/admin/${orderId}`)
    return data
  }

  // POST /api/Order/create-from-cart
  async createOrderFromCart(request?: CreateOrderFromCartRequest): Promise<Order> {
    const { data } = await api.post('/api/Order/create-from-cart', null, {
      params: request || {}
    })
    return data
  }

  // GET /api/Order/my
  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get('/api/Order/my')
    return data
  }
}

export const orderService = new OrderService()

