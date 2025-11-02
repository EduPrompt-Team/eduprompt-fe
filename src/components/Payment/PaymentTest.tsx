// import React from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { api, getCurrentUser } from '@/lib/api'
// import { walletService } from '@/services/walletService'
// import { transactionService } from '@/services/transactionService'
// import { paymentMethodService } from '@/services/paymentMethodService'
// import { TransactionStatus } from '@/types/status'
// import HeaderHomepage from '@/components/Layout/HeaderHomepage'
// import SiderBar from '@/components/ProfileUser/SiderBar'

// interface Wallet {
//   walletID: number
//   userID: number
//   balance: number
//   currency: string
// }

// const PaymentTest: React.FC = () => {
//   const navigate = useNavigate()
//   const [searchParams] = useSearchParams()
  
//   const [user, setUser] = React.useState<any>(null)
//   const [wallet, setWallet] = React.useState<Wallet | null>(null)
//   const [amount, setAmount] = React.useState<string>('')
//   const [desc, setDesc] = React.useState<string>('Nạp tiền ví EduPrompt')
//   const [loading, setLoading] = React.useState(false)
//   const [fetching, setFetching] = React.useState(true)
//   const [error, setError] = React.useState<string | null>(null)
//   const [selectedPackage, setSelectedPackage] = React.useState<{ packageId: number; packageName: string; price: number } | null>(null)
//   const [success, setSuccess] = React.useState(false)

//   // Fetch user, wallet on mount
//   React.useEffect(() => {
//     ;(async () => {
//       try {
//         setFetching(true)
//         const currentUser = getCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}')
//         if (!currentUser?.userId) {
//           setError('Vui lòng đăng nhập để nạp tiền')
//           return
//         }
//         setUser(currentUser)

//         // Get wallet - thử lấy full wallet info bằng userId trước
//         try {
//           const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
          
//           if (walletData && walletData.walletId) {
//             setWallet({
//               walletID: walletData.walletId,
//               userID: walletData.userId || Number(currentUser.userId),
//               balance: walletData.balance || 0,
//               currency: walletData.currency || 'VND',
//             })
//           }
//         } catch (walletErr: any) {
//           // Nếu không lấy được wallet, thử get balance
//           if (walletErr?.response?.status === 404) {
//             try {
//               const balanceRes = await api.get(`/api/wallets/balance/${Number(currentUser.userId)}`)
//               const balance = (balanceRes as any).data || balanceRes
              
//               if (balance !== null && balance !== undefined) {
//                 setWallet({
//                   walletID: 0, // Sẽ được lấy sau
//                   userID: Number(currentUser.userId),
//                   balance: Number(balance) || 0,
//                   currency: 'VND',
//                 })
//               }
//             } catch (balanceErr: any) {
//               console.warn('Could not get wallet:', balanceErr?.response?.status || balanceErr?.message)
//             }
//           } else {
//             console.warn('Wallet fetch error:', walletErr?.response?.status || walletErr?.message)
//           }
//         }

//         // Xác định nguồn nạp tiền
//         const urlAmount = searchParams.get('amount')
//         const storedAmount = localStorage.getItem('topupAmount')
//         const selectedPackageStr = localStorage.getItem('selectedPackageForPayment')
        
//         if (urlAmount) {
//           localStorage.removeItem('selectedPackageForPayment')
//           setSelectedPackage(null)
//           setAmount(urlAmount)
//           localStorage.setItem('topupAmount', urlAmount)
//           setDesc('Nạp tiền ví EduPrompt')
//         } else if (selectedPackageStr) {
//           try {
//             const pkg = JSON.parse(selectedPackageStr)
//             if (pkg.price && pkg.price > 0) {
//               setSelectedPackage({
//                 packageId: pkg.packageId,
//                 packageName: pkg.packageName,
//                 price: pkg.price
//               })
//               setAmount(String(pkg.price))
//               localStorage.setItem('topupAmount', String(pkg.price))
//               setDesc(`Thanh toán gói ${pkg.packageName}`)
//             } else {
//               localStorage.removeItem('selectedPackageForPayment')
//               setAmount(storedAmount || '200000')
//             }
//           } catch (e) {
//             console.error('Failed to parse selectedPackageForPayment:', e)
//             localStorage.removeItem('selectedPackageForPayment')
//             setAmount(storedAmount || '200000')
//           }
//         } else if (storedAmount) {
//           setAmount(storedAmount)
//           setDesc('Nạp tiền ví EduPrompt')
//         } else {
//           setAmount('200000')
//           setDesc('Nạp tiền ví EduPrompt')
//         }
//       } catch (e: any) {
//         console.error('Initial fetch error:', e)
//         setError(e?.message || 'Không thể tải thông tin')
//       } finally {
//         setFetching(false)
//       }
//     })()
//   }, [])

