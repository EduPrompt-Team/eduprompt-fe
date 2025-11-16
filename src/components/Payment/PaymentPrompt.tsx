// import React from 'react'
// import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
// import { api, getCurrentUser } from '@/lib/api'
// import { paymentService } from '@/services/paymentService'
// import HeaderHomepage from '@/components/Layout/HeaderHomepage'
// import SiderBar from '@/components/ProfileUser/SiderBar'

// interface Wallet {
//   walletID: number
//   userID: number
//   balance: number
//   currency: string
// }


// const PaymentPrompt: React.FC = () => {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [searchParams] = useSearchParams()
  
//   const [user, setUser] = React.useState<any>(null)
//   const [wallet, setWallet] = React.useState<Wallet | null>(null)
//   const [amount, setAmount] = React.useState<string>('')
//   const [desc, setDesc] = React.useState<string>('Nạp tiền ví EduPrompt')
//   const [loading, setLoading] = React.useState(false)
//   const [fetching, setFetching] = React.useState(true)
//   const [error, setError] = React.useState<string | null>(null)
//   const [vnpayQrCode, setVnpayQrCode] = React.useState<string>('')
//   const [paymentUrl, setPaymentUrl] = React.useState<string>('')
//   const [selectedPackage, setSelectedPackage] = React.useState<{ packageId: number; packageName: string; price: number } | null>(null)

//   // Fetch user, wallet, payment methods on mount
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
//           // Thử 1: GET /api/wallets/user/{userId} - lấy full wallet info
//           const { walletService } = await import('@/services/walletService')
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
//               // Thử 2: GET /api/wallets/balance/{userId} - chỉ lấy balance
//               const balanceRes = await api.get(`/api/wallets/balance/${Number(currentUser.userId)}`)
//               const balance = (balanceRes as any).data || balanceRes
              
//               // Nếu có balance nhưng không có full wallet info, chỉ set balance
//               // WalletId sẽ được lấy khi payment hoặc user kích hoạt ví
//               if (balance !== null && balance !== undefined) {
//                 setWallet({
//                   walletID: 0, // Sẽ được lấy sau
//                   userID: Number(currentUser.userId),
//                   balance: Number(balance) || 0,
//                   currency: 'VND',
//                 })
//               }
//             } catch (balanceErr: any) {
//               // Không có wallet - user sẽ cần kích hoạt ví
//               console.warn('Could not get wallet:', balanceErr?.response?.status || balanceErr?.message)
//             }
//           } else {
//             console.warn('Wallet fetch error:', walletErr?.response?.status || walletErr?.message)
//           }
//         }

//         // Payment methods không bắt buộc cho wallet top-up flow mới
//         // Backend tự động quản lý payment methods

//         // Xác định nguồn nạp tiền:
//         // - Nếu có URL param 'amount' → Nạp từ WalletPage (quick buttons)
//         // - Nếu không có URL param nhưng có topupAmount → Có thể từ WalletPage hoặc PackagePage
//         // - Nếu có selectedPackageForPayment → Nạp từ PackagePage
        
//         const urlAmount = searchParams.get('amount')
//         const storedAmount = localStorage.getItem('topupAmount')
//         const selectedPackageStr = localStorage.getItem('selectedPackageForPayment')
        
//         // Nếu có URL param 'amount' → Chắc chắn là nạp từ WalletPage → Xóa package
//         if (urlAmount) {
//           localStorage.removeItem('selectedPackageForPayment')
//           setSelectedPackage(null)
//           setAmount(urlAmount)
//           localStorage.setItem('topupAmount', urlAmount)
//           setDesc('Nạp tiền ví EduPrompt')
//         } else if (selectedPackageStr) {
//           // Có package → Nạp từ PackagePage
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
//               // Package không hợp lệ
//               localStorage.removeItem('selectedPackageForPayment')
//               if (storedAmount) {
//                 setAmount(storedAmount)
//               } else {
//                 setAmount('200000')
//               }
//             }
//           } catch (e) {
//             console.error('Failed to parse selectedPackageForPayment:', e)
//             localStorage.removeItem('selectedPackageForPayment')
//             if (storedAmount) {
//               setAmount(storedAmount)
//             } else {
//               setAmount('200000')
//             }
//           }
//         } else if (storedAmount) {
//           // Không có package và không có URL param → Nạp từ WalletPage (button "Nạp tiền vô ví")
//           setAmount(storedAmount)
//           setDesc('Nạp tiền ví EduPrompt')
//         } else {
//           // Mặc định
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

//   // Handle VNPay return callback
//   React.useEffect(() => {
//     const params = new URLSearchParams(location.search)
//     const responseCode = params.get('vnp_ResponseCode')
//     const amountParam = params.get('vnp_Amount')
//     const transactionNo = params.get('vnp_TransactionNo')
//     const txnRef = params.get('vnp_TxnRef')
//     const orderInfo = params.get('vnp_OrderInfo')
    
//     if (responseCode) {
//       ;(async () => {
//         try {
//           setLoading(true)
//           const currentUser = getCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}')
          
//           // Save callback info to localStorage
//           const callbackInfo = {
//             responseCode,
//             amount: amountParam,
//             transactionNo,
//             txnRef,
//             orderInfo,
//             timestamp: new Date().toISOString(),
//             allParams: Object.fromEntries(params.entries()),
//           }
//           localStorage.setItem('vnpay_callback', JSON.stringify(callbackInfo))
          
//           if (responseCode === '00') {
//             const vnd = amountParam ? Number(amountParam) / 100 : 0
            
//             // Backend tự động xử lý:
//             // - Cập nhật Payment status = "Paid"
//             // - Nạp tiền vào wallet: wallet.balance += amount
//             // - Tạo Transaction với TransactionType = "TopUp"
//             // Frontend cần refresh wallet để hiển thị số tiền mới
            
//             // Lưu số dư cũ để so sánh
//             const oldBalance = wallet?.balance || 0
            
