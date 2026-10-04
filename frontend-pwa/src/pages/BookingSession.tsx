import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SeatPickerGrid from '../components/SeatPickerGrid';
import DynamicQRCode from '../components/DynamicQRCode';
import { getBookings, saveBookings } from '../data/mockBookings';

const BookingSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  
  const route = query.get('route') || 'tambaram';
  const busType = query.get('type') || 'AC';
  const groupSize = Number(query.get('groupSize')) || 1;

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [prefZone, setPrefZone] = useState<'any' | 'front' | 'middle' | 'back'>('any');
  const [prefType, setPrefType] = useState<'any' | 'window' | 'aisle'>('any');

  useEffect(() => {
    if (isConfirmed) return;
    if (timeLeft <= 0) {
      alert('Session expired. The seats have been released.');
      navigate('/dashboard');
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate, isConfirmed]);

  const getReservedSeats = () => {
    if (route === 'alandur') return Array.from({length: 50}, (_, i) => i + 1);
    if (route === 'tambaram') return busType === 'AC' ? [3, 4, 12, 15, 22, 23, 24, 30] : [1, 2, 8, 9, 10, 48, 49];
    if (route === 'velachery') return Array.from({length: 46}, (_, i) => i + 1);
    return [5, 18, 19, 33];
  };
  const reservedSeats = getReservedSeats();

  const handleAutoAssign = () => {
    const layout: number[][] = [];
    let current = 1;
    for (let r = 0; r < 10; r++) {
      if (r === 0) {
        layout.push([current++]);
        layout.push([current++, current++, current++]);
      } else if (r === 9) {
        layout.push(Array.from({length: 6}, () => current++));
      } else {
        layout.push([current++, current++]);
        layout.push([current++, current++, current++]);
      }
    }
    
    let found: number[] = [];
    let blocksWithContext = layout.map((block, i) => {
      const row = Math.floor(i / 2);
      let zone = 'middle';
      if (row < 3) zone = 'front';
      else if (row > 6) zone = 'back';
      
      const isRightSide = i % 2 === 1;
      return { block, zone, isRightSide };
    });
    
    if (prefZone !== 'any') {
      blocksWithContext = blocksWithContext.filter(b => b.zone === prefZone);
    }
    
    const shuffledBlocks = blocksWithContext.sort(() => Math.random() - 0.5);
    
    for (const {block, isRightSide} of shuffledBlocks) {
      let currentRun: number[] = [];
      for (const seat of block) {
        if (!reservedSeats.includes(seat)) {
          currentRun.push(seat);
          if (currentRun.length === groupSize) {
            let satisfiesType = true;
            if (prefType !== 'any') {
              const hasWindow = !isRightSide ? currentRun.includes(block[0]) : currentRun.includes(block[block.length - 1]);
              const hasAisle = !isRightSide ? currentRun.includes(block[block.length - 1]) : currentRun.includes(block[0]);
              
              if (prefType === 'window' && !hasWindow) satisfiesType = false;
              if (prefType === 'aisle' && !hasAisle) satisfiesType = false;
            }
            
            if (satisfiesType) {
              found = currentRun;
              break;
            } else {
              currentRun.shift(); 
            }
          }
        } else {
          currentRun = []; 
        }
      }
      if (found.length) break;
    }
    
    if (found.length) {
      setSelectedSeats(found);
    } else {
      alert("No contiguous seats available matching your preferences! Please try relaxing preferences or select manually.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {!isConfirmed && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-bold text-red-700">Booking Session Locked</h3>
            <p className="text-sm text-red-600">Please complete your seat selection before the timer expires.</p>
          </div>
          <div className="text-2xl font-black text-red-600 bg-red-100 px-4 py-2 rounded-lg">
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-[3] space-y-6">
          <SeatPickerGrid 
            rows={10} 
            reservedSeats={reservedSeats} 
            selectedSeats={selectedSeats}
            onSeatSelect={setSelectedSeats} 
            groupSize={groupSize}
            disabled={isConfirmed}
          />

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={prefZone}
                onChange={(e) => setPrefZone(e.target.value as any)}
                disabled={isConfirmed}
                className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-busmate-500 p-3 outline-none disabled:opacity-50"
              >
                <option value="any">Any Zone</option>
                <option value="front">Front</option>
                <option value="middle">Middle</option>
                <option value="back">Back</option>
              </select>
              <select 
                value={prefType}
                onChange={(e) => setPrefType(e.target.value as any)}
                disabled={isConfirmed}
                className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-busmate-500 p-3 outline-none disabled:opacity-50"
              >
                <option value="any">Any Seat</option>
                <option value="window">Window</option>
                <option value="aisle">Aisle</option>
              </select>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={handleAutoAssign}
                disabled={isConfirmed}
                className="bg-white border-2 border-obsidian-900 text-obsidian-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-100 transition shadow-sm disabled:opacity-50"
              >
                Auto-Assign {groupSize}
              </button>
              {isConfirmed ? (
                <button 
                  onClick={() => navigate('/bookings')}
                  className="bg-busmate-500 text-obsidian-900 font-bold py-3 px-8 rounded-xl shadow-md hover:bg-busmate-600 transition"
                >
                  View Ticket
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (selectedSeats.length === groupSize) {
                      setIsConfirmed(true);
                      const ticket = {
                        sessionId,
                        route,
                        busType,
                        seats: selectedSeats,
                        timestamp: Date.now()
                      };
                      localStorage.setItem('activeTicket', JSON.stringify(ticket));
                      
                      // Add to Live Bookings DB
                      const userStr = localStorage.getItem('busmate_auth_user');
                      const user = userStr ? JSON.parse(userStr) : { fullName: 'Unknown Passenger' };
                      
                      const newBooking = {
                        id: `TKT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        name: user.fullName,
                        route: `${route.charAt(0).toUpperCase() + route.slice(1)} - VIT`,
                        bus: busType,
                        date: new Date().toLocaleString('en-US', { hour12: false }).substring(0, 16),
                        noOfSeats: selectedSeats.length,
                        seats: selectedSeats.map(String),
                        subMembers: groupSize > 1 ? Array.from({length: groupSize - 1}, (_, i) => `Friend ${i + 1}`) : []
                      };
                      
                      const live = getBookings();
                      saveBookings([newBooking, ...live]);

                      alert('Booking confirmed successfully!');
                      navigate('/bookings');
                    } else {
                      alert(`Please select ${groupSize} seats first.`);
                    }
                  }}
                  className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-emerald-600 transition"
                >
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-[2]">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-3 ${isConfirmed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-busmate-400 to-accent-400'}`}></div>
            <h2 className="text-2xl font-black text-obsidian-900 mb-6 tracking-tighter">Your Boarding Pass</h2>
            
            <div className="flex flex-col gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Route</span>
                <span className="font-bold text-obsidian-900 capitalize">{route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Bus Type</span>
                <span className="font-bold text-obsidian-900">{busType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Seats</span>
                <span className="font-bold text-busmate-600">{selectedSeats.length ? selectedSeats.join(', ') : 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Status</span>
                <span className={`font-bold ${isConfirmed ? 'text-emerald-500' : 'text-amber-500'}`}>{isConfirmed ? 'CONFIRMED' : 'DRAFT'}</span>
              </div>
            </div>

            <div className={`flex justify-center p-4 bg-white rounded-2xl inline-block border ${isConfirmed ? 'border-emerald-200' : 'border-slate-100'} transition-colors`}>
              <DynamicQRCode ticketId={`TKT-${sessionId}`} secretSeed={isConfirmed ? "locked-secret-seed" : "draft-seed"} />
            </div>
            
            <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
              Cryptographic HMAC-SHA256 Ticket
              <br/>
              <span className="text-busmate-600 mt-1 block font-mono">{sessionId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSession;
