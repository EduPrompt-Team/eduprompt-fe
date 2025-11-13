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
import PaymentPrompt from '@/components/Payment/PaymentPrompt'
import PromptTemplate10Chuong1Page from '@/components/Page/Math10/PromptTemplate10Chuong1Page'
import WalletPage from '@/components/Page/WalletPage'
import PaymentFlowDemo from '@/components/Demo/PaymentFlowDemo'
import PromptTemplate10Chuong2Page from '@/components/Page/Math10/PromptTemplate10Chuong2Page'
import PromptMath10Chuong2Detail from '@/components/PromptGrade/PromptSubject10/PromptSubject10Details/PromptMath10Chuong2Detail'
import PromptChatMath10Chuong1Page from '@/components/Page/Math10/PromptChatMath10Chuong1Page'
import DashboardAdmin from '@/components/Admin/DashboardAdmin'
import AdminProtectedRoute from '@/components/Admin/AdminProtectedRoute'
import AdminHeader from '@/components/Admin/AdminHeader'
import AdminViewProfilePage from '@/components/Admin/AdminViewProfilePage'
import PackagePage from '@/components/Package/PackagePage'
import MyPackagesPage from '@/components/Page/MyPackagesPage'
import Grade10SubjectDetailRouter from '../components/Page/Grade10SubjectDetailRouter'
import DynamicSubjectDetailRouter from '@/components/Page/DynamicSubjectDetailRouter'
import DynamicSubjectChaptersPage from '@/components/Page/DynamicSubjectChaptersPage'
import DynamicTemplateFormPage from '@/components/Page/DynamicTemplateFormPage'
import DynamicChatPage from '@/components/Page/DynamicChatPage'
import ChatHistoryPage from '@/components/Page/ChatHistoryPage'
import CreateTemplatePage from '@/components/Page/CreateTemplatePage'
import MyTemplatesPage from '@/components/Page/MyTemplatesPage'
import NonAdminOnlyRoute from '@/components/Admin/NonAdminOnlyRoute'
import BuyPromptPage from '@/components/Page/BuyPromptPage'

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
	{ path: '/wallet', element: (<NonAdminOnlyRoute><WalletPage /></NonAdminOnlyRoute>) },
	{ path: '/wallet/topup', element: (<NonAdminOnlyRoute><PaymentPrompt /></NonAdminOnlyRoute>) },
	// Demo & Testing
	{ path: '/payment-demo', element: (<NonAdminOnlyRoute><PaymentFlowDemo /></NonAdminOnlyRoute>) },
	// Avoid Vite's internal /package (serves package.json as ESM); use /packages instead
	{ path: '/packages', element: (<NonAdminOnlyRoute><PackagePage /></NonAdminOnlyRoute>) },
	{ path: '/my-packages', element: (<NonAdminOnlyRoute><MyPackagesPage /></NonAdminOnlyRoute>) },
	{ path: '/Hire', element: (<NonAdminOnlyRoute><BuyPromptPage /></NonAdminOnlyRoute>) },
	{ path: '/Sell', element: (<NonAdminOnlyRoute><CreateTemplatePage /></NonAdminOnlyRoute>) },
	{ path: '/my-templates', element: (<NonAdminOnlyRoute><MyTemplatesPage /></NonAdminOnlyRoute>) },
	// Grade 10 subject dynamic chapter route (backward compatibility for math)
	{ path: '/grade10/:subject/detail/:chapter', element: (<NonAdminOnlyRoute><Grade10SubjectDetailRouter /></NonAdminOnlyRoute>) },
	// Grade 10 form and chat routes
	{ path: '/grade10/:subject/detail/:chapter/form', element: (<NonAdminOnlyRoute><DynamicTemplateFormPage /></NonAdminOnlyRoute>) },
	{ path: '/grade10/:subject/detail/:chapter/chat', element: (<NonAdminOnlyRoute><DynamicChatPage /></NonAdminOnlyRoute>) },
	{ path: '/grade10/:subject/detail/:chapter/chat-history', element: (<NonAdminOnlyRoute><ChatHistoryPage /></NonAdminOnlyRoute>) },
// Backward-compatibility: allow /grade11/:subject/detail/:chapter and /grade12/:subject/detail/:chapter
{ path: '/grade11/:subject/detail/:chapter', element: (<NonAdminOnlyRoute><DynamicSubjectDetailRouter /></NonAdminOnlyRoute>) },
	{ path: '/grade11/:subject/detail/:chapter/form', element: (<NonAdminOnlyRoute><DynamicTemplateFormPage /></NonAdminOnlyRoute>) },
	{ path: '/grade11/:subject/detail/:chapter/chat', element: (<NonAdminOnlyRoute><DynamicChatPage /></NonAdminOnlyRoute>) },
	{ path: '/grade11/:subject/detail/:chapter/chat-history', element: (<NonAdminOnlyRoute><ChatHistoryPage /></NonAdminOnlyRoute>) },
{ path: '/grade12/:subject/detail/:chapter', element: (<NonAdminOnlyRoute><DynamicSubjectDetailRouter /></NonAdminOnlyRoute>) },
	{ path: '/grade12/:subject/detail/:chapter/form', element: (<NonAdminOnlyRoute><DynamicTemplateFormPage /></NonAdminOnlyRoute>) },
	{ path: '/grade12/:subject/detail/:chapter/chat', element: (<NonAdminOnlyRoute><DynamicChatPage /></NonAdminOnlyRoute>) },
	{ path: '/grade12/:subject/detail/:chapter/chat-history', element: (<NonAdminOnlyRoute><ChatHistoryPage /></NonAdminOnlyRoute>) },
// Intermediate chapters page for a subject within a grade
{ path: '/grade/:grade/:subject', element: (<NonAdminOnlyRoute><DynamicSubjectChaptersPage /></NonAdminOnlyRoute>) },
// Backward-compatibility: chapters listing without /grade/ prefix
{ path: '/grade11/:subject', element: (<NonAdminOnlyRoute><DynamicSubjectChaptersPage /></NonAdminOnlyRoute>) },
{ path: '/grade12/:subject', element: (<NonAdminOnlyRoute><DynamicSubjectChaptersPage /></NonAdminOnlyRoute>) },
// Dynamic routes for all grades and subjects (10, 11, 12)
	{ path: '/grade/:grade/:subject/detail/:chapter', element: (<NonAdminOnlyRoute><DynamicSubjectDetailRouter /></NonAdminOnlyRoute>) },
	// Dynamic template form page (form để điền thông tin trước khi vào chat)
	{ path: '/grade/:grade/:subject/detail/:chapter/form', element: (<NonAdminOnlyRoute><DynamicTemplateFormPage /></NonAdminOnlyRoute>) },
	// Dynamic chat page (chat với AI để tạo prompt)
	{ path: '/grade/:grade/:subject/detail/:chapter/chat', element: (<NonAdminOnlyRoute><DynamicChatPage /></NonAdminOnlyRoute>) },
	// Chat history page (xem tất cả lịch sử chat của template)
	{ path: '/grade/:grade/:subject/detail/:chapter/chat-history', element: (<NonAdminOnlyRoute><ChatHistoryPage /></NonAdminOnlyRoute>) },
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