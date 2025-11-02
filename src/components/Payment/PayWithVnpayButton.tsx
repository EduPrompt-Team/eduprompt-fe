import React from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '@/components/ui/toast';

type Props = {
  orderId: number;
  bankCode?: string; // e.g. 'VNPAYQR' | 'VNBANK' | 'INTCARD'
  className?: string;
  returnUrl?: string;
  label?: string;
};

export const PayWithVnpayButton: React.FC<Props> = ({ orderId, bankCode, className, returnUrl, label }) => {
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();
  const onClick = async () => {
    try {
      setLoading(true);
      await paymentService.payOrderWithVnpay(orderId, { bankCode, returnUrl });
    } catch (e) {
      console.error('VNPay init error', e);
      showToast('Không khởi tạo được thanh toán VNPay. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className ?? 'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}
    >
      {loading ? 'Đang chuyển hướng VNPay...' : (label ?? 'Thanh toán VNPay')}
    </button>
  );
};

export default PayWithVnpayButton;


