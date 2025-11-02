import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/api';

const PaymentFlowDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: 'Packages', path: '/packages', description: 'Browse and select packages' },
    { id: 2, name: 'Wallet Top-up', path: '/wallet/topup', description: 'Top up wallet to purchase packages' },
    { id: 3, name: 'Payment', path: '/payment', description: 'Process payment with selected method' },
    { id: 4, name: 'Wallet', path: '/wallet', description: 'Manage wallet balance and transactions' }
  ];

  const mockCartData = mockData.mockCart;
  const mockPaymentMethods = mockData.mockPaymentMethods;
  const mockWallet = mockData.mockWallet;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛒 EduPrompt Payment Flow Demo
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Complete payment flow from shopping cart to order confirmation. 
            This demo showcases all the payment-related features and API integrations.
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {step.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].name}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Details</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">API Endpoints Used</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {currentStep === 1 && (
                      <>
                        <li>• GET /api/cart - Get user cart</li>
                        <li>• POST /api/cart/items - Add item to cart</li>
                        <li>• PUT /api/cart/items/{id} - Update quantity</li>
                        <li>• DELETE /api/cart/items/{id} - Remove item</li>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <li>• GET /api/cart - Get cart for review</li>
                        <li>• GET /api/paymentmethod - Get payment methods</li>
                        <li>• GET /api/wallet/user/{id} - Get wallet info</li>
                        <li>• POST /api/order/create-from-cart - Create order</li>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <li>• POST /api/transaction - Create transaction</li>
                        <li>• PUT /api/transaction/{id} - Update status</li>
                        <li>• POST /api/wallet/deduct-funds - Deduct funds</li>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <li>• Display order and transaction details</li>
                        <li>• Mock receipt download</li>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <li>• GET /api/order/my - Get user orders</li>
                        <li>• POST /api/order/{id}/cancel - Cancel order</li>
                      </>
                    )}
                    {currentStep === 6 && (
                      <>
                        <li>• GET /api/wallet/user/{id} - Get wallet</li>
                        <li>• POST /api/wallet/add-funds - Add funds</li>
                        <li>• GET /api/transaction/wallet/{id} - Get transactions</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Features</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    {currentStep === 1 && (
                      <>
                        <li>• Real-time cart updates</li>
                        <li>• Quantity management</li>
                        <li>• Item removal</li>
                        <li>• Total calculation</li>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <li>• Order review</li>
                        <li>• Payment method selection</li>
                        <li>• Wallet balance display</li>
                        <li>• Order notes</li>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <li>• Payment processing</li>
                        <li>• Transaction creation</li>
                        <li>• Status updates</li>
                        <li>• Wallet integration</li>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <li>• Order confirmation</li>
                        <li>• Transaction details</li>
                        <li>• Receipt download</li>
                        <li>• Next steps guidance</li>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <li>• Order history</li>
                        <li>• Order cancellation</li>
                        <li>• Status tracking</li>
                        <li>• Order details view</li>
                      </>
                    )}
                    {currentStep === 6 && (
                      <>
                        <li>• Wallet balance</li>
                        <li>• Add funds</li>
                        <li>• Transaction history</li>
                        <li>• Quick stats</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Mock Data Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mock Data Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                  {currentStep === 1 && JSON.stringify(mockCartData, null, 2)}
                  {currentStep === 2 && JSON.stringify({ cart: mockCartData, paymentMethods: mockPaymentMethods, wallet: mockWallet }, null, 2)}
                  {currentStep === 3 && JSON.stringify({ order: mockData.mockOrder, transaction: mockData.mockTransaction }, null, 2)}
                  {currentStep === 4 && JSON.stringify({ order: mockData.mockOrder, transaction: mockData.mockTransaction }, null, 2)}
                  {currentStep === 5 && JSON.stringify([mockData.mockOrder], null, 2)}
                  {currentStep === 6 && JSON.stringify({ wallet: mockWallet, transactions: [mockData.mockTransaction] }, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <Link to={steps[currentStep - 1].path}>
              <Button className="bg-blue-600 hover:bg-blue-700 mr-4">
                Try {steps[currentStep - 1].name}
              </Button>
            </Link>
            <Link to="/home">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Shopping</h3>
            <p className="text-gray-600 text-sm mb-4">Add packages to your cart and begin the payment flow</p>
            <Link to="/home">
              <Button variant="outline" className="w-full">
                Go Shopping
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold text-gray-900 mb-2">Test Payment</h3>
            <p className="text-gray-600 text-sm mb-4">Experience the complete checkout and payment process</p>
            <Link to="/cart">
              <Button variant="outline" className="w-full">
                View Cart
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Orders</h3>
            <p className="text-gray-600 text-sm mb-4">Track orders and manage your wallet balance</p>
            <Link to="/order-history">
              <Button variant="outline" className="w-full">
                Order History
              </Button>
            </Link>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <h4 className="font-medium text-green-900">Cart API</h4>
              <p className="text-sm text-green-700">Fully integrated</p>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <h4 className="font-medium text-green-900">Order API</h4>
              <p className="text-sm text-green-700">Fully integrated</p>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <h4 className="font-medium text-green-900">Payment API</h4>
              <p className="text-sm text-green-700">Fully integrated</p>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <h4 className="font-medium text-green-900">Wallet API</h4>
              <p className="text-sm text-green-700">Fully integrated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlowDemo;
