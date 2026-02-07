'use client';

import QRCode from 'react-qr-code';

interface TicketQRCodeProps {
  value: string;
  size?: number;
}

export function TicketQRCode({ value, size = 192 }: TicketQRCodeProps) {
  return (
    <div className="bg-white p-3 rounded-lg inline-block">
      <QRCode value={value} size={size} level="M" />
    </div>
  );
}