//   // Update amount when changed and save to localStorage
//   React.useEffect(() => {
//     if (amount) {
//       localStorage.setItem('topupAmount', amount)
//     }
//   }, [amount])

//   const handlePayment = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       setSuccess(false)
      
//       // Validation
//       if (!amount || Number(amount) <= 0) {
//         setError('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)')
//         setLoading(false)
//         return
//       }
      
//       if (Number(amount) < 1000) {
//         setError('Số tiền tối thiểu là 1,000 VND')
//         setLoading(false)
//         return
//       }
      
//       if (!user?.userId) {
//         setError('Vui lòng đăng nhập để thanh toán')
//         setLoading(false)
//         return
//       }
      
//       // Kiểm tra wallet có tồn tại không
//       if (!wallet || !wallet.walletID || wallet.walletID === 0) {
//         const shouldActivate = window.confirm(
//           'Bạn chưa có ví hoặc ví chưa được kích hoạt. Bạn có muốn đi đến trang "Ví của tôi" để kích hoạt ví không?'
//         )
//         if (shouldActivate) {
//           navigate('/wallet')
//           setLoading(false)
//           return
//         } else {
//           setError('Vui lòng kích hoạt ví trước khi nạp tiền. Hãy vào trang "Ví của tôi" để kích hoạt.')
//           setLoading(false)
//           return
//         }
//       }
      
//       const amountNum = Number(amount)
//       if (isNaN(amountNum) || amountNum <= 0) {
//         throw new Error('Số tiền không hợp lệ.')
//       }
      
//       // Lưu số dư cũ để so sánh
//       const oldBalance = wallet.balance || 0
      
//       // 1. Cộng tiền vào wallet trước
//       await walletService.addFunds({
//         userId: user.userId,
//         amount: amountNum,
//       })
//       console.log('✅ Wallet funds added:', amountNum)
      
//       // 2. Tìm hoặc tạo PaymentMethod cho Direct/Internal payment
//       let paymentMethodId = 1 // Default fallback
      
//       try {
//         const methods = await paymentMethodService.getAllPaymentMethods()
        
//         // Tìm PaymentMethod với Provider = "VNPay" hoặc "Direct" hoặc "Internal"
//         let directMethod = methods.find((m: any) => 
//           (m.provider?.toLowerCase().includes('direct')) ||
//           (m.provider?.toLowerCase().includes('internal')) ||
//           (m.methodName?.toLowerCase().includes('direct')) ||
//           (m.methodName?.toLowerCase().includes('internal'))
//         )
        
//         // Nếu không tìm thấy Direct/Internal, thử tìm VNPay (vì backend cần VNPay để tạo transaction)
//         if (!directMethod) {
//           directMethod = methods.find((m: any) => 
//             (m.provider?.toLowerCase() === 'vnpay') ||
//             (m.methodName?.toLowerCase().includes('vnpay'))
//           )
//         }
        
//         // Nếu vẫn không tìm thấy, lấy method đầu tiên
//         if (!directMethod && methods.length > 0) {
//           directMethod = methods[0]
//         }
        
//         if (directMethod) {
//           paymentMethodId = directMethod.paymentMethodId || directMethod.id || 1
//           console.log('✅ Found PaymentMethod:', directMethod.methodName || directMethod.provider, 'ID:', paymentMethodId)
//         } else {
//           console.warn('⚠️ No PaymentMethod found, using default ID: 1')
//         }
//       } catch (methodErr: any) {
//         console.warn('Could not get payment methods, using default:', methodErr)
//       }
      
