import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQR } from '../utils/crypto-qr';
import { Timer } from 'lucide-react';

interface DynamicQRCodeProps {
  ticketId: string;
  secretSeed: string;
}

const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({ ticketId, secretSeed }) => {
  const [qrData, setQrData] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    const updateQR = () => {
      const data = generateDynamicQR(ticketId, secretSeed);
      setQrData(data);
      
      const currentUnix = Math.floor(Date.now() / 1000);
      const remainder = currentUnix % 30;
      setCountdown(30 - remainder);
    };

    updateQR();
    
    const interval = setInterval(() => {
      const currentUnix = Math.floor(Date.now() / 1000);
      const remainder = currentUnix % 30;
      setCountdown(30 - remainder);
      
      if (remainder === 0) {
        updateQR();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketId, secretSeed]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Your Boarding Pass</h2>
        <p className="text-sm text-gray-500 mt-1">Ticket #{ticketId.substring(0,8).toUpperCase()}</p>
      </div>
      
      <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-dashed border-gray-200">
        {qrData && (
          <QRCodeSVG 
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
          />
        )}
      </div>
      
      <div className="mt-6 flex items-center justify-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full w-full">
        <Timer size={18} className="animate-pulse" />
        <span className="font-semibold text-sm">
          Refreshes in {countdown}s
        </span>
      </div>
      
      <p className="text-xs text-gray-400 mt-4 text-center">
        This QR code updates automatically. Do not screenshot.
      </p>
    </div>
  );
};

export default DynamicQRCode;
