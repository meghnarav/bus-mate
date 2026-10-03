import React, { useState, useMemo } from 'react';
import { Bus, Users, Armchair } from 'lucide-react';

interface SeatPickerGridProps {
  rows: number;
  reservedSeats: number[];
  onSeatSelect: (seats: number[]) => void;
  groupSize: number;
}

const SeatPickerGrid: React.FC<SeatPickerGridProps> = ({ rows, reservedSeats, onSeatSelect, groupSize }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Generate the specific seat layout requested:
  // Row 1: 1 left, aisle, 3 right
  // Middle Rows: 2 left, aisle, 3 right
  // Last Row: 6 joined seats
  const seatLayout = useMemo(() => {
    let currentSeat = 1;
    const layout = [];
    
    for (let r = 0; r < rows; r++) {
      if (r === 0) {
        layout.push({
          id: `row-${r}`,
          type: 'split',
          left: [currentSeat++],
          right: [currentSeat++, currentSeat++, currentSeat++]
        });
      } else if (r === rows - 1) {
        const seats = [];
        for (let i = 0; i < 6; i++) seats.push(currentSeat++);
        layout.push({
          id: `row-${r}`,
          type: 'joined',
          seats
        });
      } else {
        layout.push({
          id: `row-${r}`,
          type: 'split',
          left: [currentSeat++, currentSeat++],
          right: [currentSeat++, currentSeat++, currentSeat++]
        });
      }
    }
    return layout;
  }, [rows]);

  const toggleSeat = (seatNum: number) => {
    if (reservedSeats.includes(seatNum)) return;

    let newSelection = [...selectedSeats];
    
    if (newSelection.includes(seatNum)) {
      newSelection = newSelection.filter(s => s !== seatNum);
    } else {
      if (newSelection.length < groupSize) {
        newSelection.push(seatNum);
      } else {
        newSelection.shift(); // Remove oldest selection
        newSelection.push(seatNum);
      }
    }
    
    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const renderSeat = (seatNum: number) => {
    const isReserved = reservedSeats.includes(seatNum);
    const isSelected = selectedSeats.includes(seatNum);
    
    let buttonClass = 'relative flex items-center justify-center w-12 h-14 rounded-t-xl rounded-b-md shadow-sm transition-all duration-300 ease-out transform ';
    let iconClass = 'w-5 h-5 absolute top-2 ';
    let textClass = 'absolute bottom-2 text-xs font-bold ';

    if (isReserved) {
      buttonClass += 'bg-slate-200 border-2 border-slate-300 cursor-not-allowed opacity-60';
      iconClass += 'text-slate-400';
      textClass += 'text-slate-500';
    } else if (isSelected) {
      buttonClass += 'bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-400 shadow-indigo-500/50 shadow-lg scale-110 z-10 -translate-y-1';
      iconClass += 'text-white opacity-90';
      textClass += 'text-white';
    } else {
      buttonClass += 'bg-white hover:bg-indigo-50 hover:border-indigo-300 border-2 border-slate-200 hover:-translate-y-1 hover:shadow-md cursor-pointer';
      iconClass += 'text-slate-300';
      textClass += 'text-slate-600';
    }

    return (
      <button
        key={`seat-${seatNum}`}
        onClick={() => toggleSeat(seatNum)}
        disabled={isReserved}
        className={buttonClass}
      >
        <Armchair strokeWidth={2.5} className={iconClass} />
        <span className={textClass}>{seatNum}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 rounded-2xl text-indigo-600">
            <Bus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Select Seats</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Front Entrance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
          <Users size={18} className="text-indigo-500" />
          <span className="font-bold text-slate-700">
            <span className="text-indigo-600">{selectedSeats.length}</span> / {groupSize}
          </span>
        </div>
      </div>

      {/* Driver Cabin Indicator */}
      <div className="w-full h-12 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-t-3xl rounded-b-lg mb-8 flex items-center justify-between px-6 border-b-4 border-slate-400 opacity-80">
         <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">Steering</span>
         <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">Door</span>
      </div>

      {/* Bus Layout Container */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-inner">
        <div className="flex flex-col gap-4">
          
          {seatLayout.map((row) => (
            <div key={row.id} className="flex justify-between items-center w-full">
              
              {row.type === 'split' ? (
                <>
                  {/* Left Side (1 or 2 seats) */}
                  <div className={`flex gap-3 ${row.left.length === 1 ? 'ml-auto mr-0' : ''}`} style={{ width: '40%', justifyContent: row.left.length === 1 ? 'flex-end' : 'flex-start' }}>
                    {row.left.map(seatNum => renderSeat(seatNum))}
                  </div>
                  
                  {/* Aisle */}
                  <div className="w-[20%] flex justify-center items-center">
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full mx-1"></div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  </div>
                  
                  {/* Right Side (3 seats) */}
                  <div className="flex gap-3 w-[40%] justify-start">
                    {row.right.map(seatNum => renderSeat(seatNum))}
                  </div>
                </>
              ) : (
                /* Joined Last Row (6 seats) */
                <div className="flex gap-2 w-full justify-between px-1 mt-2">
                  {row.seats.map(seatNum => renderSeat(seatNum))}
                </div>
              )}
              
            </div>
          ))}
          
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border-2 border-slate-200 bg-white"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border-2 border-slate-300 bg-slate-200"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border-2 border-indigo-400 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Selected</span>
        </div>
      </div>

    </div>
  );
};

export default SeatPickerGrid;
