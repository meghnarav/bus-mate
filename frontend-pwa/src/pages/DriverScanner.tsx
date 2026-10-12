import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle, Camera, Globe, Bus, MapPin, Users, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/library';
import { getBookings } from '../data/mockBookings';
import SeatPickerGrid from '../components/SeatPickerGrid';

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
    logout: 'Logout',
    tripDetails: 'Trip Details',
    driverContact: 'Driver Name & Contact',
    busTypeRoute: 'Bus Type & Route',
    bookedSeats: 'Booked Seats',
    unbooked: 'Unbooked',
    yetToBoard: 'Yet to Board',
    langToggle: 'தமிழ் (TA)',
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
    logout: 'வெளியேறு',
    tripDetails: 'பயண விவரங்கள்',
    driverContact: 'ஓட்டுநர் பெயர் & தொடர்பு',
    busTypeRoute: 'பேருந்து வகை & வழித்தடம்',
    bookedSeats: 'முன்பதிவு செய்யப்பட்டவை',
    unbooked: 'முன்பதிவு செய்யப்படாதவை',
    yetToBoard: 'ஏற வேண்டியவர்கள்',
    langToggle: 'English (EN)',
  }
};

const ROUTES_DB: Record<string, string[]> = {
  'Tambaram - VIT': ['Tambaram', 'Perungalathur', 'Vandalur', 'VIT'],
  'Alandur - VIT': ['Alandur', 'Guindy', 'Pallavaram', 'Chromepet', 'VIT'],
  'Velachery - VIT': ['Velachery', 'Pallikaranai', 'Medavakkam', 'VIT'],
  'Sholinganallur - VIT': ['Sholinganallur', 'Navalur', 'Kelambakkam', 'VIT'],
};

// Load seats from live database
const loadSeats = (route: string, busType: string) => {
  const seats = Array(50).fill(false);
  const bookings = getBookings();
  
  bookings.forEach(b => {
    // Only map seats if it matches the driver's route and bus type
    if (b.route === route && b.bus === busType) {
      b.seats.forEach(seatStr => {
        const seatNum = parseInt(seatStr, 10);
        if (!isNaN(seatNum) && seatNum > 0 && seatNum <= 50) {
          seats[seatNum - 1] = true;
        }
      });
    }
  });
  return seats;
};

