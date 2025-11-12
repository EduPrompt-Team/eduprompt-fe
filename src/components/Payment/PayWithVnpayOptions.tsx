import React from 'react';
import { PayWithVnpayButton } from './PayWithVnpayButton';

type Props = {
  orderId: number;
  className?: string;
  returnUrl?: string;
};

export const PayWithVnpayOptions: React.FC<Props> = ({ orderId, className, returnUrl }) => {
  return (
    <div className={className ?? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'}>
      <PayWithVnpayButton orderId={orderId} returnUrl={returnUrl} label="VNPay (Mặc định)" />
      <PayWithVnpayButton orderId={orderId} bankCode="VNPAYQR" returnUrl={returnUrl} label="VNPay QR" />
      <PayWithVnpayButton orderId={orderId} bankCode="VNBANK" returnUrl={returnUrl} label="Thẻ nội địa (ATM)" />
      <PayWithVnpayButton orderId={orderId} bankCode="INTCARD" returnUrl={returnUrl} label="Thẻ quốc tế" />
    </div>
  );
};

export default PayWithVnpayOptions;


