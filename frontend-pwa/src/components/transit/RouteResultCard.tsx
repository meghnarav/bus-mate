import React from 'react';
import { Bus, Zap, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export interface TransitRoute {
  id: string;
  shuttleCode: string; // e.g. "SH-204"
  shuttleName: string; // e.g. "Campus Express Line 4"
  category: 'AC' | 'Non-AC' | 'Electric Express';
  departureTime: string;
  arrivalTime: string;
  duration: string;
  originLandmark: string;
  destinationLandmark: string;
  seatsTotal: number;
  seatsAvailable: number;
  status: 'live' | 'filling' | 'soldOut';
  fare: number; // 0 for FREE
  nextStopETA?: string;
  isFemalePriority?: boolean;
}

interface RouteResultCardProps {
  route: TransitRoute;
  onSelectSeats: (route: TransitRoute) => void;
  isSelected?: boolean;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({
  route,
  onSelectSeats,
  isSelected = false,
}) => {
  const getStatusBadge = () => {
    switch (route.status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-status-liveBg text-status-live border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-status-live animate-status-blink" />
            LIVE TRACKING
          </span>
        );
      case 'filling':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-status-fillingBg text-status-filling border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-status-filling" />
            FILLING FAST
          </span>
        );
      case 'soldOut':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-status-soldOutBg text-status-soldOut border border-rose-200">
            SOLD OUT
          </span>
        );
    }
  };

  const isSoldOut = route.status === 'soldOut' || route.seatsAvailable === 0;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-transit-red ring-2 ring-transit-red/20'
          : 'border-transit-border hover:border-slate-300'
      }`}
    >
      <div className="p-5 md:p-6 flex flex-col gap-5">
        
        {/* Header Chunk: Shuttle Name, Code, Badges, Category */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bus className="w-5 h-5 text-transit-red" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm bg-slate-100 text-transit-ink px-2 py-0.5 rounded border border-slate-200">
                  {route.shuttleCode}
                </span>
                <h3 className="font-bold text-transit-ink text-base md:text-lg">
                  {route.shuttleName}
                </h3>
              </div>
              <p className="text-xs text-transit-subtle mt-0.5 flex items-center gap-2">
                <span>{route.category} Service</span>
                <span>•</span>
                <span>Direct Route</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {route.category === 'Electric Express' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <Zap className="w-3 h-3 text-sky-600" /> EV Shuttle
              </span>
            )}
            {route.isFemalePriority && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-status-femaleBg text-status-female border border-pink-200">
                <UserCheck className="w-3 h-3" /> Priority Rows
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Departure, Timeline & Arrival Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Departure */}
          <div className="md:col-span-3 text-left">
            <div className="font-mono font-black text-2xl text-transit-ink tracking-tight">
              {route.departureTime}
            </div>
            <div className="text-xs font-bold text-transit-subtle mt-1 truncate">
              {route.originLandmark}
            </div>
            <div className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">
              Pickup Point
            </div>
          </div>

          {/* Connected Timeline Bar */}
          <div className="md:col-span-6 flex flex-col items-center justify-center px-2">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-transit-subtle mb-1.5">
              <span className="font-bold text-transit-ink">{route.duration} Non-stop</span>
              {route.nextStopETA && (
                <span className="text-status-live font-semibold">ETA: {route.nextStopETA}</span>
              )}
            </div>
            
            {/* Visual connected line with dots */}
            <div className="w-full relative flex items-center">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-white z-10 shrink-0" />
              <div className="flex-1 h-0.5 bg-slate-200 relative mx-1">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full border-2 border-transit-red bg-white z-10 shrink-0" />
            </div>

            <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>Origin Stop</span>
              <span>Campus Gate / Hub</span>
            </div>
          </div>

          {/* Arrival */}
          <div className="md:col-span-3 text-left md:text-right">
            <div className="font-mono font-black text-2xl text-transit-ink tracking-tight">
              {route.arrivalTime}
            </div>
            <div className="text-xs font-bold text-transit-subtle mt-1 truncate">
              {route.destinationLandmark}
            </div>
            <div className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">
              Dropoff Point
            </div>
          </div>
        </div>

        {/* Footer Bar: Availability, Fare, and High-Contrast Action CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-4 md:px-6 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                    isSoldOut
                      ? 'bg-rose-100 text-status-soldOut'
                      : route.seatsAvailable < 10
                      ? 'bg-amber-100 text-status-filling'
                      : 'bg-emerald-100 text-status-live'
                  }`}
                >
                  {isSoldOut ? '0 Seats' : `${route.seatsAvailable} Seats Left`}
                </span>
                <span className="text-xs text-transit-subtle">
                  of {route.seatsTotal} total
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Sanitized & GPS Geofenced</span>
              </div>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] font-mono uppercase text-transit-subtle block">Fare</span>
              <span className="font-mono font-black text-base text-transit-ink">
                {route.fare === 0 ? (
                  <span className="text-status-live">FREE PASS</span>
                ) : (
                  `₹${route.fare}`
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => onSelectSeats(route)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
              isSoldOut
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-transit-red hover:bg-transit-redHover text-white shadow-transit-red/20 hover:shadow-transit-red/40 active:scale-95'
            }`}
          >
            <span>{isSoldOut ? 'Sold Out' : 'Select Seats'}</span>
            {!isSoldOut && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
