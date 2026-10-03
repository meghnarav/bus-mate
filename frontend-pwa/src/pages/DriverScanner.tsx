import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { CheckCircle, XCircle, Camera } from 'lucide-react';

interface ScanResult {
  success: boolean;
  passengerName?: string;
  seatNumber?: number;
  error?: string;
}

const DriverScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = new BrowserMultiFormatReader();
    
    if (isScanning && codeReader) {
      codeReader.decodeFromVideoDevice(null, 'video-preview', (result, error) => {
        if (result) {
          handleScan(result.getText());
        }
      });
    }

    return () => {
      if (codeReader) {
        codeReader.reset();
        codeReader = null;
      }
    };
  }, [isScanning]);

  const handleScan = async (qrPayload: string) => {
    setIsScanning(false); // Pause scanning
    
    try {
      const payload = JSON.parse(qrPayload);
      
      // Call backend API /qr/scan
      const response = await fetch('http://localhost:8080/api/v1/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Use actual auth mechanism
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScanResult({ success: true, passengerName: data.passengerName, seatNumber: data.seatNumber });
      } else {
        setScanResult({ success: false, error: data.error });
      }
    } catch (err) {
      setScanResult({ success: false, error: 'Invalid QR Format' });
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Camera size={24} className="text-indigo-400" />
          Driver Terminal
        </h1>
        <span className="text-xs bg-indigo-600 px-2 py-1 rounded-full uppercase tracking-widest font-bold">Live</span>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
        
        {/* Video feed overlayed with scanner box */}
        <div className={`relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-4 ${scanResult ? (scanResult.success ? 'border-green-500' : 'border-red-500') : 'border-indigo-500'} shadow-2xl`}>
          <video id="video-preview" className="w-full h-full object-cover" />
          
          {isScanning && (
            <div className="absolute inset-0 border-2 border-dashed border-indigo-400/50 m-8 rounded-xl animate-pulse pointer-events-none"></div>
          )}
        </div>

        {scanResult && (
          <div className={`mt-8 w-full max-w-sm p-6 rounded-2xl ${scanResult.success ? 'bg-green-800/30 border border-green-500/50' : 'bg-red-800/30 border border-red-500/50'}`}>
            <div className="flex items-center gap-3 mb-4">
              {scanResult.success ? <CheckCircle size={32} className="text-green-400" /> : <XCircle size={32} className="text-red-400" />}
              <h2 className="text-xl font-bold">
                {scanResult.success ? 'BOARDING APPROVED' : 'ACCESS DENIED'}
              </h2>
            </div>
            
            {scanResult.success ? (
              <div className="space-y-1">
                <p className="text-gray-300">Passenger: <span className="text-white font-semibold">{scanResult.passengerName}</span></p>
                <p className="text-gray-300">Seat Number: <span className="text-white font-bold text-2xl">{scanResult.seatNumber}</span></p>
              </div>
            ) : (
              <p className="text-red-300 font-medium">{scanResult.error}</p>
            )}

            <button 
              onClick={resumeScanning}
              className="mt-6 w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Scan Next Passenger
            </button>
          </div>
        )}

        {!scanResult && (
          <p className="mt-8 text-gray-400 text-center max-w-xs">
            Point camera at the passenger's rotating QR ticket to validate boarding.
          </p>
        )}
      </div>
    </div>
  );
};

export default DriverScanner;
