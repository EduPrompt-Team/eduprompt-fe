import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, mockData } from '@/lib/api';
import { Button } from '@/components/ui/button';

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

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
      
      if (currentUser.userId) {
        // Fetch wallet
        try {
          const walletResponse = await api.get(`/api/wallet/user/${currentUser.userId}`);
          setWallet(walletResponse.data);
          
          // Fetch transactions
          try {
            const transactionsResponse = await api.get(`/api/transaction/wallet/${walletResponse.data.walletID}`);
            setTransactions(transactionsResponse.data);
          } catch (transErr) {
            console.error('Transactions fetch error:', transErr);
            setTransactions([mockData.mockTransaction]);
          }
        } catch (walletErr) {
          console.error('Wallet fetch error:', walletErr);
          // Use mock data
          setWallet(mockData.mockWallet);
          setTransactions([mockData.mockTransaction]);
        }
      } else {
        // Use mock data if no user
        setWallet(mockData.mockWallet);
        setTransactions([mockData.mockTransaction]);
      }
      
    } catch (err: any) {
      console.error('Wallet data fetch error:', err);
      setError('Using mock data - API not available');
      setWallet(mockData.mockWallet);
      setTransactions([mockData.mockTransaction]);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (userId: number) => {
    try {
      const walletData = {
        userID: userId,
        balance: 0,
        currency: 'USD',
        status: 'Active'
      };
      
      const response = await api.post('/api/wallet', walletData);
      setWallet(response.data);
    } catch (err: any) {
      setError('Failed to create wallet');
    }
  };

  const addFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!wallet) {
      setError('Wallet not found');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      await api.post('/api/wallet/add-funds', {
        userId: wallet.userID,
        amount: parseFloat(addFundsAmount)
      });
      
      // Refresh wallet data
      await fetchWalletData();
      
      setShowAddFunds(false);
      setAddFundsAmount('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'text-red-600';
      case 'deposit':
      case 'add funds':
        return 'text-green-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return '💸';
      case 'deposit':
      case 'add funds':
        return '💰';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWalletData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your balance and view transaction history</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Wallet Balance</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ${wallet?.balance.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-gray-600 mb-6">{wallet?.currency || 'USD'}</p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowAddFunds(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Add Funds
                    </Button>
                    
                    <Link to="/order-history" className="block">
                      <Button variant="outline" className="w-full">
                        View Orders
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium">{transactions.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet Created</span>
                    <span className="font-medium">
                      {wallet ? new Date(wallet.createdDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wallet?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wallet?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              </div>
              
              <div className="p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">💳</div>
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.transactionID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getTransactionIcon(transaction.transactionType)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.transactionType}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {transaction.transactionReference && (
                              <p className="text-xs text-gray-500">
                                Ref: {transaction.transactionReference}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionTypeColor(transaction.transactionType)}`}>
                            {transaction.transactionType.toLowerCase().includes('payment') ? '-' : '+'}
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Wallet</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={addFunds}
                  disabled={processing || !addFundsAmount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {processing ? 'Adding...' : 'Add Funds'}
                </Button>
                
                <Button
                  onClick={() => {
                    setShowAddFunds(false);
                    setAddFundsAmount('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
