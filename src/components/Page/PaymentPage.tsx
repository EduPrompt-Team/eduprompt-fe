import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface OrderItem {
  orderItemId: number;
  orderId: number;
  packageID: number;
  quantity: number;
  unitPrice: number;
  packageName?: string;
}

interface Order {
  orderId: number;
  userId: number;
  orderNumber: string;
  totalAmount: number;
  createdDate?: string;
  orderDate: string;
  status?: string;
  userName?: string;
  userEmail?: string;
  items?: OrderItem[];
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

interface Transaction {
  transactionID: number;
  paymentMethodID: number;
  walletID: number;
  orderID?: number;
  amount: number;
  transactionType: string;
  transactionDate: string;
  status?: string;
  transactionReference?: string;
  paymentMethodType?: string;
  walletOwnerName?: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { order, paymentMethodId, wallet } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!order || !paymentMethodId) {
      navigate('/cart');
      return;
    }
    
    fetchPaymentMethod();
  }, [order, paymentMethodId, navigate]);

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/paymentmethod/${paymentMethodId}`);
      setPaymentMethod(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment method');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // Create transaction
      const transactionData = {
        paymentMethodID: paymentMethodId,
        walletID: wallet?.walletID || 1, // Default wallet ID if not available
        orderID: order.orderId,
        amount: order.totalAmount,
        transactionType: 'Payment',
        transactionReference: `PAY-${Date.now()}`,
        status: 'Pending'
      };
      
      const transactionResponse = await api.post('/api/transaction', transactionData);
      const newTransaction = transactionResponse.data;
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update transaction status to completed
      const updatedTransactionData = {
        ...transactionData,
        status: 'Completed'
      };
      
      await api.put(`/api/transaction/${newTransaction.transactionID}`, updatedTransactionData);
      
      // Update wallet balance if using wallet payment
      if (wallet && paymentMethod?.methodName.toLowerCase().includes('wallet')) {
        await api.post('/api/wallet/deduct-funds', {
          userId: order.userId,
          amount: order.totalAmount
        });
      }
      
      setTransaction({ ...newTransaction, status: 'Completed' });
      setSuccess(true);
      
      // Redirect to confirmation page after 3 seconds
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { order, transaction: { ...newTransaction, status: 'Completed' } } 
        });
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">Your order has been processed successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  if (!order || !paymentMethod) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">Invalid payment session</p>
          <Button onClick={() => navigate('/cart')} className="bg-blue-600 hover:bg-blue-700">
            Back to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
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
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {order.items?.map((item) => (
                    <div key={item.orderItemId} className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.packageName || `Package ${item.packageID}`}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{paymentMethod.methodName}</p>
                      <p className="text-sm text-blue-700">{paymentMethod.provider}</p>
                    </div>
                    <div className="text-blue-600 text-2xl">💳</div>
                  </div>
                </div>

                {/* Wallet Balance Display */}
                {wallet && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">Available Balance</p>
                        <p className="text-green-700">
                          ${wallet.balance.toFixed(2)} {wallet.currency}
                        </p>
                      </div>
                      <div className="text-green-600 text-2xl">💰</div>
                    </div>
                    
                    {wallet.balance < order.totalAmount && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ Insufficient balance. You may need to add funds to your wallet.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Processing Fee */}
                {paymentMethod.processingFee && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium">${paymentMethod.processingFee.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-gray-400 mr-3">🔒</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Secure Payment</p>
                      <p className="text-gray-600 text-sm">
                        Your payment information is encrypted and secure. We do not store your payment details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={processPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay $${order.totalAmount.toFixed(2)}`
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/packages')}
                    variant="outline"
                    className="w-full"
                    disabled={processing}
                  >
                    Quay lại Packages
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;