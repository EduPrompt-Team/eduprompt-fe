import { api, setTokens, setCurrentUser, clearTokens } from '@/lib/api'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName?: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface User {
  userId: string
  email: string
  fullName?: string
  role?: string
  [key: string]: any
}

class AuthService {
  // POST /api/Auth/google-login
  async googleLogin(request: GoogleLoginRequest): Promise<TokenResponse> {
    const { data } = await api.post('/api/Auth/google-login', request)
    setTokens(data.accessToken, data.refreshToken)
    return data
  }

  // POST /api/Auth/login
  async login(request: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post('/api/Auth/login', request)
    setTokens(data.accessToken, data.refreshToken)
    return data
  }

  // GET /api/Auth/me
  async getCurrentUser(): Promise<User> {
    const { data } = await api.get('/api/Auth/me')
    setCurrentUser(data)
    return data
  }

  // POST /api/Auth/refresh-token
  async refreshToken(request: RefreshTokenRequest): Promise<TokenResponse> {
    const { data } = await api.post('/api/Auth/refresh-token', request)
    setTokens(data.accessToken, data.refreshToken)
    return data
  }

  // POST /api/Auth/register
  async register(request: RegisterRequest): Promise<TokenResponse> {
    const { data } = await api.post('/api/Auth/register', request)
    setTokens(data.accessToken, data.refreshToken)
    return data
  }

  // POST /api/Auth/revoke-token
  async logout(): Promise<void> {
    await api.post('/api/Auth/revoke-token')
    clearTokens()
    setCurrentUser(null)
  }
}

export const authService = new AuthService()

