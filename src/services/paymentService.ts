import { api } from '../lib/api';

export type VnpayRequestDto = {
  bankCode?: string;
  language?: string; // 'vn' | 'en'
  returnUrl?: string; // optional override; backend uses config if omitted
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
  // Create VNPay URL and redirect the browser
  async payOrderWithVnpay(orderId: number, req: VnpayRequestDto = {}): Promise<void> {
    const { data } = await api.post(`/api/payments/orders/${orderId}/vnpay-url`, req);
    if (data?.url) {
      window.location.href = data.url;
    }
  },

  // Get payments by order
  getByOrder(orderId: number) {
    return api.get(`/api/payments/orders/${orderId}`);
  },

  // Admin: query transaction status from VNPay
  queryDR(dto: VnpayQueryDto) {
    return api.post(`/api/payments/querydr`, dto);
  },

  // Admin: refund transaction via VNPay
  refund(dto: VnpayRefundDto) {
    return api.post(`/api/payments/refund`, dto);
  },
};


