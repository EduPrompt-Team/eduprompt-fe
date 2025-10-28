import { api } from '@/lib/api'

export interface CartItem {
  cartDetailId: number
  cartId: number
  packageId: number
  quantity: number
  unitPrice: number
  [key: string]: any
}

export interface Cart {
  cartId: number
  userId: number
  totalItems: number
  totalPrice: number
  items: CartItem[]
  createdDate: string
  [key: string]: any
}

export interface AddItemRequest {
  packageId: number
  quantity: number
}

class CartService {
  // GET /api/Cart
  async getCart(): Promise<Cart> {
    const { data } = await api.get('/api/Cart')
    return data
  }

  // DELETE /api/Cart
  async clearCart(): Promise<void> {
    await api.delete('/api/Cart')
  }

  // POST /api/Cart/items
  async addItem(request: AddItemRequest): Promise<CartItem> {
    const { data } = await api.post('/api/Cart/items', request)
    return data
  }

  // PUT /api/Cart/items/{cartDetailId}
  async updateItem(cartDetailId: number, quantity: number): Promise<CartItem> {
    const { data } = await api.put(`/api/Cart/items/${cartDetailId}`, { quantity })
    return data
  }

  // DELETE /api/Cart/items/{cartDetailId}
  async removeItem(cartDetailId: number): Promise<void> {
    await api.delete(`/api/Cart/items/${cartDetailId}`)
  }
}

export const cartService = new CartService()

