import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { CheckCircle, XCircle, Camera, Globe, Bus, MapPin, Users, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    totalExpected: 'Expected Passengers',
    busNumber: 'Bus Number',
    route: 'Assigned Route',
    stops: 'Route Stops',
    seatMatrix: 'Seat Matrix',
    boarded: 'Boarded',
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
    totalExpected: 'எதிர்பார்க்கப்படும் பயணிகள்',
    busNumber: 'பேருந்து எண்',
    route: 'ஒதுக்கப்பட்ட வழித்தடம்',
    stops: 'வழித்தட நிறுத்தங்கள்',
    seatMatrix: 'இருக்கை அமைப்பு',
    boarded: 'ஏறியவர்கள்',
  }
};

const ROUTES_DB: Record<string, string[]> = {
  'Tambaram - VIT': ['Tambaram', 'Perungalathur', 'Vandalur', 'VIT'],
  'Alandur - VIT': ['Alandur', 'Guindy', 'Pallavaram', 'Chromepet', 'VIT'],
  'Velachery - VIT': ['Velachery', 'Pallikaranai', 'Medavakkam', 'VIT'],
  'Sholinganallur - VIT': ['Sholinganallur', 'Navalur', 'Kelambakkam', 'VIT'],
};

// Mock seats data (true = booked, false = empty)
const generateMockSeats = () => {
  const seats = Array(40).fill(false);
  // Randomly book some seats
  const numBooked = Math.floor(Math.random() * 15) + 10;
  for (let i = 0; i < numBooked; i++) {
    seats[Math.floor(Math.random() * 40)] = true;
  }
  return seats;
};