//             // Refresh wallet - lấy full wallet info để đảm bảo cập nhật đầy đủ
//             if (currentUser?.userId) {
//               try {
//                 // Thử lấy full wallet info trước (có walletId và balance mới nhất)
//                 const { walletService } = await import('@/services/walletService')
//                 try {
//                   const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
//                   if (walletData && walletData.walletId) {
//                     const newBalance = walletData.balance || 0
//                     setWallet({
//                       walletID: walletData.walletId,
//                       userID: walletData.userId || Number(currentUser.userId),
//                       balance: newBalance,
//                       currency: walletData.currency || 'VND',
//                     })
                    
//                     // Log để debug
//                     console.log('Wallet updated after payment:', {
//                       oldBalance,
//                       newBalance,
//                       addedAmount: newBalance - oldBalance,
//                       expectedAmount: vnd,
//                     })
//                   }
//                 } catch (fullWalletErr: any) {
//                   // Nếu không lấy được full wallet, thử chỉ lấy balance
//                   if (fullWalletErr?.response?.status === 404) {
//                     const balanceRes = await api.get(`/api/wallets/balance/${Number(currentUser.userId)}`)
//                     const balance = (balanceRes as any).data || balanceRes
//                     if (balance !== null && balance !== undefined) {
//                       const newBalance = Number(balance) || 0
//                       setWallet(prev => ({
//                         walletID: prev?.walletID || 0,
//                         userID: Number(currentUser.userId),
//                         balance: newBalance,
//                         currency: prev?.currency || 'VND',
//                       }))
                      
//                       console.log('Wallet balance updated:', {
//                         oldBalance,
//                         newBalance,
//                         addedAmount: newBalance - oldBalance,
//                         expectedAmount: vnd,
//                       })
//                     }
//                   } else {
//                     throw fullWalletErr
//                   }
//                 }
//               } catch (walletErr) {
//                 console.error('Wallet refresh error:', walletErr)
//                 // Continue even if refresh fails - backend already credited the wallet
//                 // Cộng tiền vào state local để hiển thị ngay (sẽ được sync lại khi vào WalletPage)
//                 if (wallet) {
//                   setWallet(prev => ({
//                     ...prev!,
//                     balance: (prev?.balance || 0) + vnd,
//                   }))
//                 }
//               }
//             }
            
//             // Save success info với thông tin chi tiết
//             const successInfo = {
//               amount: vnd,
//               transactionNo,
//               txnRef,
//               oldBalance,
//               newBalance: wallet?.balance || (oldBalance + vnd),
//               timestamp: new Date().toISOString(),
//             }
//             localStorage.setItem('vnpay_success', JSON.stringify(successInfo))
            
//             // Determine message based on TxnRef prefix
//             let successMessage = `Nạp tiền thành công!\n\n`
//             successMessage += `Số tiền đã nạp: ${vnd.toLocaleString('vi-VN')} VND\n`
//             if (wallet) {
//               successMessage += `Số dư hiện tại: ${wallet.balance.toLocaleString('vi-VN')} VND`
//             }
            
//             if (txnRef?.startsWith('WLT-')) {
//               successMessage = `✅ Nạp tiền vào ví thành công!\n\n` +
//                 `💰 Số tiền: ${vnd.toLocaleString('vi-VN')} VND\n` +
//                 `💳 Số dư ví: ${wallet?.balance.toLocaleString('vi-VN') || 'Đang cập nhật...'} VND\n\n` +
//                 `Payment Status: Đã thanh toán (Paid)`
//             } else if (txnRef?.startsWith('TXN-')) {
//               successMessage = `✅ Thanh toán transaction thành công!\n\n` +
//                 `💰 Số tiền: ${vnd.toLocaleString('vi-VN')} VND`
//             } else if (txnRef?.startsWith('ORD-')) {
//               successMessage = `✅ Thanh toán đơn hàng thành công!\n\n` +
//                 `💰 Số tiền: ${vnd.toLocaleString('vi-VN')} VND`
//             }
            
//             alert(successMessage)
//             localStorage.removeItem('topupAmount')
//             localStorage.removeItem('selectedPackageForPayment') // Xóa thông tin package sau khi thanh toán thành công
//             navigate('/wallet')
//           } else {
//             setError(`Thanh toán thất bại. Mã lỗi: ${responseCode}`)
//             localStorage.setItem('vnpay_failed', JSON.stringify({
//               responseCode,
//               message: params.get('vnp_ResponseMessage') || 'Unknown error',
//               timestamp: new Date().toISOString(),
//             }))
//           }
//         } catch (e: any) {
//           console.error('VNPay callback error:', e)
//           setError('Xử lý kết quả thanh toán thất bại')
//         } finally {
//           setLoading(false)
//         }
//       })()
//     }
//   }, [location.search, navigate])

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
      
//       // Validation
//       if (!amount || Number(amount) <= 0) {
//         setError('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)')
//         return
//       }
      
//       if (Number(amount) < 1000) {
//         setError('Số tiền tối thiểu là 1,000 VND')
//         return
//       }
      
//       if (!user?.userId) {
//         setError('Vui lòng đăng nhập để thanh toán')
//         setLoading(false)
//         return
//       }
      
//       // Kiểm tra wallet có tồn tại không
//       // Nếu không có wallet, yêu cầu user kích hoạt ví trước
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
      
//       const returnUrl = `${window.location.origin}/wallet/topup`
      
//       // Save payment info to localStorage
//       const paymentInfo = {
//         userId: user.userId,
//         amount: amountNum,
//         description: desc,
//         returnUrl,
//         timestamp: new Date().toISOString(),
//       }
//       localStorage.setItem('vnpay_payment_info', JSON.stringify(paymentInfo))
      
//       // Theo Swagger, endpoint là: POST /api/payments/wallets/{walletId}/topup
//       // Nhưng nếu backend không có endpoint get wallet by userId,
//       // có thể backend sẽ tự động tạo wallet hoặc lấy walletId từ userId
//       // Hoặc endpoint có thể là: POST /api/payments/wallets/topup với userId trong body
      
//       // Thử gọi với walletId = 0 hoặc userId, backend sẽ xử lý
//       // Hoặc có thể backend có endpoint khác
      
//       // Cần walletId để gọi payment endpoint
//       // Theo Swagger: POST /api/payments/wallets/{walletId}/topup
//       // Backend yêu cầu walletId hợp lệ và phải tồn tại trong DB
      
