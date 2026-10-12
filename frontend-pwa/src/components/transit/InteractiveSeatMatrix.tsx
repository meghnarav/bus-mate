import React, { useMemo } from 'react';
import { Armchair, CircleDot, User, Sparkles, Check } from 'lucide-react';

export type SeatStatus = 'available' | 'booked' | 'selected' | 'reserved';

export interface SeatData {
  id: number;
  label: string; // e.g., "1A", "1B"
  status: SeatStatus;
  isWindow: boolean;
  isAisle: boolean;
  isFemalePriority?: boolean;
}

interface InteractiveSeatMatrixProps {
  shuttleCode: string;
  totalSeats?: number;
  bookedSeats: number[];
  femalePrioritySeats?: number[];
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  maxSelection?: number;
  farePerSeat?: number;
  onConfirmBooking: () => void;
}

export const InteractiveSeatMatrix: React.FC<InteractiveSeatMatrixProps> = ({
  shuttleCode,
  totalSeats = 40,
  bookedSeats,
  femalePrioritySeats = [1, 2, 3, 4], // First row reserved for female priority
  selectedSeats,
  onToggleSeat,
  maxSelection = 4,
  farePerSeat = 0,
  onConfirmBooking,
}) => {
  // Generate 2x2 layout rows
  // 10 rows of 4 seats each (total 40 seats)
  // Left: Seat A (Window), Seat B (Aisle)
  // [Aisle Walking Corridor]
  // Right: Seat C (Aisle), Seat D (Window)
  const rows = useMemo(() => {
    const rowList: { rowNumber: number; left: SeatData[]; right: SeatData[] }[] = [];
    let seatCounter = 1;
    const numRows = Math.ceil(totalSeats / 4);

    for (let r = 1; r <= numRows; r++) {
      const createSeat = (num: number, colLetter: string, isWindow: boolean, isAisle: boolean): SeatData => {
        let status: SeatStatus = 'available';
        if (selectedSeats.includes(num)) {
          status = 'selected';
        } else if (bookedSeats.includes(num)) {
          status = 'booked';
        } else if (femalePrioritySeats.includes(num)) {
          status = 'reserved';
        }

        return {
          id: num,
          label: `${r}${colLetter}`,
          status,
          isWindow,
          isAisle,
          isFemalePriority: femalePrioritySeats.includes(num),
        };
      };

      const left = [
        createSeat(seatCounter++, 'A', true, false),
        createSeat(seatCounter++, 'B', false, true),
      ];
      const right = [
        createSeat(seatCounter++, 'C', false, true),
        createSeat(seatCounter++, 'D', true, false),
      ];

      rowList.push({ rowNumber: r, left, right });
    }

    return rowList;
  }, [totalSeats, bookedSeats, femalePrioritySeats, selectedSeats]);

  const totalFare = selectedSeats.length * farePerSeat;

  const renderSeatButton = (seat: SeatData) => {
    const isAvailable = seat.status === 'available' || seat.status === 'reserved';
    const isSelected = seat.status === 'selected';
    const isBooked = seat.status === 'booked';
    const isReserved = seat.status === 'reserved';

    let styling = 'border transition-all duration-200 transform ';
    if (isBooked) {
      styling += 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-75';
    } else if (isSelected) {
      styling += 'bg-transit-red border-transit-redHover text-white shadow-md shadow-transit-red/30 scale-105 z-10';
    } else if (isReserved) {
      styling += 'bg-status-femaleBg border-pink-300 text-status-female hover:border-pink-400 hover:shadow-sm cursor-pointer';
    } else {
      styling += 'bg-white border-slate-200 text-transit-ink hover:border-transit-red hover:shadow-sm cursor-pointer active:scale-95';
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked}
        onClick={() => onToggleSeat(seat.id)}
        title={`Seat ${seat.label} (${seat.isWindow ? 'Window' : 'Aisle'}${
          isReserved ? ' - Female Priority' : ''
        })`}
        className={`w-11 h-12 md:w-12 md:h-14 rounded-xl flex flex-col items-center justify-between p-1.5 relative group ${styling}`}
      >
        <div className="flex items-center justify-between w-full">
          <Armchair className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : isReserved ? 'text-status-female' : isBooked ? 'text-slate-400' : 'text-slate-400 group-hover:text-transit-red'}`} />
          {isReserved && !isSelected && (
            <span className="w-1.5 h-1.5 rounded-full bg-status-female" />
          )}
          {isSelected && (
            <Check className="w-3 h-3 text-white stroke-[3]" />
          )}
        </div>
        
        <span className="font-mono font-black text-[11px] md:text-xs">
          {seat.label}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* Legend Bar */}
      <div className="w-full bg-white rounded-2xl border border-transit-border p-4 shadow-sm mb-6">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle mb-3 text-center">
          Seat Status Key
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-transit-ink">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center shrink-0">
              <Armchair className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span>Available</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-200 border-2 border-slate-300 flex items-center justify-center shrink-0">
              <Armchair className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-slate-500">Booked</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-transit-red border-2 border-transit-redHover flex items-center justify-center shrink-0 text-white shadow-sm">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-transit-red font-black">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-status-femaleBg border-2 border-pink-300 flex items-center justify-center shrink-0 text-status-female">
              <User className="w-3 h-3" />
            </div>
            <span className="text-status-female">Reserved</span>
          </div>

        </div>
      </div>

      {/* Bus Coach Shell */}
      <div className="w-full bg-white rounded-[2rem] border-2 border-slate-200 shadow-lg p-6 md:p-8 relative pb-28">
        
        {/* Front of Shuttle: Steering Wheel + Driver Area */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-dashed border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-transit-red animate-ping" />
            <span className="font-mono text-xs font-bold text-transit-subtle uppercase tracking-wider">
              Front Cabin / Entry
            </span>
          </div>

          {/* Realistic Steering Wheel SVG Indicator */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center relative">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="absolute w-full h-0.5 bg-slate-700" />
              <div className="absolute h-full w-0.5 bg-slate-700" />
            </div>
            <span className="text-xs font-bold font-mono text-slate-700 uppercase">Driver</span>
          </div>
        </div>

        {/* 2x2 Layout with Central Aisle */}
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={`row-${row.rowNumber}`} className="flex items-center justify-between">
              
              {/* Left 2 Seats (A, B) */}
              <div className="flex items-center gap-2">
                {row.left.map(renderSeatButton)}
              </div>

              {/* Central Walking Aisle with Row Number */}
              <div className="flex-1 flex flex-col items-center justify-center px-2">
                <span className="font-mono text-[10px] font-bold text-slate-300 tracking-wider">
                  R{row.rowNumber}
                </span>
                <div className="w-8 border-b border-dashed border-slate-200 my-1" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-300 hidden sm:inline">
                  Aisle
                </span>
              </div>

              {/* Right 2 Seats (C, D) */}
              <div className="flex items-center gap-2">
                {row.right.map(renderSeatButton)}
              </div>

            </div>
          ))}
        </div>

        {/* Back of Shuttle */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
            Rear Emergency Exit • Shuttle {shuttleCode}
          </span>
        </div>
      </div>

      {/* Sticky Bottom Booking Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] p-4 md:p-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-transit-ink text-white flex items-center justify-center font-mono font-black text-lg shrink-0">
              {selectedSeats.length}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-transit-subtle font-bold">
                  Selected Seats:
                </span>
                <span className="font-mono font-black text-base text-transit-ink">
                  {selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(', ') : 'None'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Max {maxSelection} seats per reservation
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase text-transit-subtle block">
                Total Payable
              </span>
              <span className="font-mono font-black text-xl text-transit-ink">
                {farePerSeat === 0 ? (
                  <span className="text-status-live">FREE PASS</span>
                ) : (
                  `₹${totalFare}`
                )}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={onConfirmBooking}
              className={`px-8 py-3.5 rounded-xl font-black text-sm md:text-base tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                selectedSeats.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-transit-red hover:bg-transit-redHover text-white shadow-transit-red/25 hover:shadow-transit-red/40 active:scale-95'
              }`}
            >
              <span>Confirm Booking</span>
              <Check className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
