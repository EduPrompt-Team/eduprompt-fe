import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface PaymentMethod {
  paymentMethodID: number;
  methodName: string;
  provider: string;
  isActive: boolean;
  processingFee?: number;
}

interface Wallet {
  walletID: number;
  userID: number;
  balance: number;
  currency: string;
  createdDate: string;
  updatedDate?: string;
  status?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cart
      try {
        const cartResponse = await api.get('/api/cart');
        setCart(cartResponse.data);
      } catch (cartErr) {
        console.error('Cart fetch error:', cartErr);
        setCart(mockData.mockCart);
      }
      
      // Fetch payment methods
      try {
        const paymentResponse = await api.get('/api/paymentmethod');
        setPaymentMethods(paymentResponse.data);
      } catch (paymentErr) {
        console.error('Payment methods fetch error:', paymentErr);
        setPaymentMethods(mockData.mockPaymentMethods);
      }
      
      // Fetch wallet (assuming user ID is available from auth context)
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
      if (currentUser.userId) {
        try {
          const walletResponse = await api.get(`/api/wallet/user/${currentUser.userId}`);
          setWallet(walletResponse.data);
        } catch (walletErr) {
          console.log('Wallet not found, using mock data');
          setWallet(mockData.mockWallet);
        }
      } else {
        // Use mock wallet if no user
        setWallet(mockData.mockWallet);
      }
      
    } catch (err: any) {
      console.error('Checkout data fetch error:', err);
      setError('Using mock data - API not available');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      // Create order from cart
      const orderResponse = await api.post('/api/order/create-from-cart', null, {
        params: { notes: orderNotes || undefined }
      });
      
      const order = orderResponse.data;
      
      // Navigate to payment page with order details
      navigate('/payment', { 
        state: { 
          order, 
          paymentMethodId: selectedPaymentMethod,
          wallet: wallet 
        } 
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
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
            <p className="text-gray-600 mb-8">Add some packages to proceed to checkout!</p>
            <Link 
              to="/cart" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Cart
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
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Review your order and select payment method</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Review */}
          <div>
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Review</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.cartDetailId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.packageName || `Package ${item.packageID}`}
                        </h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">${cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
              </div>
              
              <div className="p-6">
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special instructions or notes for your order..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.paymentMethodID}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.paymentMethodID
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.paymentMethodID)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={selectedPaymentMethod === method.paymentMethodID}
                            onChange={() => setSelectedPaymentMethod(method.paymentMethodID)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{method.methodName}</p>
                            <p className="text-sm text-gray-600">{method.provider}</p>
                            {method.processingFee && (
                              <p className="text-sm text-gray-500">
                                Processing fee: ${method.processingFee.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full ${
                          selectedPaymentMethod === method.paymentMethodID
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Wallet Balance Display */}
                {wallet && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-2">💰</div>
                      <div>
                        <p className="font-medium text-green-900">Wallet Balance</p>
                        <p className="text-green-700">
                          ${wallet.balance.toFixed(2)} {wallet.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <Button
                    onClick={handleCreateOrder}
                    disabled={!selectedPaymentMethod || processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {processing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                  
                  <Link 
                    to="/cart"
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
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

export default CheckoutPage;