//       let walletIdToUse = wallet?.walletID || 0
      
//       // Nếu không có walletId, thử tạo wallet trước
//       if (!walletIdToUse || walletIdToUse === 0 || walletIdToUse === null || walletIdToUse === undefined) {
//         try {
//           console.log('Creating wallet for user:', user.userId)
          
//           // Thử tạo wallet - backend sẽ tự map với userId hiện tại
//           const createWalletRes = await api.post('/api/wallets', {})
//           const newWallet = (createWalletRes as any).data || createWalletRes
//           walletIdToUse = newWallet?.walletId ?? newWallet?.walletID ?? 0
          
//           if (walletIdToUse > 0 && !isNaN(walletIdToUse)) {
//             console.log('Wallet created/found with ID:', walletIdToUse)
//             setWallet({
//               walletID: walletIdToUse,
//               userID: user.userId,
//               balance: wallet?.balance || 0,
//               currency: 'VND',
//             })
//           } else {
//             // Nếu không nhận được walletId, có thể wallet đã tồn tại
//             // Thử get wallet bằng userId (nếu có endpoint)
//             throw new Error('Không nhận được walletId từ server. Vui lòng kích hoạt ví từ trang Ví của tôi trước.')
//           }
//         } catch (createErr: any) {
//           console.error('Failed to get/create wallet:', createErr)
//           const errorMsg = createErr?.response?.data?.message || createErr?.message || 'Unknown error'
          
//           // Nếu lỗi 400 hoặc 409 (conflict) = wallet có thể đã tồn tại
//           if (createErr?.response?.status === 400 || createErr?.response?.status === 409) {
//             throw new Error('Ví của bạn đã tồn tại nhưng chưa được kích hoạt. Vui lòng vào trang "Ví của tôi" để kích hoạt ví trước khi nạp tiền.')
//           }
          
//           throw new Error(`Không thể tạo hoặc lấy thông tin ví. Vui lòng vào trang "Ví của tôi" để kích hoạt ví trước khi nạp tiền. Chi tiết: ${errorMsg}`)
//         }
//       }
      
//       // Validate walletId trước khi gọi API
//       if (!walletIdToUse || walletIdToUse <= 0 || isNaN(walletIdToUse)) {
//         throw new Error('Wallet ID không hợp lệ. Vui lòng vào trang "Ví của tôi" để kích hoạt ví trước khi nạp tiền.')
//       }
      
//       // Chỉ gửi các field có giá trị (không gửi undefined)
//       const requestPayload: any = {
//         amount: amountNum,
//         language: 'vn',
//       }
      
//       if (returnUrl) {
//         requestPayload.returnUrl = returnUrl
//       }
      
//       console.log('Creating VNPay URL for wallet top-up:', {
//         walletId: walletIdToUse,
//         userId: user.userId,
//         payload: requestPayload,
//       })
      
//       const paymentUrl = await paymentService.topupWalletWithVnpay(walletIdToUse, requestPayload)
      
//       if (paymentUrl) {
//         setPaymentUrl(paymentUrl)
        
//         // Generate QR code from payment URL (for display)
//         setVnpayQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`)
        
//         // Save payment URL to localStorage
//         localStorage.setItem('vnpay_payment_url', paymentUrl)
        
//         // Redirect to VNPay
//         window.location.href = paymentUrl
//       } else {
//         throw new Error('Không nhận được payment URL từ server')
//       }
//     } catch (e: any) {
//       console.error('VNPay create error:', e)
//       console.error('Error details:', {
//         message: e?.message,
//         response: e?.response,
//         status: e?.response?.status,
//         data: e?.response?.data,
//         config: e?.config,
//       })
      
//       const status = e?.response?.status
//       const data = e?.response?.data
//       const statusText = e?.response?.statusText
      
//       let errorMsg = 'Không tạo được link thanh toán VNPay'
      
//       if (status === 404) {
//         errorMsg = 'Không tìm thấy ví hoặc endpoint không khả dụng. Vui lòng kiểm tra lại.'
//       } else if (status === 400) {
//         errorMsg = data?.message || data?.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra số tiền và thông tin ví.'
//       } else if (status === 403) {
//         errorMsg = 'Bạn không có quyền thực hiện thao tác này.'
//       } else if (status === 500) {
//         // Lỗi 500 - Server error
//         const serverErrorMsg = data?.message || data?.error || data?.title || statusText || 'Lỗi server nội bộ'
//         errorMsg = `Lỗi server (500): ${serverErrorMsg}`
        
//         // Thêm thông tin hữu ích cho user
//         if (data?.path) {
//           console.error('Failed endpoint:', data.path)
//           // Nếu là endpoint wallet topup, có thể do:
//           // - Wallet không tồn tại
//           // - VNPay chưa được config trên backend
//           // - Backend endpoint chưa được implement đầy đủ
//           if (data.path.includes('/wallets') && data.path.includes('/topup')) {
//             errorMsg = `Lỗi server khi tạo link thanh toán. Có thể do:
// - VNPay chưa được cấu hình trên server
// - Ví không tồn tại hoặc không hợp lệ
// - Endpoint chưa sẵn sàng

// Vui lòng thử lại sau hoặc liên hệ support.
// Chi tiết: ${serverErrorMsg}`
//           }
//         }
        
//         // Hiển thị thông tin debug chi tiết hơn
//         console.error('Server error details:', {
//           message: data?.message,
//           error: data?.error,
//           path: data?.path,
//           statusCode: data?.statusCode,
//           timestamp: data?.timestamp,
//           stackTrace: data?.stackTrace,
//           innerException: data?.innerException,
//         })
        
//         // Nếu có thông tin chi tiết từ backend, hiển thị
//         if (data?.stackTrace || data?.innerException) {
//           console.error('Backend stack trace:', data.stackTrace || data.innerException)
//         }
//       } else if (data?.message) {
//         errorMsg = data.message
//       } else if (data?.error) {
//         errorMsg = data.error
//       } else if (e?.message) {
//         errorMsg = e.message
//       }
      
//       setError(errorMsg)
      