//       // 3. Tạo Transaction với TransactionType = "TopUp" (theo backend)
//       let transactionId: number | null = null
//       let transactionCreated = false
//       try {
//         const transaction = await transactionService.createTransaction({
//           paymentMethodId,
//           walletId: wallet.walletID,
//           amount: amountNum,
//           transactionType: 'TopUp', // Phải là "TopUp" theo backend, không phải "Deposit"
//         })
        
//         transactionId = transaction.transactionId || transaction.id || null
//         transactionCreated = true
//         console.log('✅ Transaction created:', transaction, 'ID:', transactionId)
        
//         // 4. Update transaction status thành "Completed" ngay sau khi tạo thành công
//         if (transactionId) {
//           try {
//             await transactionService.updateTransaction(transactionId, {
//               status: TransactionStatus.Completed, // "Completed"
//             })
//             console.log('✅ Transaction status updated to Completed')
//           } catch (updateErr: any) {
//             console.warn('⚠️ Could not update transaction status:', updateErr?.response?.status || updateErr?.message)
//             // Tiếp tục dù có lỗi update status
//           }
//         }
//       } catch (transErr: any) {
//         console.error('❌ Failed to create transaction:', transErr?.response?.status, transErr?.response?.data || transErr?.message)
        
//         // Nếu lỗi do PaymentMethod không tồn tại, thử tạo PaymentMethod trước
//         if (transErr?.response?.status === 400 || transErr?.response?.status === 404) {
//           try {
//             console.log('⚠️ Attempting to create PaymentMethod...')
//             const newMethod = await paymentMethodService.createPaymentMethod({
//               methodName: 'Direct Payment',
//               provider: 'Internal',
//             })
            
//             if (newMethod && newMethod.paymentMethodId) {
//               paymentMethodId = newMethod.paymentMethodId
//               console.log('✅ PaymentMethod created:', newMethod.paymentMethodId)
              
//               // Thử tạo transaction lại với PaymentMethod mới
//               try {
//                 const transaction = await transactionService.createTransaction({
//                   paymentMethodId,
//                   walletId: wallet.walletID,
//                   amount: amountNum,
//                   transactionType: 'TopUp',
//                 })
                
//                 transactionId = transaction.transactionId || transaction.id || null
//                 transactionCreated = true
//                 console.log('✅ Transaction created after creating PaymentMethod:', transaction, 'ID:', transactionId)
                
//                 // Update status thành "Completed"
//                 if (transactionId) {
//                   try {
//                     await transactionService.updateTransaction(transactionId, {
//                       status: TransactionStatus.Completed,
//                     })
//                     console.log('✅ Transaction status updated to Completed')
//                   } catch (updateErr: any) {
//                     console.warn('⚠️ Could not update transaction status:', updateErr?.response?.status || updateErr?.message)
//                   }
//                 }
//               } catch (retryErr: any) {
//                 console.error('❌ Still failed to create transaction:', retryErr?.response?.status, retryErr?.response?.data || retryErr?.message)
//               }
//             }
//           } catch (createMethodErr: any) {
//             console.error('❌ Failed to create PaymentMethod:', createMethodErr?.response?.status, createMethodErr?.response?.data || createMethodErr?.message)
//           }
//         }
//       }
      
//       if (!transactionCreated) {
//         console.warn('⚠️ Transaction was not created, but wallet funds were added. Check backend logs.')
//       }
      
//       // 5. Refresh wallet để hiển thị số dư mới
//       try {
//         const walletData = await walletService.getWalletByUserId(Number(user.userId))
//         if (walletData && walletData.walletId) {
//           const newBalance = walletData.balance || 0
//           setWallet({
//             walletID: walletData.walletId,
//             userID: walletData.userId || user.userId,
//             balance: newBalance,
//             currency: walletData.currency || 'VND',
//           })
          
