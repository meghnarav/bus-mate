import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { InteractiveSeatMatrix } from '../components/transit/InteractiveSeatMatrix';
import { DigitalBoardingTicket, BoardingPassData } from '../components/transit/DigitalBoardingTicket';
import { getBookings, saveBookings } from '../data/mockBookings';
import { Clock, ShieldAlert, ArrowLeft, Bus, Zap } from 'lucide-react';

const BookingSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  
  const origin = query.get('route') || 'Hostel Block D';
  const dest = query.get('dest') || 'Tech Park / AB3';
  const shuttleCode = query.get('code') || 'SH-102';
  const busType = query.get('type') || 'Electric Express';
  const groupSize = Number(query.get('groupSize')) || 1;

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes lock
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<BoardingPassData | null>(null);

  // Booked and female priority mock data
  const bookedSeats = [3, 4, 7, 8, 14, 15, 21, 22, 29, 30];
  const femalePrioritySeats = [1, 2, 5, 6]; // First 2 rows reserved for female priority

  useEffect(() => {
    if (isConfirmed) return;
    if (timeLeft <= 0) {
      alert('Session expired. The seats have been released back to the fleet.');
      navigate('/dashboard');
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate, isConfirmed]);

  const handleToggleSeat = (seatNumber: number) => {
    if (isConfirmed || bookedSeats.includes(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length < groupSize) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        // Quick replace behavior
        setSelectedSeats([seatNumber]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length !== groupSize) {
      alert(`Please select all ${groupSize} seats before proceeding.`);
      return;
    }

    const userStr = localStorage.getItem('busmate_auth_user');
    const user = userStr ? JSON.parse(userStr) : { fullName: 'Student Passenger', email: 'passenger@vitstudent.ac.in' };
    const pnrCode = `PNR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const passData: BoardingPassData = {
      pnr: pnrCode,
      registrationNumber: user.registrationNumber || '21BCE1042',
      studentName: user.fullName || 'Student Passenger',
      shuttleCode,
      shuttleName: 'Campus Transit Shuttle',
      origin,
      destination: dest,
      departureTime: '08:15 AM',
      seats: selectedSeats.map((s) => `S-${s}`),
      fare: 0,
      secretSeed: `seed-${sessionId}`,
    };

    // Save active ticket in localStorage
    localStorage.setItem(
      'activeTicket',
      JSON.stringify({
        sessionId,
        pnr: pnrCode,
        route: `${origin} → ${dest}`,
        busType,
        shuttleCode,
        seats: selectedSeats.map((s) => `S-${s}`),
        timestamp: Date.now(),
      })
    );

    // Save in shared bookings record for driver/admin visibility
    const newBooking = {
      id: pnrCode,
      name: user.fullName || 'Student Passenger',
      route: `${origin} → ${dest}`,
      bus: busType,
      date: new Date().toLocaleString('en-IN', { hour12: false }).substring(0, 16),
      noOfSeats: selectedSeats.length,
      seats: selectedSeats.map((s) => String(s)),
      subMembers: groupSize > 1 ? Array.from({ length: groupSize - 1 }, (_, i) => `Member ${i + 1}`) : [],
    };
    const live = getBookings();
    saveBookings([newBooking, ...live]);

    setConfirmedPass(passData);
    setIsConfirmed(true);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Top Navigation & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl border border-transit-border shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-transit-ink flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-transit-ink text-white">
                {shuttleCode}
              </span>
              <h1 className="text-lg md:text-xl font-black text-transit-ink">
                Select Your Seats ({groupSize} {groupSize === 1 ? 'Seat' : 'Seats'})
              </h1>
            </div>
            <p className="text-xs text-transit-subtle mt-0.5">
              {origin} ➔ {dest} • {busType}
            </p>
          </div>
        </div>

        {!isConfirmed && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-transit-red animate-spin" />
            <div>
              <span className="text-[10px] font-mono uppercase text-red-600 block">Holding Timer</span>
              <span className="font-mono font-black text-lg text-transit-red">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation View: Show Digital Boarding Pass */}
      {isConfirmed && confirmedPass ? (
        <div className="space-y-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center max-w-md mx-auto">
            <h2 className="text-base font-bold text-emerald-800">
              🎉 Booking Confirmed Successfully!
            </h2>
            <p className="text-xs text-emerald-600 mt-1">
              Your M-Ticket has been generated below and stored in 'My Bookings'.
            </p>
          </div>

          <DigitalBoardingTicket
            pass={confirmedPass}
            onClose={() => navigate('/bookings')}
          />
        </div>
      ) : (
        /* Seat Matrix View */
        <InteractiveSeatMatrix
          shuttleCode={shuttleCode}
          totalSeats={40}
          bookedSeats={bookedSeats}
          femalePrioritySeats={femalePrioritySeats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          maxSelection={groupSize}
          farePerSeat={0}
          onConfirmBooking={handleConfirm}
        />
      )}

    </div>
  );
};

export default BookingSession;