//       // Save error to localStorage với thông tin chi tiết
//       localStorage.setItem('vnpay_error', JSON.stringify({
//         error: errorMsg,
//         status,
//         statusText,
//         data,
//         request: {
//           walletId: wallet?.walletID,
//           amount: amount,
//           returnUrl: `${window.location.origin}/wallet/topup`,
//         },
//         timestamp: new Date().toISOString(),
//       }))
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
//               <h1 className="text-2xl md:text-3xl font-bold">Nạp tiền VNPay</h1>
//               <p className="text-neutral-400 mt-1">Thanh toán an toàn qua VNPay</p>
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
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Summary */}
//           <div className="relative rounded-2xl p-[2px] overflow-hidden self-start mt-4 md:mt-30">
//             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
//             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
//               <h2 className="text-lg font-semibold">Tóm tắt đơn nạp</h2>
              
//               {/* Package Info */}
//               {selectedPackage && (
//                 <div className="mt-4 mb-4 p-3 rounded-lg bg-[#23233a] border border-[#2a2a44]/50">
//                   <div className="text-xs text-neutral-400 mb-1">Gói đã chọn:</div>
//                   <div className="text-sm font-semibold text-white">{selectedPackage.packageName}</div>
//                   <div className="text-xs text-neutral-400 mt-1">Giá gói: {selectedPackage.price.toLocaleString('vi-VN')} VND</div>
//                 </div>
//               )}
              
//               <div className="mt-4 space-y-3 text-sm">
//                 <div className="flex justify-between text-neutral-300">
//                   <span>Số tiền</span>
//                   <span>{Number(amount).toLocaleString('vi-VN')} VND</span>
//                 </div>
//                 <div className="flex justify-between text-neutral-300">
//                   <span>Nội dung</span>
//                   <span className="text-xs break-words text-right max-w-[200px]">{desc}</span>
//                 </div>
//                 <div className="flex justify-between text-neutral-300">
//                   <span>Phí</span>
//                   <span>0 VND</span>
//                 </div>
//                 <div className="border-t border-[#2f2f4a] pt-3 flex justify-between">
//                   <span className="font-semibold">Tổng</span>
//                   <span className="font-semibold text-green-400">{Number(amount).toLocaleString('vi-VN')} VND</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* VNPay Panel + VietQR Preview */}
//           <div className="relative rounded-2xl p-[2px] overflow-hidden self-start">
//             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
//             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold">Thanh toán với VNPay</h2>
//                 <span className="text-xs text-neutral-400">VNPay</span>
//               </div>

//               {/* Inputs */}
//               <div className="mt-4 grid grid-cols-1 gap-3">
//                 <label className="text-sm text-neutral-400">
//                   Số tiền (VND) *
//                   <input 
//                     type="number" 
//                     min="1000"
//                     step="1000"
//                     value={amount} 
//                     onChange={(e) => setAmount(e.target.value)} 
//                     placeholder="Nhập số tiền cần nạp"
//                     className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
//                   />
//                   <p className="text-xs text-neutral-500 mt-1">Số tiền tối thiểu: 1,000 VND</p>
//                 </label>
//                 <label className="text-sm text-neutral-400">
//                   Nội dung thanh toán
//                   <input 
//                     value={desc} 
//                     onChange={(e) => setDesc(e.target.value)} 
//                     placeholder="Nạp tiền ví EduPrompt"
//                     className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
//                   />
//                 </label>
//               </div>

//               {/* Actions */}
//               <div className="mt-5 flex flex-wrap gap-3">
//                 <button 
//                   onClick={handlePayment} 
//                   disabled={loading || !amount || Number(amount) < 1000} 
//                   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Đang tạo link thanh toán...' : 'Thanh toán bằng VNPay QR'}
//                 </button>
//                 {paymentUrl && (
//                   <button 
//                     className="px-5 py-2.5 rounded-full bg-[#2a2a44] hover:bg-[#3a3a54] text-white text-sm font-medium" 
//                     onClick={() => {
//                       navigator.clipboard.writeText(paymentUrl)
//                       alert('Đã sao chép link thanh toán!')
//                     }}
//                   >
//                     Sao chép link thanh toán
//                   </button>
//                 )}
//               </div>

//               {/* Info + VNPay QR Preview */}
//               <div className="mt-5 grid grid-cols-1 gap-4">
//                 <div className="rounded-lg border border-dashed border-[#2f2f4a] bg-[#23233a] p-6 text-center text-neutral-400">
//                   {paymentUrl ? (
//                     <>
//                       <p className="mb-2">Thanh toán qua VNPay QR Code</p>
//                       <p className="text-xs">Quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
//                     </>
//                   ) : (
//                     'VNPay sẽ chuyển hướng bạn tới trang thanh toán'
//                   )}
//                 </div>
//                 {vnpayQrCode && (
//                   <div className="rounded-lg border border-[#2f2f4a] bg-[#23233a] p-4 flex flex-col items-center justify-center">
//                     <div className="text-sm text-neutral-400 mb-2">QR Code thanh toán VNPay</div>
//                     <img
//                       alt="VNPay QR Code"
//                       className="w-64 h-64 object-contain"
//                       src={vnpayQrCode}
//                       onError={(e) => {
//                         // Fallback if QR code generation fails
//                         (e.currentTarget as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl || 'PAY ' + amount + ' VND - ' + desc)}`
//                       }}
//                     />
//                     <div className="text-xs text-neutral-500 mt-2">
//                       Số tiền: {Number(amount).toLocaleString('vi-VN')} VND
//                     </div>
//                     <div className="text-xs text-neutral-500">Quét QR để thanh toán 24/7</div>
//                   </div>
//                 )}
//               </div>
              
