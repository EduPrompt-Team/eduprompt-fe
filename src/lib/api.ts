import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5217';

export const api = axios.create({
  baseURL: API_BASE,
});

// Decide storage: prefer sessionStorage (non-remember), fallback to localStorage (remember)
let tokenStorage: Storage = sessionStorage.getItem('accessToken') ? sessionStorage : localStorage;
let accessToken: string | null = tokenStorage.getItem('accessToken') || null;
let refreshToken: string | null = tokenStorage.getItem('refreshToken') || null;

export function setRemember(remember: boolean) {
  tokenStorage = remember ? localStorage : sessionStorage;
}

export function setTokens(newAccessToken?: string, newRefreshToken?: string) {
  if (newAccessToken) {
    accessToken = newAccessToken;
    // Clear from both then set in chosen storage
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    tokenStorage.setItem('accessToken', newAccessToken);
  }
  if (newRefreshToken) {
    refreshToken = newRefreshToken;
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
    tokenStorage.setItem('refreshToken', newRefreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

// Simple user cache in localStorage for navbar/profile usage
const CURRENT_USER_KEY = 'currentUser';
export function setCurrentUser(user: any | null) {
  if (user) {
    // Clear from both then set in chosen storage
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    tokenStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): any | null {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY) ?? localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchCurrentUser(): Promise<any> {
  const { data } = await api.get('/api/auth/me');
  // Normalize: default role to 'User' with roleId = 2 if backend doesn't provide one
  const normalized = {
    ...data,
    roleName: data?.roleName ?? 'User',
    roleId: data?.roleId ?? 2,
  };
  setCurrentUser(normalized);
  return normalized;
}

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && refreshToken && !err.config.__isRetryRequest) {
      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh-token`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        err.config.__isRetryRequest = true;
        err.config.headers = err.config.headers || {};
        err.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(err.config);
      } catch (_e) {
        clearTokens();
        setCurrentUser(null);
        // If refresh failed, force re-login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    if (err.response?.status === 401 && !refreshToken) {
      // No refresh token flow (email/password). Clear and redirect.
      clearTokens();
      setCurrentUser(null);
      if (typeof window !== 'undefined' && !err.config.__isRetryRequest) {
        // Avoid loops on login page itself
        const path = window.location.pathname;
        if (path !== '/login') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ===== CART API FUNCTIONS =====
export const cartApi = {
  // Get user's cart
  getCart: () => api.get('/api/cart'),
  
  // Add item to cart
  addItem: (itemData: { packageID: number; quantity: number }) => 
    api.post('/api/cart/items', itemData),
  
  // Update item quantity
  updateItem: (cartDetailId: number, quantity: number) => 
    api.put(`/api/cart/items/${cartDetailId}`, { quantity }),
  
  // Remove item from cart
  removeItem: (cartDetailId: number) => 
    api.delete(`/api/cart/items/${cartDetailId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/api/cart'),
};

// ===== ORDER API FUNCTIONS =====
export const orderApi = {
  // Create order from cart
  createFromCart: (notes?: string) => 
    api.post('/api/orders/create-from-cart', null, { params: { notes } }),
  
  // Get user's orders
  getMyOrders: () => api.get('/api/orders/my'),
  
  // Get order by ID
  getById: (orderId: number) => api.get(`/api/orders/${orderId}`),
  
  // Cancel order
  cancelOrder: (orderId: number) => api.post(`/api/orders/${orderId}/cancel`),
  
  // Update order status (Admin only)
  updateStatus: (orderId: number, status: string) => 
    api.patch(`/api/orders/${orderId}/status`, null, { params: { status } }),
};

// ===== PAYMENT METHOD API FUNCTIONS =====
export const paymentMethodApi = {
  // Get all payment methods
  getAll: () => api.get('/api/payment-methods'),
  
  // Get payment methods by user ID
  getByUserId: (userId: number) => api.get(`/api/payment-methods/user/${userId}`),
  
  // Get payment method by ID
  getById: (id: number) => api.get(`/api/payment-methods/${id}`),
  
  // Create payment method
  create: (data: any) => api.post('/api/payment-methods', data),
  
  // Update payment method
  update: (id: number, data: any) => api.put(`/api/payment-methods/${id}`, data),
  
  // Delete payment method
  delete: (id: number) => api.delete(`/api/payment-methods/${id}`),
  
  // Get default payment method
  getDefault: (userId: number) => api.get(`/api/payment-methods/user/${userId}/default`),
  
  // Set as default payment method
  setAsDefault: (id: number, userId: number) => 
    api.post(`/api/payment-methods/${id}/set-default`, null, { params: { userId } }),
};

// ===== TRANSACTION API FUNCTIONS =====
export const transactionApi = {
  // Get all transactions (Admin only)
  getAll: () => api.get('/api/transactions'),
  
  // Get transactions by wallet ID
  getByWalletId: (walletId: number) => api.get(`/api/transactions/wallet/${walletId}`),
  
  // Get transactions by user ID
  getByUserId: (userId: number) => api.get(`/api/transactions/user/${userId}`),
  
  // Get transaction by ID
  getById: (id: number) => api.get(`/api/transactions/${id}`),
  
  // Create transaction
  create: (data: any) => api.post('/api/transactions', data),
  
  // Update transaction
  update: (id: number, data: any) => api.put(`/api/transactions/${id}`, data),
  
  // Delete transaction
  delete: (id: number) => api.delete(`/api/transactions/${id}`),
  
  // Note: wallet balance/recent are not exposed under TransactionController in BE
};

// ===== WALLET API FUNCTIONS =====
export const walletApi = {
  // Get wallet by user ID
  getByUserId: (userId: number) => api.get(`/api/wallets/user/${userId}`),
  
  // Get wallet by ID
  getById: (walletId: number) => api.get(`/api/wallets/${walletId}`),
  
  // Create wallet
  create: (data: any) => api.post('/api/wallets', data),
  
  // Update wallet
  update: (walletId: number, data: any) => api.put(`/api/wallets/${walletId}`, data),
  
  // Delete wallet
  delete: (walletId: number) => api.delete(`/api/wallets/${walletId}`),
  
  // Get wallet balance
  getBalance: (userId: number) => api.get(`/api/wallets/balance/${userId}`),
  
  // Add funds to wallet
  addFunds: (userId: number, amount: number) => 
    api.post('/api/wallets/add-funds', { userId, amount }),
  
  // Deduct funds from wallet
  deductFunds: (userId: number, amount: number) => 
    api.post('/api/wallets/deduct-funds', { userId, amount }),
};

// ===== PACKAGE API FUNCTIONS =====
export const packageApi = {
  // Get all packages
  getAll: () => api.get('/api/packages'),
  
  // Get package by ID
  getById: (id: number) => api.get(`/api/packages/${id}`),
  
  // Create package
  create: (data: any) => api.post('/api/packages', data),
  
  // Update package
  update: (id: number, data: any) => api.put(`/api/packages/${id}`, data),
  
  // Delete package
  delete: (id: number) => api.delete(`/api/packages/${id}`),
};

// ===== MOCK DATA FOR TESTING =====
export const mockData = {
  // Mock cart data
  mockCart: {
    cartId: 1,
    userId: 1,
    totalItems: 2,
    createdDate: new Date().toISOString(),
    totalPrice: 99.98,
    items: [
      {
        cartDetailId: 1,
        cartId: 1,
        packageID: 1,
        quantity: 1,
        unitPrice: 49.99,
        addedDate: new Date().toISOString(),
        packageName: 'Premium Math Package',
        packageDescription: 'Advanced mathematics learning package'
      },
      {
        cartDetailId: 2,
        cartId: 1,
        packageID: 2,
        quantity: 1,
        unitPrice: 49.99,
        addedDate: new Date().toISOString(),
        packageName: 'Science Explorer Package',
        packageDescription: 'Comprehensive science learning package'
      }
    ]
  },

  // Mock payment methods
  mockPaymentMethods: [
    {
      paymentMethodID: 1,
      methodName: 'Credit Card',
      provider: 'Visa/Mastercard',
      isActive: true,
      processingFee: 2.50
    },
    {
      paymentMethodID: 2,
      methodName: 'Digital Wallet',
      provider: 'PayPal',
      isActive: true,
      processingFee: 1.00
    },
    {
      paymentMethodID: 3,
      methodName: 'Bank Transfer',
      provider: 'Direct Bank',
      isActive: true,
      processingFee: 0.00
    }
  ],

  // Mock wallet
  mockWallet: {
    walletID: 1,
    userID: 1,
    balance: 150.00,
    currency: 'USD',
    createdDate: new Date().toISOString(),
    status: 'Active'
  },

  // Mock order
  mockOrder: {
    orderId: 1,
    userId: 1,
    orderNumber: 'ORD-2024-001',
    totalAmount: 99.98,
    orderDate: new Date().toISOString(),
    status: 'Completed',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    items: [
      {
        orderItemId: 1,
        orderId: 1,
        packageID: 1,
        quantity: 1,
        unitPrice: 49.99,
        packageName: 'Premium Math Package'
      },
      {
        orderItemId: 2,
        orderId: 1,
        packageID: 2,
        quantity: 1,
        unitPrice: 49.99,
        packageName: 'Science Explorer Package'
      }
    ]
  },

  // Mock transaction
  mockTransaction: {
    transactionID: 1,
    paymentMethodID: 1,
    walletID: 1,
    orderID: 1,
    amount: 99.98,
    transactionType: 'Payment',
    transactionDate: new Date().toISOString(),
    status: 'Completed',
    transactionReference: 'PAY-2024-001',
    paymentMethodType: 'Credit Card',
    walletOwnerName: 'John Doe'
  }
};

// ===== UTILITY FUNCTIONS =====
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export const generateTransactionReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `PAY-${timestamp}-${random}`;
};