import { useParams, Navigate } from 'react-router-dom'
import PromptTemplate10Chuong1Page from '@/components/Page/Math10/PromptTemplate10Chuong1Page'
import PromptTemplate10Chuong2Page from '@/components/Page/Math10/PromptTemplate10Chuong2Page'
import DynamicSubjectDetailRouter from '@/components/Page/DynamicSubjectDetailRouter'

/**
 * Grade10SubjectDetailRouter - Backward compatibility router for Grade 10 Math
 * For other subjects or future routes, redirects to DynamicSubjectDetailRouter
 */
export default function Grade10SubjectDetailRouter() {
  const { subject, chapter } = useParams()
  const subjectLower = (subject || '').toLowerCase()
  const chapterLower = (chapter || '').toLowerCase()

  // For Math 10, use existing hardcoded pages (backward compatibility)
  if (subjectLower === 'math') {
    switch (chapterLower) {
      case 'chuong1':
        return <PromptTemplate10Chuong1Page />
      case 'chuong2':
        return <PromptTemplate10Chuong2Page />
      default:
        // For other chapters of Math 10, use dynamic router
        return <DynamicSubjectDetailRouter />
    }
  }

  // For all other subjects, use dynamic router
  return <DynamicSubjectDetailRouter />
}