//               {/* Wallet Info */}
//               {wallet && (
//                 <div className="mt-5 rounded-lg border border-[#2f2f4a] bg-[#23233a] p-4">
//                   <div className="text-sm text-neutral-400 mb-2">Thông tin ví</div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-neutral-300">Số dư hiện tại:</span>
//                     <span className="font-semibold text-green-400">
//                       {wallet.balance.toLocaleString('vi-VN')} {wallet.currency}
//                     </span>
//                   </div>
//                   {amount && (
//                     <div className="flex justify-between items-center mt-2">
//                       <span className="text-neutral-300">Sau khi nạp:</span>
//                       <span className="font-semibold text-sky-400">
//                         {(wallet.balance + Number(amount)).toLocaleString('vi-VN')} {wallet.currency}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default PaymentPrompt
import React from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { api, getCurrentUser } from '@/lib/api'
import { walletService } from '@/services/walletService'
import { transactionService } from '@/services/transactionService'
import { paymentMethodService } from '@/services/paymentMethodService'
import { paymentService } from '@/services/paymentService'
import { TransactionStatus } from '@/types/status'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { useToast } from '@/components/ui/toast'

interface Wallet {
  walletID: number
  userID: number
  balance: number
  currency: string
}

const PaymentPrompt: React.FC = () => {
    const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  
  const [user, setUser] = React.useState<any>(null)
  const [wallet, setWallet] = React.useState<Wallet | null>(null)
  const [amount, setAmount] = React.useState<string>('')
  const [desc, setDesc] = React.useState<string>('Nạp tiền ví EduPrompt')
  const [loading, setLoading] = React.useState(false)
  const [vnpayLoading, setVnpayLoading] = React.useState(false)
  const [fetching, setFetching] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = React.useState<{ packageId: number; packageName: string; price: number } | null>(null)
  const [success, setSuccess] = React.useState(false)

  // Fetch user, wallet on mount
  React.useEffect(() => {
    ;(async () => {
      try {
        setFetching(true)
        const currentUser = getCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}')
        if (!currentUser?.userId) {
          setError('Vui lòng đăng nhập để nạp tiền')
          return
        }
        setUser(currentUser)

        // Get wallet - thử lấy full wallet info bằng userId trước
        try {
          const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
          
          if (walletData && walletData.walletId) {
            setWallet({
              walletID: walletData.walletId,
              userID: walletData.userId || Number(currentUser.userId),
              balance: walletData.balance || 0,
              currency: walletData.currency || 'VND',
            })
          }
        } catch (walletErr: any) {
          // Nếu không lấy được wallet, thử get balance
          if (walletErr?.response?.status === 404) {
            try {
              const balanceRes = await api.get(`/api/wallets/balance/${Number(currentUser.userId)}`)
              const balance = (balanceRes as any).data || balanceRes
              
              if (balance !== null && balance !== undefined) {
                setWallet({
                  walletID: 0, // Sẽ được lấy sau
                  userID: Number(currentUser.userId),
                  balance: Number(balance) || 0,
                  currency: 'VND',
                })
              }
            } catch (balanceErr: any) {
              console.warn('Could not get wallet:', balanceErr?.response?.status || balanceErr?.message)
            }
          } else {
            console.warn('Wallet fetch error:', walletErr?.response?.status || walletErr?.message)
          }
        }

        // Xác định nguồn nạp tiền
        const urlAmount = searchParams.get('amount')
        const storedAmount = localStorage.getItem('topupAmount')
        const selectedPackageStr = localStorage.getItem('selectedPackageForPayment')
        
        if (urlAmount) {
          localStorage.removeItem('selectedPackageForPayment')
          setSelectedPackage(null)
          setAmount(urlAmount)
          localStorage.setItem('topupAmount', urlAmount)
          setDesc('Nạp tiền ví EduPrompt')
        } else if (selectedPackageStr) {
          try {
            const pkg = JSON.parse(selectedPackageStr)
            if (pkg.price && pkg.price > 0) {
              setSelectedPackage({
                packageId: pkg.packageId,
                packageName: pkg.packageName,
                price: pkg.price
              })
              setAmount(String(pkg.price))
              localStorage.setItem('topupAmount', String(pkg.price))
              setDesc(`Thanh toán gói ${pkg.packageName}`)
            } else {
              localStorage.removeItem('selectedPackageForPayment')
              setAmount(storedAmount || '200000')
            }
          } catch (e) {
            console.error('Failed to parse selectedPackageForPayment:', e)
            localStorage.removeItem('selectedPackageForPayment')
            setAmount(storedAmount || '200000')
          }
        } else if (storedAmount) {
          setAmount(storedAmount)
          setDesc('Nạp tiền ví EduPrompt')
        } else {
          setAmount('200000')
          setDesc('Nạp tiền ví EduPrompt')
        }
      } catch (e: any) {
        console.error('Initial fetch error:', e)
        setError(e?.message || 'Không thể tải thông tin')
      } finally {
        setFetching(false)
      }
    })()
  }, [])

  // Handle VNPay return callback
  React.useEffect(() => {
    // Log current URL for debugging
    console.log('🔍 PaymentPrompt - Current URL:', window.location.href);
    console.log('🔍 PaymentPrompt - Location search:', location.search);
    
    const params = new URLSearchParams(location.search)
    const responseCode = params.get('vnp_ResponseCode')
    const amountParam = params.get('vnp_Amount')
    const transactionNo = params.get('vnp_TransactionNo')
    const txnRef = params.get('vnp_TxnRef')
    const orderInfo = params.get('vnp_OrderInfo')
    const transactionStatus = params.get('vnp_TransactionStatus')
    const secureHash = params.get('vnp_SecureHash')
    
    // Log all params for debugging
    console.log('🔍 PaymentPrompt - All URL params:', {
      responseCode,
      txnRef,
      amountParam,
      transactionNo,
      orderInfo,
      transactionStatus,
      secureHash,
      allParams: Object.fromEntries(params.entries())
    });
    
    if (responseCode) {
      ;(async () => {
        try {
          setVnpayLoading(true)
          const currentUser = getCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}')
          
          if (responseCode === '00') {
            const vnd = amountParam ? Number(amountParam) / 100 : 0
            
            // Call backend to process callback FIRST
            console.log('📞 PaymentPrompt - Calling backend to process VNPay callback...');
            try {
              const callbackData = {
                vnp_TmnCode: params.get('vnp_TmnCode') || '',
                vnp_Amount: amountParam || '',
                vnp_BankCode: params.get('vnp_BankCode') || '',
                vnp_BankTranNo: params.get('vnp_BankTranNo') || '',
                vnp_CardType: params.get('vnp_CardType') || '',
                vnp_PayDate: params.get('vnp_PayDate') || '',
                vnp_OrderInfo: orderInfo || '',
                vnp_TransactionNo: transactionNo || '',
                vnp_ResponseCode: responseCode,
                vnp_TransactionStatus: transactionStatus || '',
                vnp_TxnRef: txnRef || '',
                vnp_SecureHash: secureHash || '',
              };
              
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5217';
              const response = await fetch(`${apiBaseUrl}/api/payments/vnpay-process-callback`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(callbackData),
              });
              
              const result = await response.json();
              console.log('✅ PaymentPrompt - Backend callback result:', result);
              
              if (!result.success) {
                console.error('❌ PaymentPrompt - Backend callback failed:', result);
                throw new Error(result.message || 'Backend callback failed');
              }
            } catch (callbackErr: any) {
              console.error('❌ PaymentPrompt - Error calling backend callback:', callbackErr);
              // Continue anyway - backend might have processed it via IPN
            }
            
            // Refresh wallet để hiển thị số tiền mới
            if (currentUser?.userId) {
              try {
                const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
                if (walletData && walletData.walletId) {
                  const newBalance = walletData.balance || 0
                  setWallet({
                    walletID: walletData.walletId,
                    userID: walletData.userId || Number(currentUser.userId),
                    balance: newBalance,
                    currency: walletData.currency || 'VND',
                  })
                  console.log('✅ PaymentPrompt - Wallet refreshed, new balance:', newBalance);
                }
              } catch (walletErr) {
                console.error('Wallet refresh error:', walletErr)
              }
            }
            
            // Save success info
            localStorage.setItem('vnpay_success', JSON.stringify({
              amount: vnd,
              transactionNo,
              txnRef,
              timestamp: new Date().toISOString(),
            }))
            
            showToast(`✅ Nạp tiền thành công! Số tiền: ${vnd.toLocaleString('vi-VN')} VND`, 'success', 5000)
            localStorage.removeItem('topupAmount')
            localStorage.removeItem('selectedPackageForPayment')
            
            setTimeout(() => {
              navigate('/wallet')
            }, 2000)
          } else {
            setError(`Thanh toán thất bại. Mã lỗi: ${responseCode}`)
            localStorage.setItem('vnpay_failed', JSON.stringify({
              responseCode,
              message: params.get('vnp_ResponseMessage') || 'Unknown error',
              timestamp: new Date().toISOString(),
            }))
          }
        } catch (e: any) {
          console.error('VNPay callback error:', e)
          setError('Xử lý kết quả thanh toán thất bại')
        } finally {
          setVnpayLoading(false)
        }
      })()
    }
  }, [location.search, navigate, showToast])

  // Update amount when changed and save to localStorage
  React.useEffect(() => {
    if (amount) {
      localStorage.setItem('topupAmount', amount)
    }
  }, [amount])

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      // Validation
      if (!amount || Number(amount) <= 0) {
        setError('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)')
        setLoading(false)
        return
      }
      
      if (Number(amount) < 1000) {
        setError('Số tiền tối thiểu là 1,000 VND')
        setLoading(false)
        return
      }
      
      if (!user?.userId) {
        setError('Vui lòng đăng nhập để thanh toán')
        setLoading(false)
        return
      }
      
      // Test Mode chỉ cần userId, không cần walletId
      // Nếu chưa có wallet, backend sẽ tự tạo khi gọi addFunds
      
      const amountNum = Number(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Số tiền không hợp lệ.')
      }
      
      // Lưu số dư cũ để so sánh
      const oldBalance = wallet?.balance || 0
      
      // 1. Đảm bảo wallet tồn tại trước khi add funds
      let currentWallet
      try {
        currentWallet = await walletService.getMyWallet()
      } catch (walletErr: any) {
        // Nếu wallet chưa tồn tại, tạo wallet trước
        if (walletErr?.response?.status === 404) {
          console.log('Wallet not found, creating new wallet...')
          currentWallet = await walletService.createWallet()
        } else {
          throw walletErr
        }
      }
      
      // 2. Cộng tiền vào wallet
      await walletService.addFunds({
        userId: Number(user.userId),
        amount: amountNum,
      })
      console.log('✅ Wallet funds added:', amountNum)
      
      // 2. Tìm hoặc tạo PaymentMethod cho Direct/Internal payment
      let paymentMethodId = 1 // Default fallback
      
      try {
        const methods = await paymentMethodService.getAllPaymentMethods()
        
        // Tìm PaymentMethod với Provider = "VNPay" hoặc "Direct" hoặc "Internal"
        let directMethod = methods.find((m: any) => 
          (m.provider?.toLowerCase().includes('direct')) ||
          (m.provider?.toLowerCase().includes('internal')) ||
          (m.methodName?.toLowerCase().includes('direct')) ||
          (m.methodName?.toLowerCase().includes('internal'))
        )
        
        // Nếu không tìm thấy Direct/Internal, thử tìm VNPay (vì backend cần VNPay để tạo transaction)
        if (!directMethod) {
          directMethod = methods.find((m: any) => 
            (m.provider?.toLowerCase() === 'vnpay') ||
            (m.methodName?.toLowerCase().includes('vnpay'))
          )
    }
        
        // Nếu vẫn không tìm thấy, lấy method đầu tiên
        if (!directMethod && methods.length > 0) {
          directMethod = methods[0]
        }
        
        if (directMethod) {
          paymentMethodId = directMethod.paymentMethodId || directMethod.id || 1
          console.log('✅ Found PaymentMethod:', directMethod.methodName || directMethod.provider, 'ID:', paymentMethodId)
        } else {
          console.warn('⚠️ No PaymentMethod found, using default ID: 1')
        }
      } catch (methodErr: any) {
        console.warn('Could not get payment methods, using default:', methodErr)
      }
      
      // 3. Tạo Transaction với TransactionType = "TopUp" (theo backend)
      // Status = "Completed" vì đây là test mode, thanh toán thành công ngay
      // Sử dụng transactionReference hoặc description để lưu nội dung thanh toán
      let transactionId: number | null = null
      let transactionCreated = false
      
      // Chỉ tạo transaction nếu có walletId
      if (wallet && wallet.walletID && wallet.walletID > 0) {
        try {
          const transaction = await transactionService.createTransaction({
            paymentMethodId,
            walletId: wallet.walletID,
            amount: amountNum,
            transactionType: 'TopUp', // Phải là "TopUp" theo backend, không phải "Deposit"
            status: 'Completed', // Test mode: thanh toán thành công ngay
            transactionReference: desc || `Nạp tiền ví EduPrompt - ${new Date().toISOString()}`, // Lưu nội dung thanh toán
            description: desc || 'Nạp tiền ví EduPrompt', // Thêm description nếu backend hỗ trợ
          })
          
          transactionId = transaction.transactionId || transaction.id || null
          transactionCreated = true
          console.log('✅ Transaction created with status Completed:', transaction, 'ID:', transactionId)
        } catch (transErr: any) {
          console.warn('⚠️ Could not create transaction (wallet may not exist yet):', transErr?.response?.status || transErr?.message)
          // Tiếp tục dù không tạo được transaction - backend có thể tự tạo wallet
        }
      } else {
        console.log('⚠️ No walletId, skipping transaction creation. Wallet will be created by backend if needed.')
      }
      
      if (!transactionCreated) {
        console.warn('⚠️ Transaction was not created, but wallet funds were added. Check backend logs.')
      }
      
      // 4. Refresh wallet để hiển thị số dư mới
      let finalBalance = oldBalance + amountNum
      try {
        const walletData = await walletService.getWalletByUserId(Number(user.userId))
        if (walletData && walletData.walletId) {
          const newBalance = walletData.balance || 0
          finalBalance = newBalance
          setWallet({
            walletID: walletData.walletId,
            userID: walletData.userId || user.userId,
            balance: newBalance,
            currency: walletData.currency || 'VND',
          })
          
          console.log('✅ Wallet updated after payment:', {
            oldBalance,
            newBalance,
            addedAmount: newBalance - oldBalance,
            expectedAmount: amountNum,
          })
        }
      } catch (walletErr) {
        console.error('Wallet refresh error:', walletErr)
        // Cộng tiền vào state local để hiển thị ngay
        setWallet(prev => ({
          ...prev!,
          balance: (prev?.balance || 0) + amountNum,
        }))
      }
      
      // 5. Hiển thị thông báo thành công
      setSuccess(true)
      const successMessage = `Nạp tiền vào ví thành công!\n\n` +
        `Số tiền: ${amountNum.toLocaleString('vi-VN')} VND\n` +
        `Số dư ví: ${finalBalance.toLocaleString('vi-VN')} VND\n\n` +
        `Transaction Status: ${transactionCreated ? 'Thành công (Completed)' : 'Chưa tạo (kiểm tra backend)'}`
      
      showToast(successMessage, 'success', 5000)
      
      // Refresh wallet để lấy walletId mới nếu backend đã tạo wallet
      try {
        const walletData = await walletService.getWalletByUserId(Number(user.userId))
        if (walletData && walletData.walletId) {
          setWallet({
            walletID: walletData.walletId,
            userID: walletData.userId || user.userId,
            balance: walletData.balance || 0,
            currency: walletData.currency || 'VND',
          })
        }
      } catch (walletErr) {
        console.warn('Could not refresh wallet:', walletErr)
      }
      
      // 7. Lưu thông tin thành công
      localStorage.setItem('payment_test_success', JSON.stringify({
        amount: amountNum,
        oldBalance,
        newBalance: wallet?.balance || (oldBalance + amountNum),
        transactionCreated,
        transactionId,
        timestamp: new Date().toISOString(),
      }))
      
      // 8. Cleanup và navigate
      localStorage.removeItem('topupAmount')
      localStorage.removeItem('selectedPackageForPayment')
      
      // Đợi 2 giây rồi navigate để user thấy thông báo
      setTimeout(() => {
        navigate('/wallet')
      }, 2000)
      
    } catch (e: any) {
      console.error('Payment error:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Thanh toán thất bại. Vui lòng thử lại.'
      setError(errorMsg)
      
      // Save error to localStorage
      localStorage.setItem('payment_test_error', JSON.stringify({
        error: errorMsg,
        amount,
        userId: user?.userId,
        timestamp: new Date().toISOString(),
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleVnpayPayment = async (bankCode?: string) => {
    try {
      setVnpayLoading(true)
      setError(null)
      setSuccess(false)
      
      // Validation
      if (!amount || Number(amount) <= 0) {
        setError('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)')
        setVnpayLoading(false)
        return
      }
      
      if (Number(amount) < 1000) {
        setError('Số tiền tối thiểu là 1,000 VND')
        setVnpayLoading(false)
        return
      }
      
      if (!user?.userId) {
        setError('Vui lòng đăng nhập để thanh toán')
        setVnpayLoading(false)
        return
      }
      
      // Kiểm tra wallet có tồn tại không
      if (!wallet || !wallet.walletID || wallet.walletID === 0) {
        const shouldActivate = window.confirm(
          'Bạn chưa có ví hoặc ví chưa được kích hoạt. Bạn có muốn đi đến trang "Ví của tôi" để kích hoạt ví không?'
        )
        if (shouldActivate) {
          navigate('/wallet')
          setVnpayLoading(false)
          return
        } else {
          setError('Vui lòng kích hoạt ví trước khi nạp tiền. Hãy vào trang "Ví của tôi" để kích hoạt.')
          setVnpayLoading(false)
          return
        }
      }
      
      const amountNum = Number(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Số tiền không hợp lệ.')
      }
      
      const returnUrl = `${window.location.origin}/wallet/topup`
      
      // Gọi API để tạo VNPay URL với bankCode (nếu có)
      // bankCode: "VNPAYQR" để hiển thị QR code, "VNBANK" cho ATM, "INTCARD" cho thẻ quốc tế
      const paymentUrl = await paymentService.topupWalletWithVnpay(wallet.walletID, {
        amount: amountNum,
        language: 'vn',
        returnUrl,
        bankCode, // Thêm bankCode để chọn phương thức thanh toán
      })
      
      console.log('VNPay URL created with bankCode:', bankCode || 'default')
      
      if (paymentUrl) {
        // Redirect to VNPay
        window.location.href = paymentUrl
      } else {
        throw new Error('Không nhận được payment URL từ server')
      }
    } catch (e: any) {
      console.error('VNPay create error:', e)
      const errorMsg = e?.response?.data?.message || e?.message || 'Không tạo được link thanh toán VNPay'
      setError(errorMsg)
      showToast(errorMsg, 'error', 5000)
    } finally {
      setVnpayLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          {/* Header with line */}
      <div className="px-10 pt-6 md:pt-10">
        <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-2xl md:text-3xl font-bold">Nạp tiền vào ví</h1>
              <p className="text-neutral-400 mt-1">Chọn phương thức thanh toán phù hợp</p>
        </div>
            <div className="mt-4 h-0.5 -mx-10 bg-white/10"></div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10 pt-6">
            {fetching || vnpayLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-4 text-neutral-400">
                  {vnpayLoading ? 'Đang xử lý thanh toán VNPay...' : 'Đang tải thông tin...'}
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">{error}</div>
                )}
                {success && (
                  <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 px-4 py-3">
                    ✅ Thanh toán thành công! Đang chuyển đến trang ví...
                  </div>
                )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden self-start mt-4 md:mt-30">
             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
                      <h2 className="text-lg font-semibold">Tóm tắt đơn nạp</h2>
                      
                      {/* Package Info */}
                      {selectedPackage && (
                        <div className="mt-4 mb-4 p-3 rounded-lg bg-[#23233a] border border-[#2a2a44]/50">
                          <div className="text-xs text-neutral-400 mb-1">Gói đã chọn:</div>
                          <div className="text-sm font-semibold text-white">{selectedPackage.packageName}</div>
                          <div className="text-xs text-neutral-400 mt-1">Giá gói: {selectedPackage.price.toLocaleString('vi-VN')} VND</div>
                        </div>
                      )}
                      
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-300">
                          <span>Số tiền</span>
                          <span>{Number(amount).toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                          <span>Nội dung</span>
                          <span className="text-xs break-words text-right max-w-[200px]">{desc}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                          <span>Phí</span>
                  <span>0 VND</span>
                </div>
                <div className="border-t border-[#2f2f4a] pt-3 flex justify-between">
                  <span className="font-semibold">Tổng</span>
                          <span className="font-semibold text-green-400">{Number(amount).toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            </div>
          </div>

                  {/* Payment Panel */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden self-start">
             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
              <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                        <span className="text-xs text-neutral-400">Chọn một phương thức</span>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="text-sm text-neutral-400">
                          Số tiền (VND) *
                          <input 
                            type="number" 
                            min="1000"
                            step="1000"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="Nhập số tiền cần nạp"
                            className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
                          />
                          <p className="text-xs text-neutral-500 mt-1">Số tiền tối thiểu: 1,000 VND</p>
                </label>
                <label className="text-sm text-neutral-400">
                  Nội dung thanh toán
                          <input 
                            value={desc} 
                            onChange={(e) => setDesc(e.target.value)} 
                            placeholder="Nạp tiền ví EduPrompt"
                            className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" 
                          />
                  </label>
              </div>

              {/* Actions */}
                      <div className="mt-5 space-y-3">
                        {/* VNPay Options */}
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-400 mb-2">Chọn phương thức thanh toán VNPay:</p>
                          
                          {/* VNPay Default */}
                          <button 
                            onClick={() => handleVnpayPayment()} 
                            disabled={vnpayLoading || loading || !amount || Number(amount) < 1000 || success} 
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {vnpayLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Đang tạo link thanh toán...</span>
                              </>
                            ) : (
                              <>
                                <span>💳</span>
                                <span>Thanh toán VNPay (Mặc định)</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* Test Mode Button */}
                        <button 
                          onClick={handlePayment} 
                          disabled={loading || vnpayLoading || !amount || Number(amount) < 1000 || success} 
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Đang xử lý thanh toán...</span>
                            </>
                          ) : success ? (
                            <>
                              <span>✅</span>
                              <span>Thanh toán thành công!</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>Thanh toán nhanh (Test Mode)</span>
                            </>
                          )}
                        </button>
              </div>

                      {/* Info */}
                      <div className="mt-5 space-y-3">
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                          <div className="text-xs text-blue-300 mb-2">💳 VNPay</div>
                          <p className="text-xs text-blue-200/80">
                            Thanh toán an toàn qua VNPay:
                          </p>
                          <ul className="text-xs text-blue-200/80 mt-2 space-y-1 list-disc list-inside">
                            <li>Thanh toán được xử lý tự động sau khi hoàn tất</li>
                            <li>Bảo mật cao, được VNPay bảo vệ</li>
                          </ul>
                        </div>
                        
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                          <div className="text-xs text-yellow-300 mb-2">⚡ Test Mode</div>
                          <p className="text-xs text-yellow-200/80">
                            Thanh toán sẽ được xử lý ngay lập tức (chỉ dùng để test):
                          </p>
                          <ul className="text-xs text-yellow-200/80 mt-2 space-y-1 list-disc list-inside">
                            <li>Tiền sẽ được cộng vào ví ngay</li>
                            <li>Transaction (TopUp) sẽ được tạo với status "Completed"</li>
                            <li>Lịch sử giao dịch sẽ hiển thị sau khi refresh</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Wallet Info */}
                      {wallet && (
                        <div className="mt-5 rounded-lg border border-[#2f2f4a] bg-[#23233a] p-4">
                          <div className="text-sm text-neutral-400 mb-2">Thông tin ví</div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-300">Số dư hiện tại:</span>
                            <span className="font-semibold text-green-400">
                              {wallet.balance.toLocaleString('vi-VN')} {wallet.currency}
                            </span>
                          </div>
                          {amount && (
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-neutral-300">Sau khi nạp:</span>
                              <span className="font-semibold text-sky-400">
                                {(wallet.balance + Number(amount)).toLocaleString('vi-VN')} {wallet.currency}
                              </span>
                            </div>
                          )}
              </div>
                      )}
            </div>
          </div>
        </div>
              </>
            )}
      </div>
    </main>
      </div>
    </div>
  )
}

export default PaymentPrompt