const DriverScanner: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  
  // Stable deterministic bus number based on route and busType
  const busNumber = React.useMemo(() => {
    const routeCodes: Record<string, string> = {
      'Tambaram - VIT': 'TBM-101',
      'Alandur - VIT': 'ALD-202',
      'Velachery - VIT': 'VEL-303',
      'Sholinganallur - VIT': 'SHL-404',
    };
    const code = routeCodes[driverRoute] || 'VIT-505';
    return `TN-22-BY-${code}-${busType === 'AC' ? 'AC' : 'NA'}`;
  }, [driverRoute, busType]);

  useEffect(() => {
    setSeatMatrix(loadSeats(driverRoute, busType));
    
    // Poll for live updates
    const interval = setInterval(() => {
      setSeatMatrix(loadSeats(driverRoute, busType));
    }, 2000);
    return () => clearInterval(interval);
  }, [driverRoute, busType]);

  const totalExpected = seatMatrix.filter(s => s).length;
  const reservedSeatsList = seatMatrix.map((isBooked, i) => isBooked ? i + 1 : -1).filter(s => s !== -1);

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
        setScanResult({ success: true, passengerName: payload.name || 'Student', seatNumber: payload.seat || Math.floor(Math.random() * 50) + 1 });
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden text-slate-800">
      
      {/* LEFT PANEL - ROUTE & MATRIX (Acts as driver menu) */}
      <div className="w-full flex-[2] bg-white border-r border-slate-200 hidden md:flex flex-col">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Info Column */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="text-busmate-600" size={20} />
                  <h2 className="text-sm font-black uppercase text-obsidian-900">{t.busNumber}</h2>
                </div>
                <p className="text-2xl font-mono font-bold text-slate-700 bg-slate-100 py-1.5 px-3 rounded-lg inline-block border-2 border-slate-200">{busNumber}</p>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.route}</h2>
                <div className="bg-obsidian-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                  <h3 className="text-lg font-bold mb-4 relative z-10">{driverRoute}</h3>
                  
                  <div className="relative border-l-2 border-white/20 ml-2 pl-4 py-1 space-y-4 z-10">
                    {stops.map((stop, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-obsidian-900 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                        <p className="text-xs font-bold text-slate-200">{stop}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.tripDetails}</h2>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.driverContact}</p>
                    <p className="text-sm font-bold text-slate-800">{user?.fullName || 'Selvam K.'} • +91 98765 43210</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.busTypeRoute}</p>
                    <p className="text-sm font-bold text-slate-800">{busType} • {driverRoute}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.bookedSeats}</p>
                    <p className="text-lg font-black text-amber-500">{totalExpected}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.unbooked}</p>
                    <p className="text-lg font-black text-slate-400">{50 - totalExpected}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.boarded}</p>
                    <p className="text-lg font-black text-emerald-500">{boardedCount}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.yetToBoard}</p>
                    <p className="text-lg font-black text-red-400">{Math.max(0, totalExpected - boardedCount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Column */}
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{t.seatMatrix}</h2>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-hidden transform scale-90 origin-top">
                <SeatPickerGrid 
                  rows={10} 
                  reservedSeats={reservedSeatsList} 
                  selectedSeats={[]} 
                  onSeatSelect={() => {}} 
                  groupSize={1} 
                  disabled={true}
                  variant="driver"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - SCANNER */}
      <div className="w-full md:w-96 flex flex-col bg-slate-900 text-white relative shadow-2xl z-20">
        <div className="sticky top-0 z-50 p-4 flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-900/90 backdrop-blur-md gap-2">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Camera size={20} className="text-amber-400" />
            {t.terminalTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {t.live}
            </span>
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Globe size={14} />
              {t.langToggle}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <LogOut size={14} />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center p-4 relative overflow-y-auto">
          {!tripStarted ? (
            <div className="w-full space-y-4 mt-8">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                <Users size={32} className="text-amber-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-1">{t.manifestTitle}</h2>
                <div className="mt-4 flex justify-center">
                  <div>
                    <p className="text-3xl font-black text-white">{totalExpected}</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t.totalExpected}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleStartTrip}
                className="w-full bg-amber-400 hover:bg-amber-500 text-obsidian-900 font-black text-sm py-4 rounded-xl shadow-[0_10px_30px_rgba(251,191,36,0.3)] transition-transform transform hover:-translate-y-1"
              >
                {t.startTrip}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm mt-4">
              <div className="w-full mb-4 grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-2xl font-black text-amber-400">{boardedCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.boarded}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-2xl font-black text-white">{totalExpected}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalExpected}</p>
                </div>
              </div>

              {/* Video feed overlayed with scanner box */}
              <div className={`relative w-full aspect-square bg-black rounded-2xl overflow-hidden border-2 ${scanResult ? (scanResult.success ? 'border-emerald-500' : 'border-red-500') : 'border-amber-400'} shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors`}>
                <video id="video-preview" className="w-full h-full object-cover" />
                
                {isScanning && (
                  <>
                    <div className="absolute inset-0 border border-dashed border-amber-400/50 m-8 rounded-xl animate-[pulse_2s_ease-in-out_infinite] pointer-events-none"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
                  </>
                )}
              </div>

              {scanResult && (
                <div className={`mt-4 w-full p-4 rounded-xl ${scanResult.success ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-50' : 'bg-red-500/10 border border-red-500/50 text-red-50'} backdrop-blur-md`}>
                  <div className="flex items-center gap-2 mb-4">
                    {scanResult.success ? <CheckCircle size={24} className="text-emerald-400" /> : <XCircle size={24} className="text-red-400" />}
                    <h2 className="text-lg font-bold">
                      {scanResult.success ? t.approved : t.denied}
                    </h2>
                  </div>
                  
                  {scanResult.success ? (
                    <div className="space-y-3 bg-black/20 p-3 rounded-lg">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">{t.passenger}</p>
                      <p className="text-xl font-black">{scanResult.passengerName}</p>
                      
                      <div className="h-px bg-white/10 w-full"></div>
                      
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">{t.seat}</p>
                      <p className="text-3xl font-black text-amber-400">{scanResult.seatNumber}</p>
                    </div>
                  ) : (
                    <p className="text-red-300 font-medium text-sm">{scanResult.error}</p>
                  )}

                  <button 
                    onClick={resumeScanning}
                    className="mt-4 w-full bg-white text-obsidian-900 font-black py-3 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    {t.scanNext}
                  </button>
                </div>
              )}

              {!scanResult && (
                <p className="mt-6 text-slate-400 text-center text-sm font-medium leading-relaxed">
                  {t.scanInstruction}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverScanner;
