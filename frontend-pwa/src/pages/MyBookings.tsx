import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicQRCode from '../components/DynamicQRCode';

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
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      localStorage.removeItem('activeTicket');
      setActiveTicket(null);
      alert('Booking cancelled successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-obsidian-900 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-black mb-2">My Bookings</h2>
        <p className="text-slate-400">View and manage your active boarding passes.</p>
      </div>

      {!activeTicket ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Bookings</h3>
          <p className="text-slate-500 mb-6">You don't have any upcoming trips scheduled.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-busmate-500 text-obsidian-900 font-bold py-3 px-8 rounded-xl shadow-md hover:bg-busmate-600 transition"
          >
            Book a Ride
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-black text-obsidian-900 mb-6">Boarding Pass</h3>
            
            <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Route</span>
                <span className="font-bold text-obsidian-900 capitalize">{activeTicket.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Bus Type</span>
                <span className="font-bold text-obsidian-900">{activeTicket.busType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Seats</span>
                <span className="font-bold text-busmate-600">{activeTicket.seats.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Status</span>
                <span className="font-bold text-emerald-500">CONFIRMED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Booked On</span>
                <span className="font-bold text-obsidian-900">{new Date(activeTicket.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleCancel}
              className="text-red-500 font-bold hover:text-red-700 transition"
            >
              Cancel Booking
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-8">
            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm">
              <DynamicQRCode ticketId={`TKT-${activeTicket.sessionId}`} secretSeed="locked-secret-seed" />
            </div>
            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold text-center">
              Scan upon boarding
              <br/>
              <span className="text-busmate-600 font-mono">{activeTicket.sessionId}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
