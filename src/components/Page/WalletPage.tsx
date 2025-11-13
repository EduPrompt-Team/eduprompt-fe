import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockData, walletApi, transactionApi } from '@/lib/api';
import { walletService } from '@/services/walletService';
import { Button } from '@/components/ui/button';
import HeaderHomepage from '@/components/Layout/HeaderHomepage';
import SiderBar from '@/components/ProfileUser/SiderBar';

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
  const [needsActivation, setNeedsActivation] = useState(false);
  const [activating, setActivating] = useState(false);
  const navigate = useNavigate();

  // Fetch transactions function - có thể gọi riêng
  const fetchTransactions = async (walletId: number) => {
    if (!walletId || walletId === 0) {
      setTransactions([]);
      return;
    }
    
    try {
      console.log('Fetching transactions for wallet:', walletId);
      const transRes = await transactionApi.getByWalletId(walletId);
      const transData = (transRes as any).data || transRes;
      const transactionsArray = Array.isArray(transData) ? transData : [];
      console.log('Transactions fetched:', transactionsArray.length, transactionsArray);
      setTransactions(transactionsArray);
    } catch (transErr: any) {
      // Không log error nếu chỉ là 404 (chưa có transactions)
      if (transErr?.response?.status !== 404) {
        console.warn('Transactions fetch error:', transErr);
      }
      console.log('No transactions found or error, setting empty array');
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchWalletData();
    
    // Check payment success ngay khi component mount
    const checkPaymentSuccessOnMount = async () => {
      const paymentTestSuccess = localStorage.getItem('payment_test_success');
      const vnpaySuccess = localStorage.getItem('vnpay_success');
      
      if (paymentTestSuccess || vnpaySuccess) {
        // Đợi một chút để wallet data được fetch xong
        setTimeout(async () => {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
          const userId = Number(currentUser.userId);
          
          if (userId) {
            try {
              // Refresh wallet và transactions
              const walletData = await walletService.getWalletByUserId(userId);
              if (walletData && walletData.walletId) {
                const normalized = {
                  walletID: walletData.walletId,
                  userID: walletData.userId || userId,
                  balance: walletData.balance || 0,
                  currency: walletData.currency || 'VND',
                  createdDate: walletData.createdDate || new Date().toISOString(),
                  updatedDate: walletData.updatedDate || undefined,
                  status: walletData.status || 'Active',
                } as Wallet;
                
                setWallet(normalized);
                
                // Refresh transactions để hiển thị giao dịch mới
                await fetchTransactions(walletData.walletId);
              }
            } catch (err) {
              console.error('Error refreshing after payment success:', err);
            }
          }
          
          // Cleanup localStorage sau khi đã refresh
          localStorage.removeItem('payment_test_success');
          localStorage.removeItem('vnpay_success');
        }, 500);
      }
    };
    
    checkPaymentSuccessOnMount();
  }, []);

  // Detect payment success và refresh transactions khi wallet đã có
  useEffect(() => {
    const checkPaymentSuccess = async () => {
      const paymentTestSuccess = localStorage.getItem('payment_test_success');
      const vnpaySuccess = localStorage.getItem('vnpay_success');
      
      if (paymentTestSuccess || vnpaySuccess) {
        // Nếu có payment success, refresh wallet và transactions
        if (wallet && wallet.walletID > 0) {
          // Refresh wallet để lấy balance mới
          try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
            const userId = Number(currentUser.userId);
            if (userId) {
              const walletData = await walletService.getWalletByUserId(userId);
              if (walletData && walletData.walletId) {
                setWallet({
                  walletID: walletData.walletId,
                  userID: walletData.userId || userId,
                  balance: walletData.balance || 0,
                  currency: walletData.currency || 'VND',
                  createdDate: wallet.createdDate,
                  updatedDate: walletData.updatedDate,
                  status: walletData.status || 'Active',
                });
                
                // Refresh transactions để hiển thị giao dịch mới
                await fetchTransactions(walletData.walletId);
              }
            }
          } catch (err) {
            console.error('Error refreshing wallet after payment:', err);
            // Vẫn refresh transactions với walletId hiện tại
            if (wallet.walletID > 0) {
              await fetchTransactions(wallet.walletID);
            }
          }
        }
        
        // Cleanup localStorage sau khi đã refresh
        localStorage.removeItem('payment_test_success');
        localStorage.removeItem('vnpay_success');
      }
    };

    // Chỉ check khi đã có wallet
    if (wallet && wallet.walletID > 0) {
      checkPaymentSuccess();
    }
  }, [wallet]); // Re-run khi wallet thay đổi

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}')

      if (!currentUser.userId) {
        setWallet(mockData.mockWallet)
        setTransactions([mockData.mockTransaction])
        setNeedsActivation(false)
        return
      }

      const userId = Number(currentUser.userId)

      try {
        const walletData = await walletService.getWalletByUserId(userId)
        if (walletData && (walletData.walletId || walletData.walletID)) {
          const normalized: Wallet = {
            walletID: walletData.walletId ?? walletData.walletID ?? 0,
            userID: walletData.userId ?? walletData.userID ?? userId,
            balance: walletData.balance ?? 0,
            currency: walletData.currency ?? 'VND',
            createdDate: walletData.createdDate ?? new Date().toISOString(),
            updatedDate: walletData.updatedDate,
            status: walletData.status ?? 'Active',
          }

          setWallet(normalized)
          setNeedsActivation(false)

          if (normalized.walletID > 0) {
            await fetchTransactions(normalized.walletID)
          } else {
            setTransactions([])
          }
          return
        }
      } catch (walletErr: any) {
        const status = walletErr?.response?.status
        if (status === 404 || status === 400) {
          setNeedsActivation(true)
          setWallet(null)
          setTransactions([])
          return
        }
        console.warn('Wallet fetch error:', status || walletErr?.message)
      }

      setNeedsActivation(true)
      setWallet(null)
      setTransactions([])
    } catch (err: any) {
      if (err?.response?.status !== 404 && err?.response?.status !== 400) {
        console.error('Wallet data fetch error:', err)
        setError('Không thể tải thông tin ví. Vui lòng thử lại sau.')
      } else {
        setNeedsActivation(true)
        setWallet(null)
        setTransactions([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Kích hoạt ví
  const createWallet = async (userId: number) => {
    try {
      setActivating(true);
      setError(null);
      
      // Dùng walletService.createWallet() - không cần payload, backend tự map với userId hiện tại
      const w = await walletService.createWallet();
      
      setWallet({
        walletID: w.walletId ?? w.walletID ?? 0,
        userID: w.userId ?? w.userID ?? userId,
        balance: w.balance ?? 0,
        currency: w.currency ?? 'VND',
        createdDate: w.createdDate ?? new Date().toISOString(),
        updatedDate: w.updatedDate,
        status: w.status ?? 'Active',
      });
      setNeedsActivation(false);
      
      // Refresh data để lấy đầy đủ thông tin (bao gồm transactions)
      await fetchWalletData();
    } catch (err: any) {
      if (err?.response?.status === 400) {
        // Có thể ví đã tồn tại – thử fetch lại
        await fetchWalletData()
        setError(null)
        return
      }
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tạo ví. Vui lòng thử lại.'
      setError(errorMsg)
      console.error('Create wallet error:', err)
    } finally {
      setActivating(false)
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
      
      await walletApi.addFunds(wallet.userID, parseFloat(addFundsAmount));
      
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
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error && !wallet && !needsActivation) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchWalletData} className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Nếu chưa có ví: hiển thị kích hoạt ví
  if (!loading && needsActivation) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <HeaderHomepage />
        <div className="flex">
          <SiderBar />
          <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
            <div className="max-w-3xl mx-auto px-4 py-16">
              <div className="bg-[#23233a] rounded-lg border border-[#2a2a44] p-8 text-center">
                <div className="text-5xl mb-4">💼</div>
                <h1 className="text-2xl font-bold mb-2">Kích hoạt ví cá nhân</h1>
                <p className="text-neutral-400 mb-6">Bạn chưa có ví. Nhấn kích hoạt để tạo ví và bắt đầu sử dụng.</p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => createWallet(Number(currentUser?.userId))}
                    disabled={activating}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                  >
                    {activating ? 'Đang kích hoạt...' : 'Kích hoạt ví'}
                  </Button>
                  <Link to="/home">
                    <Button variant="outline" className="border-[#2f2f4a] text-white">Quay lại</Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Ví của tôi</h1>
          <p className="text-neutral-400 mt-2">Quản lý số dư và lịch sử giao dịch</p>
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
            <div className="bg-[#23233a] rounded-lg border border-[#2a2a44]">
              <div className="px-6 py-4 border-b border-[#2f2f4a]">
                <h2 className="text-lg font-semibold">Số dư ví</h2>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {(wallet?.balance || 0).toLocaleString('vi-VN')} ₫
                  </div>
                  <p className="text-neutral-400 mb-6">{wallet?.currency || 'VND'}</p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        // Xóa thông tin package cũ khi nạp tiền trực tiếp từ wallet
                        localStorage.removeItem('selectedPackageForPayment')
                        navigate('/wallet/topup')
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                    >
                      Nạp tiền vô ví
                    </Button>
                    <div className="grid grid-cols-3 gap-2">
                      {[2000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            // Xóa thông tin package cũ khi nạp tiền trực tiếp từ wallet
                            localStorage.removeItem('selectedPackageForPayment')
                            localStorage.setItem('topupAmount', amt.toString())
                            navigate(`/wallet/topup?amount=${amt}`)
                          }}
                          className="text-xs py-1.5 px-2 rounded bg-[#2a2a44] hover:bg-[#3a3a54] text-neutral-300 transition-colors"
                        >
                          {amt >= 1000000 ? `${(amt / 1000000).toFixed(1)}M` : `${(amt / 1000).toFixed(0)}K`}
                        </button>
                      ))}
                    </div>
                    
                    <Link to="/order-history" className="block">
                      <Button variant="outline" className="w-full border-[#2f2f4a] text-white">
                        Xem chi tiết đơn hàng
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#23233a] rounded-lg border border-[#2a2a44] mt-6">
              <div className="px-6 py-4 border-b border-[#2f2f4a]">
                <h2 className="text-lg font-semibold">Thống kê nhanh</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Tổng giao dịch</span>
                    <span className="font-medium text-white">{transactions.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Ngày tạo ví</span>
                    <span className="font-medium text-white">
                      {wallet ? new Date(wallet.createdDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Ho_Chi_Minh'
                      }) : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Trạng thái</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wallet?.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-neutral-500/20 text-neutral-300'
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
            <div className="bg-[#23233a] rounded-lg border border-[#2a2a44]">
              <div className="px-6 py-4 border-b border-[#2f2f4a]">
                <h2 className="text-lg font-semibold">Lịch sử giao dịch</h2>
              </div>
              
              <div className="p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-neutral-400 text-4xl mb-4">💳</div>
                    <p className="text-neutral-300">Chưa có giao dịch</p>
                    <p className="text-sm text-neutral-500 mt-2">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.transactionID} className="flex items-center justify-between p-4 border border-[#2f2f4a] rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getTransactionIcon(transaction.transactionType)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {/* Hiển thị description hoặc transactionReference nếu có, nếu không thì hiển thị transactionType */}
                              {transaction.transactionReference && !transaction.transactionReference.includes('TXN-') && !transaction.transactionReference.includes('WLT-') && !transaction.transactionReference.includes('ORD-')
                                ? transaction.transactionReference
                                : (transaction as any).description
                                ? (transaction as any).description
                                : transaction.transactionType}
                            </p>
                            <p className="text-sm text-neutral-400">
                              {new Date(transaction.transactionDate).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Ho_Chi_Minh'
                              })}
                            </p>
                            {transaction.transactionReference && (transaction.transactionReference.includes('TXN-') || transaction.transactionReference.includes('WLT-') || transaction.transactionReference.includes('ORD-')) && (
                              <p className="text-xs text-neutral-500">
                                Ref: {transaction.transactionReference}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionTypeColor(transaction.transactionType)}`}>
                            {transaction.transactionType.toLowerCase().includes('payment') ? '-' : '+'}
                            {transaction.amount.toLocaleString('vi-VN')} ₫
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                            transaction.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            transaction.status === 'Failed' ? 'bg-red-500/20 text-red-300' :
                            transaction.status === 'Paid' ? 'bg-green-500/20 text-green-300' :
                            'bg-neutral-500/20 text-neutral-300'
                          }`}>
                            {transaction.status === 'Completed' || transaction.status === 'Paid' ? 'Thành công' :
                             transaction.status === 'Pending' ? 'Đang xử lý' :
                             transaction.status === 'Failed' ? 'Thất bại' :
                             transaction.status || 'Unknown'}
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a2d] border border-[#2a2a44] rounded-lg p-6 w-full max-w-md mx-4 text-white">
              <h3 className="text-lg font-semibold mb-4">Nạp tiền vào ví</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#23233a] border border-[#2f2f4a] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={addFunds}
                  disabled={processing || !addFundsAmount}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 disabled:opacity-50"
                >
                  {processing ? 'Adding...' : 'Add Funds'}
                </Button>
                
                <Button
                  onClick={() => {
                    setShowAddFunds(false);
                    setAddFundsAmount('');
                  }}
                  variant="outline"
                  className="flex-1 border-[#2f2f4a] text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default WalletPage;
