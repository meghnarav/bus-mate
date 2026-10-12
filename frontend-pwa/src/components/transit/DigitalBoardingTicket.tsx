import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Bus, Clock, MapPin, AlertCircle, Share2, Download } from 'lucide-react';
import { generateDynamicQR } from '../../utils/crypto-qr';

export interface BoardingPassData {
  pnr: string;
  registrationNumber: string;
  studentName: string;
  shuttleCode: string;
  shuttleName: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: string[];
  fare: number;
  secretSeed?: string;
}

interface DigitalBoardingTicketProps {
  pass: BoardingPassData;
  onClose?: () => void;
}

export const DigitalBoardingTicket: React.FC<DigitalBoardingTicketProps> = ({
  pass,
  onClose,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [secondsPulse, setSecondsPulse] = useState<number>(0);
  const [qrPayload, setQrPayload] = useState<string>('');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(30);

  // Real-time ticking clock for anti-screenshot verification
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      const unix = Math.floor(Date.now() / 1000);
      const rem = unix % 30;
      setSecondsPulse(now.getSeconds());
      setRefreshCountdown(30 - rem);
      
      const payload = generateDynamicQR(pass.pnr, pass.secretSeed || 'campus-transit-secret');
      setQrPayload(payload);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [pass.pnr, pass.secretSeed]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Ticket Cutout Shell */}
      <div className="bg-white rounded-[2rem] border border-transit-border shadow-2xl overflow-hidden relative">
        
        {/* Top Header Strip with Brand + Anti-tamper dynamic pulse */}
        <div className="bg-transit-ink text-white p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-transit-red flex items-center justify-center font-black text-white text-sm">
                BM
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-white block">
                  BusMate
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400 block -mt-0.5">
                  Official M-Ticket
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-status-live animate-status-blink" />
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                VALID PASS
              </span>
            </div>
          </div>

          {/* Shuttle and PNR Overview */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                PNR Number
              </span>
              <span className="font-mono font-black text-xl text-white tracking-wider">
                {pass.pnr}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Shuttle Code
              </span>
              <span className="font-mono font-black text-xl text-transit-red tracking-wider">
                {pass.shuttleCode}
              </span>
            </div>
          </div>
        </div>

        {/* Route Landmark Banner */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase text-transit-subtle block">Boarding</span>
              <span className="font-bold text-transit-ink text-base block truncate">{pass.origin}</span>
              <span className="font-mono text-xs text-transit-red font-bold">{pass.departureTime}</span>
            </div>

            <div className="flex flex-col items-center px-4">
              <Bus className="w-5 h-5 text-slate-400 mb-1" />
              <div className="w-12 h-0.5 bg-slate-300 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-transit-red" />
              </div>
            </div>

            <div className="flex-1 text-right">
              <span className="text-[10px] font-mono uppercase text-transit-subtle block">Destination</span>
              <span className="font-bold text-transit-ink text-base block truncate">{pass.destination}</span>
              <span className="font-mono text-xs text-status-live font-bold">Main Drop</span>
            </div>
          </div>
        </div>

        {/* REALISTIC TICKET NOTCHES & DASHED SEPARATOR */}
        <div className="relative py-2 bg-white flex items-center justify-between">
          {/* Left Semi-Circular Cutout Notch */}
          <div className="w-6 h-6 rounded-r-full bg-transit-surface border-y border-r border-slate-200 -ml-1" />
          
          {/* Dashed Separator Line */}
          <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-3" />
          
          {/* Right Semi-Circular Cutout Notch */}
          <div className="w-6 h-6 rounded-l-full bg-transit-surface border-y border-l border-slate-200 -mr-1" />
        </div>

        {/* QR Code and Passenger Details Section */}
        <div className="p-6 text-center">
          
          {/* Anti-Screenshot Live Security Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-xs font-bold text-amber-800">Live Device Time:</span>
            </div>
            <div className="font-mono font-black text-sm text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
              {currentTime || 'Syncing...'}
            </div>
          </div>

          {/* High-Contrast Dynamic Scannable QR Code */}
          <div className="inline-block p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-inner mb-4 relative">
            <QRCodeSVG
              value={qrPayload || pass.pnr}
              size={180}
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
            
            {/* Watermark Logo in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-black text-xs text-transit-red shadow-sm">
              BM
            </div>
          </div>

          {/* Security Counter */}
          <p className="text-xs font-mono font-bold text-transit-subtle flex items-center justify-center gap-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Dynamic token rotates in{' '}
            <span className="text-transit-ink font-black">{refreshCountdown}s</span>
          </p>

          {/* Passenger Identity Metadata */}
          <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Passenger Name</span>
              <span className="font-bold text-xs text-transit-ink block truncate">{pass.studentName}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Reg / Roll Number</span>
              <span className="font-mono font-black text-xs text-transit-ink block">{pass.registrationNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Seat Assigned</span>
              <span className="font-mono font-black text-sm text-transit-red block">
                {pass.seats.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Pass Fare</span>
              <span className="font-mono font-black text-xs text-status-live block">
                {pass.fare === 0 ? 'FREE COMMUTE' : `₹${pass.fare}`}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Cryptographic Gate Pass • Non-Transferable</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => alert(`PNR ${pass.pnr} link copied to clipboard!`)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-transit-ink text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Pass</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-transit-ink hover:bg-black text-white text-xs font-bold transition"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