//           console.log('✅ Wallet updated after payment:', {
//             oldBalance,
//             newBalance,
//             addedAmount: newBalance - oldBalance,
//             expectedAmount: amountNum,
//           })
//         }
//       } catch (walletErr) {
//         console.error('Wallet refresh error:', walletErr)
//         // Cộng tiền vào state local để hiển thị ngay
//         setWallet(prev => ({
//           ...prev!,
//           balance: (prev?.balance || 0) + amountNum,
//         }))
//       }
      
//       // 6. Hiển thị thông báo thành công
//       setSuccess(true)
//       const successMessage = `✅ Nạp tiền vào ví thành công!\n\n` +
//         `💰 Số tiền: ${amountNum.toLocaleString('vi-VN')} VND\n` +
//         `💳 Số dư ví: ${wallet?.balance.toLocaleString('vi-VN') || (oldBalance + amountNum).toLocaleString('vi-VN')} VND\n\n` +
//         `Transaction Status: ${transactionCreated ? 'Thành công (Completed)' : 'Chưa tạo (kiểm tra backend)'}`
      
//       alert(successMessage)
      
//       // 7. Lưu thông tin thành công
//       localStorage.setItem('payment_test_success', JSON.stringify({
//         amount: amountNum,
//         oldBalance,
//         newBalance: wallet?.balance || (oldBalance + amountNum),
//         transactionCreated,
//         transactionId,
//         timestamp: new Date().toISOString(),
//       }))
      
//       // 8. Cleanup và navigate
//       localStorage.removeItem('topupAmount')
//       localStorage.removeItem('selectedPackageForPayment')
      
//       // Đợi 2 giây rồi navigate để user thấy thông báo
//       setTimeout(() => {
//         navigate('/wallet')
//       }, 2000)
      
//     } catch (e: any) {
//       console.error('Payment error:', e)
//       const errorMsg = e?.response?.data?.message || e?.message || 'Thanh toán thất bại. Vui lòng thử lại.'
//       setError(errorMsg)
      
//       // Save error to localStorage
//       localStorage.setItem('payment_test_error', JSON.stringify({
//         error: errorMsg,
//         amount,
//         userId: user?.userId,
//         timestamp: new Date().toISOString(),
//       }))
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] text-white">
//       <HeaderHomepage />
//       <div className="flex">
//         <SiderBar />
//         <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
//           {/* Header with line */}
//           <div className="px-10 pt-6 md:pt-10">
//             <div className="max-w-5xl mx-auto text-center">
//               <h1 className="text-2xl md:text-3xl font-bold">Nạp tiền (Test Mode)</h1>
//               <p className="text-neutral-400 mt-1">Thanh toán trực tiếp không qua VNPay</p>
//             </div>
//             <div className="mt-4 h-0.5 -mx-10 bg-white/10"></div>
//           </div>

//           <div className="max-w-5xl mx-auto p-6 md:p-10 pt-6">
//             {fetching ? (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
//                 <p className="mt-4 text-neutral-400">Đang tải thông tin...</p>
//               </div>
//             ) : (
//               <>
//                 {error && (
//                   <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">{error}</div>
//                 )}
//                 {success && (
//                   <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 px-4 py-3">
//                     ✅ Thanh toán thành công! Đang chuyển đến trang ví...
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Summary */}
//                   <div className="relative rounded-2xl p-[2px] overflow-hidden self-start mt-4 md:mt-30">
//                     <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
//                     <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
//                       <h2 className="text-lg font-semibold">Tóm tắt đơn nạp</h2>
                      
//                       {/* Package Info */}
//                       {selectedPackage && (
//                         <div className="mt-4 mb-4 p-3 rounded-lg bg-[#23233a] border border-[#2a2a44]/50">
//                           <div className="text-xs text-neutral-400 mb-1">Gói đã chọn:</div>
//                           <div className="text-sm font-semibold text-white">{selectedPackage.packageName}</div>
//                           <div className="text-xs text-neutral-400 mt-1">Giá gói: {selectedPackage.price.toLocaleString('vi-VN')} VND</div>
//                         </div>
//                       )}
                      
