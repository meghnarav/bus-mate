import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalBoardingTicket, BoardingPassData } from '../components/transit/DigitalBoardingTicket';
import { Ticket, ArrowLeft, Trash2, Bus, ShieldCheck } from 'lucide-react';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTicket, setActiveTicket] = useState<any>(null);

  useEffect(() => {
    const ticketStr = localStorage.getItem('activeTicket');
    if (ticketStr) {
      setActiveTicket(JSON.parse(ticketStr));
    }
  }, []);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking? This will immediately release your reserved seats.')) {
      localStorage.removeItem('activeTicket');
      setActiveTicket(null);
      alert('Booking cancelled successfully.');
    }
  };

  const userStr = localStorage.getItem('busmate_auth_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const passData: BoardingPassData | null = activeTicket ? {
    pnr: activeTicket.pnr || `PNR-${(activeTicket.sessionId || 'CT100').substring(0, 6).toUpperCase()}`,
    registrationNumber: user?.registrationNumber || '21BCE1042',
    studentName: user?.fullName || 'Student Passenger',
    shuttleCode: activeTicket.shuttleCode || 'SH-102',
    shuttleName: 'BusMate Campus Shuttle',
    origin: activeTicket.route?.split('→')[0]?.trim() || activeTicket.route || 'Hostel Block D',
    destination: activeTicket.route?.split('→')[1]?.trim() || 'Tech Park / AB3',
    departureTime: '08:15 AM',
    seats: activeTicket.seats || ['S-1'],
    fare: 0,
    secretSeed: `seed-${activeTicket.sessionId || 'active'}`,
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-transit-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-transit-redLight text-transit-red text-xs font-bold uppercase mb-2">
            <Ticket className="w-3.5 h-3.5" />
            Active Boarding Passes
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transit-ink">
            My Campus M-Tickets
          </h1>
          <p className="text-sm text-transit-subtle mt-0.5">
            Present this scannable M-Ticket to the conductor scanner upon boarding.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-transit-ink font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Commute</span>
        </button>
      </div>

      {!activeTicket || !passData ? (
        <div className="bg-white p-12 rounded-3xl border border-transit-border shadow-sm text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-transit-ink mb-2">No Active Boarding Passes</h2>
          <p className="text-xs text-transit-subtle mb-6 leading-relaxed">
            You don't have any upcoming trips scheduled. Search campus shuttle timetables to reserve your next ride.
          </p>
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-transit-red hover:bg-transit-redHover text-white font-black text-xs uppercase tracking-wider py-3 px-8 rounded-xl shadow-md transition"
          >
            Find a Campus Shuttle
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Digital M-Ticket */}
          <DigitalBoardingTicket pass={passData} />

          {/* Cancel button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 text-xs font-bold py-2 px-4 rounded-xl hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Cancel This Reservation</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;
