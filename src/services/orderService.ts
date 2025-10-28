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
  // GET /api/orders
  async getAllOrders(): Promise<Order[]> {
    const { data } = await api.get('/api/orders')
    return data
  }

  // GET /api/orders/{id}
  async getOrderById(orderId: number): Promise<Order> {
    const { data } = await api.get(`/api/orders/${orderId}`)
    return data
  }

  // POST /api/orders/{id}/cancel
  async cancelOrder(orderId: number): Promise<void> {
    await api.post(`/api/orders/${orderId}/cancel`)
  }

  // PATCH /api/orders/{id}/status
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const { data } = await api.patch(`/api/orders/${orderId}/status`, null, {
      params: { status }
    })
    return data
  }

  // GET /api/admin/orders/{id}
  async getOrderByIdAdmin(orderId: number): Promise<Order> {
    const { data } = await api.get(`/api/admin/orders/${orderId}`)
    return data
  }

  // POST /api/orders/create-from-cart
  async createOrderFromCart(request?: CreateOrderFromCartRequest): Promise<Order> {
    const { data } = await api.post('/api/orders/create-from-cart', null, {
      params: request || {}
    })
    return data
  }

  // GET /api/orders/my
  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get('/api/orders/my')
    return data
  }
}

export const orderService = new OrderService()

