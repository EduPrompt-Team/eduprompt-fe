import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { order, transaction } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order || !transaction) {
      navigate('/cart');
      return;
    }
  }, [order, transaction, navigate]);

  const downloadReceipt = async () => {
    try {
      setLoading(true);
      // In a real app, this would generate and download a PDF receipt
      // For now, we'll just show a success message
      alert('Receipt download feature will be implemented soon!');
    } catch (err: any) {
      setError('Failed to download receipt');
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = () => {
    // Navigate to order history or tracking page
    navigate('/order-history');
  };

  if (!order || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">Invalid confirmation session</p>
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully processed.</p>
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
          {/* Order Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status || 'Completed'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.orderItemId} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.packageName || `Package ${item.packageID}`} (x{item.quantity})
                        </span>
                        <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium text-gray-900">{transaction.transactionReference}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">{transaction.paymentMethodType || 'Credit Card'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Transaction Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {transaction.status || 'Completed'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">${transaction.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">What's Next?</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-1">📧</div>
                    <div>
                      <p className="font-medium text-gray-900">Email Confirmation</p>
                      <p className="text-sm text-gray-600">
                        A confirmation email has been sent to {order.userEmail || 'your email address'}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-1">📦</div>
                    <div>
                      <p className="font-medium text-gray-900">Access Your Packages</p>
                      <p className="text-sm text-gray-600">
                        Your purchased packages are now available in your account.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-3 mt-1">📱</div>
                    <div>
                      <p className="font-medium text-gray-900">Track Your Order</p>
                      <p className="text-sm text-gray-600">
                        You can track your order status in your order history.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={downloadReceipt}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Generating...' : 'Download Receipt'}
          </Button>
          
          <Button
            onClick={trackOrder}
            variant="outline"
          >
            Track Order
          </Button>
          
          <Link to="/home">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>📞 +1 (555) 123-4567</span>
              <span>✉️ support@eduprompt.com</span>
              <span>💬 Live Chat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
