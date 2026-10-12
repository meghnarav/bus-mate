import React from 'react';
import { ArrowLeftRight, MapPin, Sparkles, Clock, Calendar } from 'lucide-react';

export interface RouteOption {
  id: string;
  name: string;
  landmark: string;
}

interface OriginDestinationHeroProps {
  origin: string;
  destination: string;
  landmarks: RouteOption[];
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwap: () => void;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  onSearch: () => void;
}

export const OriginDestinationHero: React.FC<OriginDestinationHeroProps> = ({
  origin,
  destination,
  landmarks,
  onOriginChange,
  onDestinationChange,
  onSwap,
  selectedSlot,
  onSelectSlot,
  onSearch,
}) => {
  const quickSlots = [
    { id: 'next', label: 'Next Available', time: '10 mins away', icon: Sparkles },
    { id: 'morning', label: 'Morning Peak', time: '08:00 AM - 10:30 AM', icon: Clock },
    { id: 'afternoon', label: 'Mid-Day Slots', time: '01:00 PM - 03:30 PM', icon: Clock },
    { id: 'evening', label: 'Evening Peak', time: '05:00 PM - 07:30 PM', icon: Calendar },
  ];

  return (
    <div className="w-full">
      {/* Container with High-Contrast Commercial Transit Aesthetic */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-transit-border relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transit-redLight text-transit-red text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-transit-red animate-ping" />
              BusMate Express Transit
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-transit-ink tracking-tight">
              Where are you commuting today?
            </h1>
            <p className="text-sm text-transit-subtle mt-1">
              Select origin, destination and time slot to view real-time fleet occupancy.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-status-live animate-status-blink" />
            <span className="text-xs font-bold font-mono text-transit-ink uppercase">GPS Tracking Active</span>
          </div>
        </div>

        {/* Input Card Grid with Overlapping Circular Swap Button */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-center">
          
          {/* FROM FIELD */}
          <div className="relative group bg-transit-surface hover:bg-slate-50 border-2 border-slate-200 hover:border-transit-red focus-within:border-transit-red focus-within:bg-white rounded-2xl p-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-status-live flex items-center justify-center shrink-0 font-bold">
                <MapPin className="w-5 h-5 text-status-live" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] uppercase font-mono font-bold tracking-widest text-transit-subtle block mb-1">
                  Boarding Point (From)
                </label>
                <select
                  value={origin}
                  onChange={(e) => onOriginChange(e.target.value)}
                  className="w-full bg-transparent font-black text-transit-ink text-base md:text-lg outline-none cursor-pointer appearance-none truncate"
                >
                  {landmarks.map((loc) => (
                    <option key={`from-${loc.id}`} value={loc.id}>
                      {loc.name} — {loc.landmark}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* OVERLAPPING SWAP BUTTON */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
            <button
              type="button"
              onClick={onSwap}
              title="Swap Origin and Destination"
              aria-label="Swap Origin and Destination"
              className="w-11 h-11 rounded-full bg-white text-transit-ink border-2 border-slate-200 hover:border-transit-red hover:text-transit-red shadow-md hover:shadow-lg flex items-center justify-center transition-all transform hover:rotate-180 active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile swap button fallback */}
          <div className="flex md:hidden justify-center -my-2 z-10">
            <button
              type="button"
              onClick={onSwap}
              className="w-9 h-9 rounded-full bg-white text-transit-ink border border-slate-300 shadow-sm flex items-center justify-center active:scale-90"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-90" />
            </button>
          </div>

          {/* TO FIELD */}
          <div className="relative group bg-transit-surface hover:bg-slate-50 border-2 border-slate-200 hover:border-transit-red focus-within:border-transit-red focus-within:bg-white rounded-2xl p-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-transit-redLight text-transit-red flex items-center justify-center shrink-0 font-bold">
                <MapPin className="w-5 h-5 text-transit-red" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] uppercase font-mono font-bold tracking-widest text-transit-subtle block mb-1">
                  Destination (To)
                </label>
                <select
                  value={destination}
                  onChange={(e) => onDestinationChange(e.target.value)}
                  className="w-full bg-transparent font-black text-transit-ink text-base md:text-lg outline-none cursor-pointer appearance-none truncate"
                >
                  {landmarks.map((loc) => (
                    <option key={`to-${loc.id}`} value={loc.id}>
                      {loc.name} — {loc.landmark}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Date / Time Slot Chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle block mb-2">
              Quick Filter By Slot:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {quickSlots.map((slot) => {
                const Icon = slot.icon;
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-transit-ink text-white border-transit-ink shadow-sm'
                        : 'bg-white text-transit-subtle border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-transit-red' : 'text-slate-400'}`} />
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onSearch}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-transit-red hover:bg-transit-redHover text-white font-black text-sm md:text-base tracking-wide uppercase shadow-lg shadow-transit-red/25 hover:shadow-transit-red/40 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>Search Shuttles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
