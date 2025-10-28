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
import DashboardAdmin from '@/components/Admin/DashboardAdmin'
import AdminProtectedRoute from '@/components/Admin/AdminProtectedRoute'
import AdminHeader from '@/components/Admin/AdminHeader'
import AdminViewProfilePage from '@/components/Admin/AdminViewProfilePage'
import PackagePage from '@/components/Package/PackagePage'
import NonAdminOnlyRoute from '@/components/Admin/NonAdminOnlyRoute'

export const router = createBrowserRouter([
	{ path: '/', element: <Navigate to="/home" replace /> },
	{ path: '/login', element: <LoginPage /> },
	{ path: '/home', element: (<NonAdminOnlyRoute><HomePage /></NonAdminOnlyRoute>) },
	{ path: '/grade10', element: (<NonAdminOnlyRoute><Grade10 /></NonAdminOnlyRoute>) },
	{ path: '/grade11', element: (<NonAdminOnlyRoute><Grade11 /></NonAdminOnlyRoute>) },
	{ path: '/grade12', element: (<NonAdminOnlyRoute><Grade12 /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math', element: (<NonAdminOnlyRoute><PromptMath10 /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math/detail', element: (<NonAdminOnlyRoute><PromptMath10Detail /></NonAdminOnlyRoute>) },
	{ path: '/myprofile', element: (<NonAdminOnlyRoute><MyProfilePage /></NonAdminOnlyRoute>) },
	{ path: '/mystorage', element: (<NonAdminOnlyRoute><PromptBarStoragePage /></NonAdminOnlyRoute>) },
	{ path: '/myfavorites', element: (<NonAdminOnlyRoute><FavoritesPromptPage /></NonAdminOnlyRoute>) },
	{ path: '/profile', element: (<NonAdminOnlyRoute><MyProfilePage /></NonAdminOnlyRoute>) },
	{ path: '/payment', element: (<NonAdminOnlyRoute><PaymentPage /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math/detail/chuong1', element: (<NonAdminOnlyRoute><PromptTemplate10Chuong1Page /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math/detail/chuong1/chat', element: (<NonAdminOnlyRoute><PromptChatMath10Chuong1Page /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math/detail/chuong2', element: (<NonAdminOnlyRoute><PromptTemplate10Chuong2Page /></NonAdminOnlyRoute>) },
	{ path: '/grade10/math/detail2', element: (<NonAdminOnlyRoute><PromptMath10Chuong2Detail /></NonAdminOnlyRoute>) },
	// Shopping Cart & Checkout Flow
	{ path: '/cart', element: (<NonAdminOnlyRoute><ShoppingCartPage /></NonAdminOnlyRoute>) },
	{ path: '/checkout', element: (<NonAdminOnlyRoute><CheckoutPage /></NonAdminOnlyRoute>) },
	{ path: '/order-confirmation', element: (<NonAdminOnlyRoute><OrderConfirmationPage /></NonAdminOnlyRoute>) },
	{ path: '/order-history', element: (<NonAdminOnlyRoute><OrderHistoryPage /></NonAdminOnlyRoute>) },
	{ path: '/wallet', element: (<NonAdminOnlyRoute><WalletPage /></NonAdminOnlyRoute>) },
	// Demo & Testing
	{ path: '/payment-demo', element: (<NonAdminOnlyRoute><PaymentFlowDemo /></NonAdminOnlyRoute>) },
	// Avoid Vite's internal /package (serves package.json as ESM); use /packages instead
	{ path: '/packages', element: (<NonAdminOnlyRoute><PackagePage /></NonAdminOnlyRoute>) },
	// Package Details
	{ path: '/package/:id', element: (<NonAdminOnlyRoute><PackageDetailPage /></NonAdminOnlyRoute>) },
	// Admin Dashboard - Protected by role
	{ 
		path: '/admin/dashboard', 
		element: (
			<AdminProtectedRoute>
				<AdminHeader />
				<DashboardAdmin />
			</AdminProtectedRoute>
		)
	},
	{ 
		path: '/admin/viewprofile', 
		element: (
			<AdminProtectedRoute>
				<AdminViewProfilePage />
			</AdminProtectedRoute>
		)
	},
])

export default router