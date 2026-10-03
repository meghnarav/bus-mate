import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { CheckCircle, XCircle, Camera, Globe, Bus } from 'lucide-react';

interface ScanResult {
  success: boolean;
  passengerName?: string;
  seatNumber?: number;
  error?: string;
}

const translations = {
  en: {
    terminalTitle: 'Driver Terminal',
    live: 'Live',
    startTrip: 'START TRIP & CLOSE BOOKINGS',
    manifestTitle: 'Pre-Trip Manifest',
    scanInstruction: 'Point camera at the passenger\'s rotating QR ticket to validate boarding.',
    scanNext: 'Scan Next Passenger',
    approved: 'BOARDING APPROVED',
    denied: 'ACCESS DENIED',
    passenger: 'Passenger',
    seat: 'Seat Number',
    formatError: 'Invalid QR Format',
    totalExpected: 'Expected Passengers: 24'
  },
  ta: {
    terminalTitle: 'ஓட்டுநர் முனையம்',
    live: 'நேரலை',
    startTrip: 'பயணத்தை தொடங்கு',
    manifestTitle: 'பயணிகள் பட்டியல்',
    scanInstruction: 'பயணியின் QR டிக்கெட்டை ஸ்கேன் செய்யவும்.',
    scanNext: 'அடுத்த பயணியை ஸ்கேன் செய்யவும்',
    approved: 'அனுமதிக்கப்பட்டது',
    denied: 'அனுமதி மறுக்கப்பட்டது',
    passenger: 'பயணி',
    seat: 'இருக்கை எண்',
    formatError: 'தவறான QR வடிவம்',
    totalExpected: 'எதிர்பார்க்கப்படும் பயணிகள்: 24'
  }
};

const DriverScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false); // don't scan until trip starts
  const [tripStarted, setTripStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  const t = translations[lang];

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

  const handleStartTrip = () => {
    setTripStarted(true);
    setIsScanning(true);
    // Future: API call to close bookings
  };

  const handleScan = async (qrPayload: string) => {
    setIsScanning(false);
    
    try {
      const payload = JSON.parse(qrPayload);
      
      const response = await fetch('http://localhost:8080/api/v1/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      setScanResult({ success: false, error: t.formatError });
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl m-4 border-4 border-slate-800">
      <div className="p-5 bg-slate-800 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Camera size={24} className="text-amber-400" />
          {t.terminalTitle}
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
          >
            <Globe size={16} />
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>
          <span className="text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded-full uppercase tracking-widest font-bold">{t.live}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
        
        {!tripStarted ? (
          <div className="w-full max-w-sm space-y-6">
            <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-lg text-center">
              <Bus size={48} className="text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t.manifestTitle}</h2>
              <p className="text-slate-400 font-medium text-lg">{t.totalExpected}</p>
            </div>
            
            <button 
              onClick={handleStartTrip}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xl py-6 rounded-2xl shadow-xl transition-transform transform hover:-translate-y-1"
            >
              {t.startTrip}
            </button>
          </div>
        ) : (
          <>
            {/* Video feed overlayed with scanner box */}
            <div className={`relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-4 ${scanResult ? (scanResult.success ? 'border-emerald-500' : 'border-red-500') : 'border-amber-500'} shadow-2xl transition-colors`}>
              <video id="video-preview" className="w-full h-full object-cover" />
              
              {isScanning && (
                <div className="absolute inset-0 border-2 border-dashed border-amber-400/50 m-8 rounded-xl animate-[pulse_2s_ease-in-out_infinite] pointer-events-none"></div>
              )}
            </div>

            {scanResult && (
              <div className={`mt-8 w-full max-w-sm p-6 rounded-2xl ${scanResult.success ? 'bg-emerald-900/40 border border-emerald-500/50' : 'bg-red-900/40 border border-red-500/50'} backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  {scanResult.success ? <CheckCircle size={32} className="text-emerald-400" /> : <XCircle size={32} className="text-red-400" />}
                  <h2 className="text-xl font-bold">
                    {scanResult.success ? t.approved : t.denied}
                  </h2>
                </div>
                
                {scanResult.success ? (
                  <div className="space-y-2">
                    <p className="text-slate-300">{t.passenger}: <span className="text-white font-semibold">{scanResult.passengerName}</span></p>
                    <p className="text-slate-300 flex items-center justify-between">
                      {t.seat}: <span className="text-amber-400 font-black text-3xl">{scanResult.seatNumber}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-red-300 font-medium">{scanResult.error}</p>
                )}

                <button 
                  onClick={resumeScanning}
                  className="mt-6 w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-xl hover:bg-white transition-colors text-lg"
                >
                  {t.scanNext}
                </button>
              </div>
            )}

            {!scanResult && (
              <p className="mt-8 text-slate-400 text-center max-w-xs font-medium text-lg leading-relaxed">
                {t.scanInstruction}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverScanner;
