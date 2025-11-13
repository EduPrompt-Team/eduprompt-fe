import { api } from '../lib/api';

export type VnpayRequestDto = {
  bankCode?: string;
  language?: string; // 'vn' | 'en'
  returnUrl?: string; // optional override; backend uses config if omitted
};

export type WalletTopupRequestDto = {
  amount: number; // Required, > 0 (VND)
  bankCode?: string; // Optional
  language?: string; // Optional, default: 'vn'
  returnUrl?: string; // Optional
};

export type VnpayQueryDto = {
  txnRef: string;
  transactionDate: string; // yyyyMMddHHmmss (GMT+7)
  orderInfo?: string;
};

export type VnpayRefundDto = {
  txnRef: string;
  amount: string; // amount * 100 as string per VNPay spec
  transactionDate: string; // yyyyMMddHHmmss (GMT+7)
  createBy?: string;
};

export const paymentService = {
  // Create VNPay URL for order payment
  async payOrderWithVnpay(orderId: number, req: VnpayRequestDto = {}): Promise<string> {
    const { data } = await api.post(`/api/payments/orders/${orderId}/vnpay-url`, req);
    const url = typeof data === 'string' ? data : data?.url;
    if (!url) throw new Error('Không nhận được payment URL');
    return url;
  },

  // Create VNPay URL for wallet top-up (NEW) ⭐
  async topupWalletWithVnpay(walletId: number, req: WalletTopupRequestDto): Promise<string> {
    const { data } = await api.post(`/api/payments/wallets/${walletId}/topup`, req);
    const url = typeof data === 'string' ? data : data?.url;
    if (!url) throw new Error('Không nhận được payment URL');
    return url;
  },

  // Create VNPay URL for transaction payment (NEW) ⭐
  async payTransactionWithVnpay(transactionId: number, req: VnpayRequestDto = {}): Promise<string> {
    const { data } = await api.post(`/api/payments/transactions/${transactionId}/vnpay-url`, req);
    const url = typeof data === 'string' ? data : data?.url;
    if (!url) throw new Error('Không nhận được payment URL');
    return url;
  },

  // Get payments by order
  getByOrder(orderId: number) {
    return api.get(`/api/payments/orders/${orderId}`);
  },

  // Get payment by ID
  getById(paymentId: number) {
    return api.get(`/api/payments/${paymentId}`);
  },

  // Get all payments (Admin only)
  getAll() {
    return api.get('/api/payments');
  },

  // Admin: query transaction status from VNPay
  queryDR(dto: VnpayQueryDto) {
    return api.post(`/api/payments/querydr`, dto);
  },

  // Admin: refund transaction via VNPay
  refund(dto: VnpayRefundDto) {
    return api.post(`/api/payments/refund`, dto);
  },

  // Check payment status for a package (NEW) ⭐
  async checkPackagePayment(packageId: number): Promise<{
    packageId: number;
    isPaid: boolean;
    orderId?: number;
    paymentId?: number;
    paidAt?: string;
    amount?: number;
    paymentMethod?: string;
    status?: string;
  }> {
    try {
      const { data } = await api.get(`/api/payments/check-package/${packageId}`);
      return data;
    } catch (e: any) {
      // Nếu endpoint chưa có (404) hoặc lỗi khác, throw để caller xử lý fallback
      if (e?.response?.status === 404) {
        throw new Error('ENDPOINT_NOT_FOUND');
      }
      throw e;
    }
  },
};


