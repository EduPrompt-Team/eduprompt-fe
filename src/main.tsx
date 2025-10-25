import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import router from './router/ProtectRouter'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// Debug logs to verify FE config during integration
console.log('VITE_GOOGLE_CLIENT_ID =', clientId)
console.log('ORIGIN =', location.origin)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>,
)
