import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/components/Page/LoginPage'
import HomePage from '@/components/Page/HomePage'
import Grade10 from '@/components/PromptGrade/Grade10'
import Grade11 from '@/components/PromptGrade/Grade11'
import Grade12 from '@/components/PromptGrade/Grade12'
import PromptMath10 from '@/components/PromptGrade/PromptSubject10/PromptMath10'
import PromptMath10Detail from '@/components/PromptGrade/PromptSubject10/PromptSubject10Details/PromptMath10Detail'
import MyProfilePage from '@/components/Page/MyProfilePage'
import PromptBarStoragePage from '@/components/Page/PromptBarStoragePage'
import FavoritesPromptPage from '@/components/Page/FavoritesPromptPage'
import PaymentPage from '@/components/Page/PaymentPage'
import PromptTemplate10Chuong1Page from '@/components/Page/Math10/PromptTemplate10Chuong1Page'
import ShoppingCartPage from '@/components/Page/ShoppingCartPage'
import CheckoutPage from '@/components/Page/CheckoutPage'
import OrderConfirmationPage from '@/components/Page/OrderConfirmationPage'
import OrderHistoryPage from '@/components/Page/OrderHistoryPage'
import WalletPage from '@/components/Page/WalletPage'
import PaymentFlowDemo from '@/components/Demo/PaymentFlowDemo'
import PackageDetailPage from '@/components/Page/PackageDetailPage'
import PromptTemplate10Chuong2Page from '@/components/Page/Math10/PromptTemplate10Chuong2Page'
import PromptMath10Chuong2Detail from '@/components/PromptGrade/PromptSubject10/PromptSubject10Details/PromptMath10Chuong2Detail'
import PromptChatMath10Chuong1Page from '@/components/Page/Math10/PromptChatMath10Chuong1Page'

export const router = createBrowserRouter([
	{ path: '/', element: <Navigate to="/home" replace /> },
	{ path: '/login', element: <LoginPage /> },
	{ path: '/home', element: <HomePage /> },
	{ path: '/grade10', element: <Grade10 /> },
	{ path: '/grade11', element: <Grade11 /> },
	{ path: '/grade12', element: <Grade12 /> },
	{ path: '/grade10/math', element: <PromptMath10 /> },
	{ path: '/grade10/math/detail', element: <PromptMath10Detail /> },
	{ path: '/myprofile', element: <MyProfilePage /> },
	{ path: '/mystorage', element: <PromptBarStoragePage /> },
	{ path: '/myfavorites', element: <FavoritesPromptPage /> },
	{ path: '/profile', element: <MyProfilePage /> },
	{ path: '/payment', element: <PaymentPage /> },
	{ path: '/grade10/math/detail/chuong1', element: <PromptTemplate10Chuong1Page /> },
	{ path: '/grade10/math/detail/chuong1/chat', element: <PromptChatMath10Chuong1Page /> },
	{ path: '/grade10/math/detail/chuong2', element: <PromptTemplate10Chuong2Page /> },
	{ path: '/grade10/math/detail2', element: <PromptMath10Chuong2Detail /> },
	// Shopping Cart & Checkout Flow
	{ path: '/cart', element: <ShoppingCartPage /> },
	{ path: '/checkout', element: <CheckoutPage /> },
	{ path: '/order-confirmation', element: <OrderConfirmationPage /> },
	{ path: '/order-history', element: <OrderHistoryPage /> },
	{ path: '/wallet', element: <WalletPage /> },
	// Demo & Testing
	{ path: '/payment-demo', element: <PaymentFlowDemo /> },
	// Package Details
	{ path: '/package/:id', element: <PackageDetailPage /> },
])

export default router