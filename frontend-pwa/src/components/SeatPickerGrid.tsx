import React, { useState } from 'react';
import { Bus, Users } from 'lucide-react';

interface SeatPickerGridProps {
  rows: number;
  columns: number;
  reservedSeats: number[];
  onSeatSelect: (seats: number[]) => void;
  groupSize: number;
}

const SeatPickerGrid: React.FC<SeatPickerGridProps> = ({ rows, columns, reservedSeats, onSeatSelect, groupSize }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const toggleSeat = (seatNum: number) => {
    if (reservedSeats.includes(seatNum)) return; // Cannot select reserved seat

    let newSelection = [...selectedSeats];
    
    if (newSelection.includes(seatNum)) {
      newSelection = newSelection.filter(s => s !== seatNum);
    } else {
      if (newSelection.length < groupSize) {
        newSelection.push(seatNum);
      } else {
        // If they click another seat when full, replace the first selected seat
        newSelection.shift();
        newSelection.push(seatNum);
      }
    }
    
    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const getSeatColor = (seatNum: number) => {
    if (reservedSeats.includes(seatNum)) return 'bg-gray-300 cursor-not-allowed border-gray-400 opacity-50';
    if (selectedSeats.includes(seatNum)) return 'bg-indigo-600 text-white border-indigo-700 shadow-md transform scale-105 transition-transform';
    return 'bg-white hover:bg-indigo-50 border-gray-300 hover:border-indigo-400 text-gray-700 transition-colors';
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bus className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Select Seats</h3>
        </div>
        <div className="flex items-center space-x-1 text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
          <Users size={16} />
          <span className="font-medium">{selectedSeats.length} / {groupSize}</span>
        </div>
      </div>
      
      {/* Front of bus indicator */}
      <div className="w-full h-8 bg-gray-200 rounded-t-3xl mb-6 flex items-center justify-center border border-gray-300">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Driver</span>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={`row-${rIndex}`} className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {/* Left side seats (assuming 2 seats on left) */}
              {Array.from({ length: Math.floor(columns / 2) }).map((_, cIndex) => {
                const seatNum = rIndex * columns + cIndex + 1;
                return (
                  <button
                    key={`seat-${seatNum}`}
                    onClick={() => toggleSeat(seatNum)}
                    className={`w-12 h-12 rounded-t-lg rounded-b-md border-2 font-medium flex items-center justify-center ${getSeatColor(seatNum)}`}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
            
            {/* Aisle */}
            <div className="w-8 text-center text-gray-300 text-xs"></div>
            
            <div className="flex gap-2">
              {/* Right side seats */}
              {Array.from({ length: Math.ceil(columns / 2) }).map((_, cIndex) => {
                const seatNum = rIndex * columns + Math.floor(columns / 2) + cIndex + 1;
                return (
                  <button
                    key={`seat-${seatNum}`}
                    onClick={() => toggleSeat(seatNum)}
                    className={`w-12 h-12 rounded-t-lg rounded-b-md border-2 font-medium flex items-center justify-center ${getSeatColor(seatNum)}`}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatPickerGrid;
