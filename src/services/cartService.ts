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
  // GET /api/cart
  async getCart(): Promise<Cart> {
    const { data } = await api.get('/api/cart')
    return data
  }

  // DELETE /api/cart
  async clearCart(): Promise<void> {
    await api.delete('/api/cart')
  }

  // POST /api/cart/items
  async addItem(request: AddItemRequest): Promise<CartItem> {
    const { data } = await api.post('/api/cart/items', request)
    return data
  }

  // PUT /api/cart/items/{cartDetailId}
  async updateItem(cartDetailId: number, quantity: number): Promise<CartItem> {
    const { data } = await api.put(`/api/cart/items/${cartDetailId}`, { quantity })
    return data
  }

  // DELETE /api/cart/items/{cartDetailId}
  async removeItem(cartDetailId: number): Promise<void> {
    await api.delete(`/api/cart/items/${cartDetailId}`)
  }
}

export const cartService = new CartService()