//                       <div className="mt-4 space-y-3 text-sm">
//                         <div className="flex justify-between text-neutral-300">
//                           <span>Số tiền</span>
//                           <span>{Number(amount).toLocaleString('vi-VN')} VND</span>
//                         </div>
//                         <div className="flex justify-between text-neutral-300">
//                           <span>Nội dung</span>
//                           <span className="text-xs break-words text-right max-w-[200px]">{desc}</span>
//                         </div>
//                         <div className="flex justify-between text-neutral-300">
//                           <span>Phí</span>
//                           <span>0 VND</span>
//                         </div>
//                         <div className="border-t border-[#2f2f4a] pt-3 flex justify-between">
//                           <span className="font-semibold">Tổng</span>
//                           <span className="font-semibold text-green-400">{Number(amount).toLocaleString('vi-VN')} VND</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Payment Panel */}
//                   <div className="relative rounded-2xl p-[2px] overflow-hidden self-start">
//                     <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
//                     <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
//                       <div className="flex items-center justify-between">
//                         <h2 className="text-lg font-semibold">Thanh toán trực tiếp</h2>
//                         <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">TEST MODE</span>
//                       </div>

//                       {/* Inputs */}
//                       <div className="mt-4 grid grid-cols-1 gap-3">
//                         <label className="text-sm text-neutral-400">
//                           Số tiền (VND) *
//                           <input 
//                             type="number" 
//                             min="1000"
//                             step="1000"
//                             value={amount} 
//                             onChange={(e) => setAmount(e.target.value)} 
//                             placeholder="Nhập số tiền cần nạp"
//                             className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
//                           />
//                           <p className="text-xs text-neutral-500 mt-1">Số tiền tối thiểu: 1,000 VND</p>
//                         </label>
//                         <label className="text-sm text-neutral-400">
//                           Nội dung thanh toán
//                           <input 
//                             value={desc} 
//                             onChange={(e) => setDesc(e.target.value)} 
//                             placeholder="Nạp tiền ví EduPrompt"
//                             className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
//                           />
//                         </label>
//                       </div>

//                       {/* Actions */}
//                       <div className="mt-5">
//                         <button 
//                           onClick={handlePayment} 
//                           disabled={loading || !amount || Number(amount) < 1000 || success} 
//                           className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           {loading ? (
//                             <>
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                               <span>Đang xử lý thanh toán...</span>
//                             </>
//                           ) : success ? (
//                             <>
//                               <span>✅</span>
//                               <span>Thanh toán thành công!</span>
//                             </>
//                           ) : (
//                             'Thanh toán ngay'
//                           )}
//                         </button>
//                       </div>

//                       {/* Info */}
//                       <div className="mt-5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
//                         <div className="text-xs text-yellow-300 mb-2">⚠️ Chế độ Test</div>
//                         <p className="text-xs text-yellow-200/80">
//                           Thanh toán sẽ được xử lý ngay lập tức:
//                         </p>
//                         <ul className="text-xs text-yellow-200/80 mt-2 space-y-1 list-disc list-inside">
//                           <li>Tiền sẽ được cộng vào ví ngay</li>
//                           <li>Transaction (TopUp) sẽ được tạo với status "Completed"</li>
//                           <li>Lịch sử giao dịch sẽ hiển thị sau khi refresh</li>
//                         </ul>
//                       </div>
                      
//                       {/* Wallet Info */}
//                       {wallet && (
//                         <div className="mt-5 rounded-lg border border-[#2f2f4a] bg-[#23233a] p-4">
//                           <div className="text-sm text-neutral-400 mb-2">Thông tin ví</div>
//                           <div className="flex justify-between items-center">
//                             <span className="text-neutral-300">Số dư hiện tại:</span>
//                             <span className="font-semibold text-green-400">
//                               {wallet.balance.toLocaleString('vi-VN')} {wallet.currency}
//                             </span>
//                           </div>
//                           {amount && (
//                             <div className="flex justify-between items-center mt-2">
//                               <span className="text-neutral-300">Sau khi nạp:</span>
//                               <span className="font-semibold text-sky-400">
//                                 {(wallet.balance + Number(amount)).toLocaleString('vi-VN')} {wallet.currency}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default PaymentTest