const DriverScanner: React.FC = () => {
  const { user } = useAuth();
  const driverRoute = user?.route || 'Tambaram - VIT';
  const busType = user?.subscriptionType || 'AC';
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [seatMatrix, setSeatMatrix] = useState<boolean[]>([]);
  const [boardedCount, setBoardedCount] = useState(0);

  const t = translations[lang];
  const stops = ROUTES_DB[driverRoute] || ROUTES_DB['Tambaram - VIT'];
  const busNumber = `TN-0${Math.floor(Math.random() * 9) + 1}-${busType === 'AC' ? 'AC' : 'NA'}-${Math.floor(Math.random() * 9000) + 1000}`;

  useEffect(() => {
    setSeatMatrix(generateMockSeats());
  }, []);

  const totalExpected = seatMatrix.filter(s => s).length;

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
  };

  const handleScan = async (qrPayload: string) => {
    setIsScanning(false);
    
    try {
      const payload = JSON.parse(qrPayload);
      
      // Simulate backend delay and success
      setTimeout(() => {
        setScanResult({ success: true, passengerName: payload.name || 'Student', seatNumber: payload.seat || Math.floor(Math.random() * 40) + 1 });
        setBoardedCount(prev => prev + 1);
      }, 500);

    } catch (err) {
      setScanResult({ success: false, error: t.formatError });
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden text-slate-800">
      
      {/* LEFT PANEL - ROUTE & MATRIX */}
      <div className="w-full md:w-1/3 bg-white p-6 border-r border-slate-200 overflow-y-auto hidden md:block">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bus className="text-busmate-600" size={24} />
            <h2 className="text-xl font-black uppercase text-obsidian-900">{t.busNumber}</h2>
          </div>
          <p className="text-3xl font-mono font-bold text-slate-700 bg-slate-100 py-2 px-4 rounded-xl inline-block border-2 border-slate-200">{busNumber}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{t.route}</h2>
          <div className="bg-obsidian-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h3 className="text-xl font-bold mb-6 relative z-10">{driverRoute}</h3>
            
            <div className="relative border-l-2 border-white/20 ml-2 pl-6 py-2 space-y-6 z-10">
              {stops.map((stop, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 bg-amber-400 rounded-full border-4 border-obsidian-900 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                  <p className="text-sm font-bold text-slate-200">{stop}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{t.seatMatrix}</h2>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-4 gap-3 max-w-[200px] mx-auto">
              {seatMatrix.map((isBooked, i) => {
                // Insert aisle gap
                const isAisle = i % 4 === 2;
                return (
                  <React.Fragment key={i}>
                    {isAisle && <div className="col-span-1"></div>}
                    <div className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border-b-4 ${isBooked ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-300'}`}>
                      {i + 1}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-100 border-b-4 border-amber-300 rounded"></div><span className="text-xs font-bold text-slate-500">Booked</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-b-4 border-slate-200 rounded"></div><span className="text-xs font-bold text-slate-500">Empty</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - SCANNER */}
      <div className="flex-1 flex flex-col bg-slate-900 text-white relative">
        <div className="p-6 flex items-center justify-between border-b border-white/10 z-10 bg-slate-900/80 backdrop-blur-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Camera size={24} className="text-amber-400" />
            {t.terminalTitle}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Globe size={16} />
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
            <span className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full uppercase tracking-widest font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              {t.live}
            </span>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          {!tripStarted ? (
            <div className="w-full max-w-md space-y-6">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center backdrop-blur-sm">
                <Users size={48} className="text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.manifestTitle}</h2>
                <div className="mt-6 flex justify-center gap-8">
                  <div>
                    <p className="text-4xl font-black text-white">{totalExpected}</p>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{t.totalExpected}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleStartTrip}
                className="w-full bg-amber-400 hover:bg-amber-500 text-obsidian-900 font-black text-xl py-6 rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.3)] transition-transform transform hover:-translate-y-1"
              >
                {t.startTrip}
              </button>
            </div>
          ) : (
            <>
              <div className="w-full max-w-md mb-8 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <p className="text-3xl font-black text-amber-400">{boardedCount}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.boarded}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <p className="text-3xl font-black text-white">{totalExpected}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalExpected}</p>
                </div>
              </div>

              {/* Video feed overlayed with scanner box */}
              <div className={`relative w-full max-w-md aspect-square bg-black rounded-3xl overflow-hidden border-4 ${scanResult ? (scanResult.success ? 'border-emerald-500' : 'border-red-500') : 'border-amber-400'} shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors`}>
                <video id="video-preview" className="w-full h-full object-cover" />
                
                {isScanning && (
                  <>
                    <div className="absolute inset-0 border-2 border-dashed border-amber-400/50 m-12 rounded-2xl animate-[pulse_2s_ease-in-out_infinite] pointer-events-none"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
                  </>
                )}
              </div>

              {scanResult && (
                <div className={`mt-8 w-full max-w-md p-6 rounded-2xl ${scanResult.success ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-50' : 'bg-red-500/10 border border-red-500/50 text-red-50'} backdrop-blur-md`}>
                  <div className="flex items-center gap-3 mb-6">
                    {scanResult.success ? <CheckCircle size={32} className="text-emerald-400" /> : <XCircle size={32} className="text-red-400" />}
                    <h2 className="text-xl font-bold">
                      {scanResult.success ? t.approved : t.denied}
                    </h2>
                  </div>
                  
                  {scanResult.success ? (
                    <div className="space-y-4 bg-black/20 p-4 rounded-xl">
                      <p className="text-sm font-bold uppercase tracking-wider text-emerald-400/80">{t.passenger}</p>
                      <p className="text-2xl font-black">{scanResult.passengerName}</p>
                      
                      <div className="h-px bg-white/10 w-full"></div>
                      
                      <p className="text-sm font-bold uppercase tracking-wider text-emerald-400/80">{t.seat}</p>
                      <p className="text-4xl font-black text-amber-400">{scanResult.seatNumber}</p>
                    </div>
                  ) : (
                    <p className="text-red-300 font-medium text-lg">{scanResult.error}</p>
                  )}

                  <button 
                    onClick={resumeScanning}
                    className="mt-6 w-full bg-white text-obsidian-900 font-black py-4 rounded-xl hover:bg-slate-200 transition-colors text-lg"
                  >
                    {t.scanNext}
                  </button>
                </div>
              )}

              {!scanResult && (
                <p className="mt-8 text-slate-400 text-center max-w-sm font-medium text-lg leading-relaxed">
                  {t.scanInstruction}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverScanner;
