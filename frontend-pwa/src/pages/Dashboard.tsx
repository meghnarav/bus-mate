import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SocialModals } from '../components/SocialModals';
import { MapPin, Bus, Users, Sparkles, ShieldCheck, ArrowRight, Shield } from 'lucide-react';

interface SavedGroup {
  id: string;
  nickname: string;
  friends: string[];
  isFavorite: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Source is always VIT Chennai
  // Destination: tambaram / velachery / sholinganallur / alandur
  const [destination, setDestination] = useState('tambaram');
  const [busType, setBusType] = useState('AC');
  const [groupSize, setGroupSize] = useState(1);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('busMateGroups');
    if (saved) setSavedGroups(JSON.parse(saved));
  }, []);

  const handleStartBooking = () => {
    if (localStorage.getItem('activeTicket')) {
      alert("You already have an active booking! Please cancel it from the 'My Bookings' page to book a new ride.");
      navigate('/bookings');
      return;
    }
    // Generate a mock session ID
    const sessionId = Math.random().toString(36).substring(2, 15);
    navigate(`/booking/${sessionId}?dest=${destination}&route=${destination}&type=${busType}&groupSize=${groupSize}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      
      {/* AbhiBus / redBus Commercial Transit Search Hero in New Premium Transit UI */}
      <div className="bg-transit-ink rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative mt-4 overflow-hidden border border-slate-800">
        {/* Decorative background glow elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-transit-red rounded-full blur-3xl opacity-25"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-sky-500 rounded-full blur-3xl opacity-15"></div>
        
        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-transit-red text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-transit-red animate-ping" />
            Official VIT Campus Commute
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Book Your Campus Ride
          </h2>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Fast, secure, and hassle-free daily commute for VIT students, faculty, and staff.
          </p>
        </div>

        {/* Premium High-Contrast Search Bar in New Transit UI */}
        <div className="relative z-10 bg-white rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col lg:flex-row items-center gap-3">
          
          {/* BOARDING FROM (ALWAYS VIT CHENNAI AS SOURCE) */}
          <div className="flex-1 w-full flex items-center px-6 py-4 bg-slate-50/70 rounded-2xl border border-slate-100 cursor-not-allowed">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mr-4 shadow-sm">
              <Bus className="w-6 h-6 text-transit-red" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-widest mb-1">
                Boarding Point (Source)
              </p>
              <p className="font-black text-transit-ink text-xl md:text-2xl">
                VIT Chennai
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

          {/* DESTINATION (THE FOUR DESTINATIONS) */}
          <div className="flex-1 w-full flex items-center px-6 py-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 group">
            <div className="w-12 h-12 bg-red-50 text-transit-red rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-transit-red" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-widest mb-1">
                Destination (Dropping Point)
              </p>
              <select 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent font-black text-transit-ink text-xl md:text-2xl outline-none appearance-none cursor-pointer"
              >
                <option value="tambaram">Tambaram</option>
                <option value="velachery">Velachery</option>
                <option value="sholinganallur">Sholinganallur</option>
                <option value="alandur">Alandur</option>
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

          {/* COMFORT / BUS TYPE */}
          <div className="flex-1 w-full flex items-center px-6 py-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-widest mb-1">
                Bus Type
              </p>
              <select 
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-transparent font-black text-transit-ink text-xl md:text-2xl outline-none appearance-none cursor-pointer"
              >
                <option value="AC">AC Bus</option>
                <option value="NON-AC">Non-AC Bus</option>
              </select>
            </div>
          </div>

          {/* SEARCH BUSES BUTTON */}
          <button 
            type="button"
            onClick={handleStartBooking}
            className="w-full lg:w-auto bg-transit-red hover:bg-transit-redHover text-white font-black text-lg lg:text-xl px-10 py-5 rounded-2xl shadow-lg shadow-transit-red/30 transition-all transform hover:-translate-y-0.5 mt-2 lg:mt-0 flex items-center justify-center gap-3 whitespace-nowrap active:scale-95"
          >
            <span>SEARCH BUSES</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Feature Grids: Available EQUALLY to both Student and Faculty (no faculty priority) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Group Bookings Card (Open to all students & faculty equally) */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
            <div className="w-14 h-14 bg-red-50 text-transit-red rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-transit-ink">Group Bookings</h3>
              <p className="text-slate-500 text-sm">Secure contiguous seats together on the shuttle.</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Party Size for this trip
            </label>
            <select 
              value={groupSize} 
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="w-full bg-slate-50 border-2 border-slate-200 text-transit-ink text-lg font-bold rounded-xl focus:border-transit-red p-4 outline-none cursor-pointer hover:bg-white transition"
            >
              <option value={1}>1 (Solo Travel)</option>
              <option value={2}>2 Passengers</option>
              <option value={3}>3 Passengers</option>
              <option value={4}>4 Passengers</option>
            </select>
          </div>

          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => setIsSocialModalOpen(true)}
              className="w-full bg-transit-ink hover:bg-black text-white font-bold py-4 px-4 rounded-xl shadow-md transition text-base"
            >
              + Create a New Group
            </button>
          </div>

          {savedGroups.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-4">Saved Groups</h4>
              <div className="space-y-3">
                {savedGroups.map(g => (
                  <div key={g.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    <span className="font-bold text-transit-ink">{g.nickname}</span>
                    <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold">{g.friends.length} Members</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Ready to go & Shuttle Departure Policy Card */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-transit-redLight text-transit-red flex items-center justify-center shrink-0">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-transit-ink">Departure Window Policy</h3>
                <span className="text-xs font-mono font-bold text-transit-red bg-red-50 px-2 py-0.5 rounded">
                  1:30 PM – 1:45 PM Window
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 mb-6">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-transit-red mt-1.5 shrink-0" />
                <p><strong>Earliest Departure:</strong> Shuttles will <em>never</em> depart before <strong>1:30 PM</strong> under any condition.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p><strong>Capacity Departure:</strong> Once full (all 50 seats booked), the bus leaves immediately (post 1:30 PM).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p><strong>Latest Departure:</strong> If partially empty, the bus will strictly depart at <strong>1:45 PM</strong>.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-mono">Real-time gate dispatch</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Equal Access Verified</span>
            </div>
          </div>
        </div>

      </div>

      <SocialModals isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
