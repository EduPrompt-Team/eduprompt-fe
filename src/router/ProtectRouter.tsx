import React from 'react'
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
])

export default router