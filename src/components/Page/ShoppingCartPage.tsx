import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, mockData } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface CartItem {
  cartDetailId: number;
  cartId: number;
  packageID: number;
  quantity: number;
  unitPrice: number;
  addedDate: string;
  packageName?: string;
  packageDescription?: string;
}

interface Cart {
  cartId: number;
  userId: number;
  totalItems: number;
  createdDate: string;
  updatedDate?: string;
  totalPrice: number;
  items?: CartItem[];
}

const ShoppingCartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      setCart(response.data);
    } catch (err: any) {
      console.error('Cart fetch error:', err);
      // Use mock data if API fails
      setCart(mockData.mockCart);
      setError('Using mock data - API not available');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartDetailId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await api.put(`/api/cart/items/${cartDetailId}`, {
        quantity: newQuantity
      });
      setCart(response.data);
    } catch (err: any) {
      console.error('Update quantity error:', err);
      // Update local state with mock data
      if (cart) {
        const updatedItems = cart.items?.map(item => 
          item.cartDetailId === cartDetailId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCart({ ...cart, items: updatedItems });
      }
    }
  };

  const removeItem = async (cartDetailId: number) => {
    try {
      await api.delete(`/api/cart/items/${cartDetailId}`);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Remove item error:', err);
      // Update local state
      if (cart) {
        const updatedItems = cart.items?.filter(item => item.cartDetailId !== cartDetailId);
        setCart({ ...cart, items: updatedItems, totalItems: updatedItems?.length || 0 });
      }
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Clear cart error:', err);
      // Clear local state
      setCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCart} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some packages to get started!</p>
            <Link 
              to="/home" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <Button 
                    onClick={clearCart}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.cartDetailId} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.packageName || `Package ${item.packageID}`}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {item.packageDescription || 'No description available'}
                        </p>
                        <p className="text-lg font-semibold text-blue-600 mt-2">
                          ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.cartDetailId, item.quantity - 1)}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartDetailId, item.quantity + 1)}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.cartDetailId)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Added on {new Date(item.addedDate).toLocaleDateString()}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        Total: ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                    <span className="font-medium">${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-blue-600">
                        ${cart.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Link 
                    to="/checkout"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <Link 
                    to="/home"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
