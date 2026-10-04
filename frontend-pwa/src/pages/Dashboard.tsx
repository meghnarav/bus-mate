import React, { useState, useEffect } from 'react';
import { useUser } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SocialModals } from '../components/SocialModals';
import { getUserRole } from '../utils/role';

interface SavedGroup {
  id: string;
  nickname: string;
  friends: string[];
  isFavorite: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isFaculty = getUserRole(user) === 'faculty';

  const [route, setRoute] = useState('tambaram');
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
    navigate(`/booking/${sessionId}?route=${route}&type=${busType}&groupSize=${groupSize}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* AbhiBus/RedBus Style Search Hero */}
      <div className="bg-obsidian-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative mt-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-busmate-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Book Your Campus Ride</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">Fast, secure, and hassle-free daily commute for VITians.</p>
        </div>

        {/* Premium Search Bar */}
        <div className="relative z-10 bg-white rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row items-center gap-3">
          
          <div className="flex-1 w-full flex items-center px-6 py-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 group">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Boarding From</p>
              <select 
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-transparent font-black text-obsidian-900 text-xl md:text-2xl outline-none appearance-none cursor-pointer"
              >
                <option value="tambaram">Tambaram</option>
                <option value="velachery">Velachery</option>
                <option value="sholinganallur">Sholinganallur</option>
                <option value="alandur">Alandur</option>
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

          <div className="flex-1 w-full flex items-center px-6 py-4 bg-slate-50/50 rounded-2xl cursor-not-allowed opacity-80">
            <div className="w-10 h-10 bg-obsidian-50 text-obsidian-800 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Destination</p>
              <p className="font-black text-obsidian-900 text-xl md:text-2xl">VIT Chennai</p>
            </div>
          </div>

          <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

          <div className="flex-1 w-full flex items-center px-6 py-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 group">
            <div className="w-10 h-10 bg-busmate-50 text-busmate-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Comfort</p>
              <select 
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-transparent font-black text-obsidian-900 text-xl md:text-2xl outline-none appearance-none cursor-pointer"
              >
                <option value="AC">AC Bus</option>
                <option value="NON-AC">Non-AC Bus</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleStartBooking}
            className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-xl lg:text-2xl px-12 py-6 rounded-2xl shadow-lg hover:shadow-red-500/25 transition-all transform hover:-translate-y-1 mt-4 lg:mt-0 flex items-center justify-center gap-3 whitespace-nowrap"
          >
            SEARCH BUSES
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {!isFaculty ? (
          <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
              <div className="w-14 h-14 bg-busmate-100 text-busmate-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-obsidian-900">Group Bookings</h3>
                <p className="text-slate-500">Secure contiguous seats together.</p>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Party Size for this trip</label>
              <select 
                value={groupSize} 
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-200 text-obsidian-900 text-lg font-bold rounded-xl focus:border-busmate-500 p-4 outline-none cursor-pointer hover:bg-white transition"
              >
                <option value={1}>1 (Solo Travel)</option>
                <option value={2}>2 Friends</option>
                <option value={3}>3 Friends</option>
                <option value={4}>4 Friends</option>
              </select>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setIsSocialModalOpen(true)}
                className="w-full bg-obsidian-900 hover:bg-black text-white font-bold py-4 px-4 rounded-xl shadow-md transition text-lg"
              >
                + Create a New Group
              </button>
            </div>

            {savedGroups.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Saved Groups</h4>
                <div className="space-y-3">
                  {savedGroups.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-busmate-300 transition">
                      <span className="font-bold text-obsidian-900">{g.nickname}</span>
                      <span className="text-xs bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg font-bold">{g.friends.length} Members</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
           <div className="bg-obsidian-900 p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold text-busmate-400 mb-2">Faculty Priority</h3>
              <p className="text-sm text-slate-300">Group bookings are disabled for faculty accounts. You may proceed directly to seat selection.</p>
           </div>
        )}
        
        <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-center items-center text-center">
           <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="Commute" className="w-48 h-48 mb-6 opacity-90" />
           <h3 className="text-2xl font-black text-obsidian-900 mb-2">Ready to Go?</h3>
           <p className="text-slate-500 mb-8 max-w-sm">Hit 'Search Buses' above to enter the live seat booking room. Seats are locked for 10 minutes once you enter.</p>
        </div>
      </div>
      <SocialModals isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
