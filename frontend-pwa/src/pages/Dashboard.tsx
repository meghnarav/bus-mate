import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SocialModals } from '../components/SocialModals';
import { getUserRole } from '../utils/role';
import {
  OriginDestinationHero,
  RouteResultCard,
  TransitRoute,
  RouteOption,
} from '../components/transit';
import { Users, Filter, ArrowRight, Bus, Sparkles, CheckCircle2 } from 'lucide-react';

interface SavedGroup {
  id: string;
  nickname: string;
  friends: string[];
  isFavorite: boolean;
}

// Exactly the 4 main destinations/origins requested:
// Tambaram, Alandur, Velachery, Sholinganallur ⇄ VIT Chennai
const DESTINATIONS: RouteOption[] = [
  { id: 'tambaram', name: 'Tambaram', landmark: 'Sanatorium Bus Terminus / Railway Station' },
  { id: 'alandur', name: 'Alandur', landmark: 'Alandur Metro Station Interchange' },
  { id: 'velachery', name: 'Velachery', landmark: 'Vijaya Nagar Junction / MRTS' },
  { id: 'sholinganallur', name: 'Sholinganallur', landmark: 'OMR Junction / ELCOT IT Park' },
];

const VIT_CAMPUS: RouteOption = {
  id: 'vit',
  name: 'VIT Chennai',
  landmark: 'Main Campus Quad / Gate 1 Transport Bay',
};

// Shuttles connecting VIT Chennai and the 4 routes
const ALL_CORRIDOR_SHUTTLES: Record<string, TransitRoute[]> = {
  tambaram: [
    {
      id: 'sh-tbm-1',
      shuttleCode: 'TBM-01',
      shuttleName: 'Tambaram Express Shuttle',
      category: 'AC',
      departureTime: '08:15 AM',
      arrivalTime: '08:50 AM',
      duration: '35 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Tambaram',
      seatsTotal: 50,
      seatsAvailable: 14,
      status: 'live',
      fare: 0,
      nextStopETA: 'On Time',
      isFemalePriority: true,
    },
    {
      id: 'sh-tbm-2',
      shuttleCode: 'TBM-02',
      shuttleName: 'Tambaram Regular Shuttle',
      category: 'Non-AC',
      departureTime: '08:45 AM',
      arrivalTime: '09:25 AM',
      duration: '40 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Tambaram',
      seatsTotal: 50,
      seatsAvailable: 6,
      status: 'filling',
      fare: 0,
      nextStopETA: '5 mins',
      isFemalePriority: true,
    },
    {
      id: 'sh-tbm-3',
      shuttleCode: 'TBM-03',
      shuttleName: 'Tambaram Evening Express',
      category: 'Electric Express',
      departureTime: '05:15 PM',
      arrivalTime: '05:50 PM',
      duration: '35 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Tambaram',
      seatsTotal: 50,
      seatsAvailable: 28,
      status: 'live',
      fare: 0,
      nextStopETA: '10 mins',
      isFemalePriority: false,
    },
  ],
  alandur: [
    {
      id: 'sh-ald-1',
      shuttleCode: 'ALD-01',
      shuttleName: 'Alandur Metro Direct',
      category: 'AC',
      departureTime: '08:00 AM',
      arrivalTime: '08:45 AM',
      duration: '45 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Alandur',
      seatsTotal: 50,
      seatsAvailable: 0,
      status: 'soldOut',
      fare: 0,
      isFemalePriority: true,
    },
    {
      id: 'sh-ald-2',
      shuttleCode: 'ALD-02',
      shuttleName: 'Alandur Express Line',
      category: 'Electric Express',
      departureTime: '08:30 AM',
      arrivalTime: '09:15 AM',
      duration: '45 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Alandur',
      seatsTotal: 50,
      seatsAvailable: 18,
      status: 'live',
      fare: 0,
      nextStopETA: '3 mins',
      isFemalePriority: true,
    },
    {
      id: 'sh-ald-3',
      shuttleCode: 'ALD-03',
      shuttleName: 'Alandur Evening Express',
      category: 'Non-AC',
      departureTime: '05:00 PM',
      arrivalTime: '05:50 PM',
      duration: '50 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Alandur',
      seatsTotal: 50,
      seatsAvailable: 22,
      status: 'live',
      fare: 0,
      isFemalePriority: false,
    },
  ],
  velachery: [
    {
      id: 'sh-vel-1',
      shuttleCode: 'VEL-01',
      shuttleName: 'Velachery Bypass Shuttle',
      category: 'AC',
      departureTime: '08:10 AM',
      arrivalTime: '08:55 AM',
      duration: '45 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Velachery',
      seatsTotal: 50,
      seatsAvailable: 4,
      status: 'filling',
      fare: 0,
      nextStopETA: '2 mins',
      isFemalePriority: true,
    },
    {
      id: 'sh-vel-2',
      shuttleCode: 'VEL-02',
      shuttleName: 'Velachery MRTS Express',
      category: 'Electric Express',
      departureTime: '08:40 AM',
      arrivalTime: '09:25 AM',
      duration: '45 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Velachery',
      seatsTotal: 50,
      seatsAvailable: 31,
      status: 'live',
      fare: 0,
      nextStopETA: '8 mins',
      isFemalePriority: false,
    },
  ],
  sholinganallur: [
    {
      id: 'sh-shl-1',
      shuttleCode: 'SHL-01',
      shuttleName: 'Sholinganallur OMR Corridor',
      category: 'AC',
      departureTime: '08:20 AM',
      arrivalTime: '08:50 AM',
      duration: '30 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Sholinganallur',
      seatsTotal: 50,
      seatsAvailable: 19,
      status: 'live',
      fare: 0,
      nextStopETA: 'On Time',
      isFemalePriority: true,
    },
    {
      id: 'sh-shl-2',
      shuttleCode: 'SHL-02',
      shuttleName: 'Sholinganallur Non-AC Feeder',
      category: 'Non-AC',
      departureTime: '08:50 AM',
      arrivalTime: '09:25 AM',
      duration: '35 mins',
      originLandmark: 'VIT Chennai',
      destinationLandmark: 'Sholinganallur',
      seatsTotal: 50,
      seatsAvailable: 12,
      status: 'live',
      fare: 0,
      nextStopETA: '4 mins',
      isFemalePriority: false,
    },
  ],
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFaculty = getUserRole(user) === 'faculty';

  // Direction: 'vit_to_city' (VIT -> Tambaram/etc) or 'city_to_vit' (Tambaram/etc -> VIT)
  const [direction, setDirection] = useState<'vit_to_city' | 'city_to_vit'>('vit_to_city');
  const [selectedRoute, setSelectedRoute] = useState<string>('tambaram');
  const [selectedSlot, setSelectedSlot] = useState('next');
  
  // Filtering & Booking Options
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AC' | 'Electric Express' | 'Non-AC'>('ALL');
  const [groupSize, setGroupSize] = useState(1);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('busMateGroups');
    if (saved) setSavedGroups(JSON.parse(saved));
  }, []);

  const handleSwap = () => {
    setDirection((prev) => (prev === 'vit_to_city' ? 'city_to_vit' : 'vit_to_city'));
  };

  const currentDestinationObj = DESTINATIONS.find((d) => d.id === selectedRoute) || DESTINATIONS[0];

  const originName = direction === 'vit_to_city' ? VIT_CAMPUS.name : currentDestinationObj.name;
  const destinationName = direction === 'vit_to_city' ? currentDestinationObj.name : VIT_CAMPUS.name;

  const handleSelectRoute = (routeItem: TransitRoute) => {
    if (localStorage.getItem('activeTicket')) {
      alert("You already have an active booking! Please view it or cancel from 'My Bookings' before creating a new reservation.");
      navigate('/bookings');
      return;
    }
    const sessionId = Math.random().toString(36).substring(2, 15);
    navigate(`/booking/${sessionId}?route=${originName}&dest=${destinationName}&code=${routeItem.shuttleCode}&type=${routeItem.category}&groupSize=${groupSize}`);
  };

  const shuttles = (ALL_CORRIDOR_SHUTTLES[selectedRoute] || []).map((sh) => ({
    ...sh,
    originLandmark: originName,
    destinationLandmark: destinationName,
  }));

  const filteredRoutes = shuttles.filter((r) => {
    if (categoryFilter === 'ALL') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* 1. Origin / Destination Search Hero Dedicated to the 4 Core Routes */}
      <div className="w-full">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-transit-border relative">
          
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-5 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transit-redLight text-transit-red text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-transit-red animate-ping" />
                BusMate Official VIT Corridors
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-transit-ink tracking-tight">
                VIT Campus Shuttle Corridors
              </h1>
              <p className="text-sm text-transit-subtle mt-1">
                Direct fleet transit connecting <strong>VIT Chennai</strong> with Tambaram, Alandur, Velachery & Sholinganallur.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-status-live animate-status-blink" />
              <span className="text-xs font-bold font-mono text-transit-ink uppercase">4 Routes Active</span>
            </div>
          </div>

          {/* Core Route Selector Tabs */}
          <div className="mb-6">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle block mb-2">
              Select City Route Corridor:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {DESTINATIONS.map((dest) => {
                const isActive = selectedRoute === dest.id;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedRoute(dest.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-transit-red bg-transit-redLight shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`block font-black text-sm md:text-base ${isActive ? 'text-transit-red' : 'text-transit-ink'}`}>
                      {dest.name}
                    </span>
                    <span className="block text-[11px] text-transit-subtle truncate mt-0.5">
                      ⇄ VIT Chennai
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Origin / Destination Wayfinding Box with Direction Swap */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-center">
            
            {/* FROM */}
            <div className="bg-transit-surface border-2 border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-transit-subtle block mb-1">
                Boarding Point (Origin)
              </span>
              <div className="font-black text-transit-ink text-lg md:text-xl flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{originName}</span>
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                {direction === 'vit_to_city' ? VIT_CAMPUS.landmark : currentDestinationObj.landmark}
              </span>
            </div>

            {/* Overlapping Swap Direction Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Direction (VIT ⇄ City)"
                className="w-11 h-11 rounded-full bg-white text-transit-ink border-2 border-slate-200 hover:border-transit-red hover:text-transit-red shadow-md flex items-center justify-center transition-all transform hover:rotate-180 active:scale-95"
              >
                ⇄
              </button>
            </div>

            {/* Mobile swap button fallback */}
            <div className="flex md:hidden justify-center -my-2 z-10">
              <button
                type="button"
                onClick={handleSwap}
                className="w-9 h-9 rounded-full bg-white text-transit-ink border border-slate-300 shadow-sm flex items-center justify-center active:scale-90 text-sm font-bold"
              >
                ⇅
              </button>
            </div>

            {/* TO */}
            <div className="bg-transit-surface border-2 border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-transit-subtle block mb-1">
                Dropoff Point (Destination)
              </span>
              <div className="font-black text-transit-ink text-lg md:text-xl flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-transit-red shrink-0" />
                <span className="truncate">{destinationName}</span>
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                {direction === 'vit_to_city' ? currentDestinationObj.landmark : VIT_CAMPUS.landmark}
              </span>
            </div>
          </div>

          {/* Quick slot chips and filter */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle block mb-2">
                Quick Slot Filter:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'next', label: 'Next Available' },
                  { id: 'morning', label: 'Morning Peak (08:00 - 09:30 AM)' },
                  { id: 'evening', label: 'Evening Return (05:00 - 06:30 PM)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlot(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedSlot === s.id
                        ? 'bg-transit-ink text-white border-transit-ink shadow-sm'
                        : 'bg-white text-transit-subtle border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById('shuttle-results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-transit-red hover:bg-transit-redHover text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-transit-red/25 transition-all"
            >
              View Shuttles ({filteredRoutes.length})
            </button>
          </div>

        </div>
      </div>

      {/* 2. Route Timetable & Fleet Occupancy List */}
      <div id="shuttle-results" className="space-y-4">
        
        {/* Results Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-transit-border">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-lg text-transit-ink">
              {filteredRoutes.length}
            </span>
            <span className="text-sm font-bold text-transit-subtle">
              Shuttles for <span className="text-transit-ink font-black capitalize">{originName} ⇄ {destinationName}</span>
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-transit-subtle font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Fleet:
            </span>
            {(['ALL', 'Electric Express', 'AC', 'Non-AC'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-transit-ink text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-transit-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Route Result Cards */}
        <div className="space-y-4">
          {filteredRoutes.map((r) => (
            <RouteResultCard
              key={r.id}
              route={r}
              onSelectSeats={handleSelectRoute}
            />
          ))}
        </div>
      </div>

      {/* 3. Group Booking & Campus Transit Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Group Booking Card */}
        {!isFaculty ? (
          <div className="bg-white border border-transit-border p-6 md:p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 bg-transit-redLight text-transit-red rounded-2xl flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-transit-ink">Group Travel Reservation</h3>
                <p className="text-xs text-transit-subtle">Book contiguous seats together on the {currentDestinationObj.name} route.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle block mb-2">
                Passenger Party Size
              </label>
              <select 
                value={groupSize} 
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-200 text-transit-ink text-base font-bold rounded-xl focus:border-transit-red p-3.5 outline-none cursor-pointer hover:bg-white transition"
              >
                <option value={1}>1 Passenger (Solo Commute)</option>
                <option value={2}>2 Passengers (Adjacent Pair)</option>
                <option value={3}>3 Passengers (Friend Group)</option>
                <option value={4}>4 Passengers (Full 2x2 Bay)</option>
              </select>
            </div>

            <button 
              type="button"
              onClick={() => setIsSocialModalOpen(true)}
              className="w-full bg-transit-ink hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              <span>+ Manage Saved Travel Group</span>
            </button>

            {savedGroups.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-transit-subtle mb-3">
                  Your Circles
                </h4>
                <div className="space-y-2">
                  {savedGroups.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-xs text-transit-ink">{g.nickname}</span>
                      <span className="text-[11px] bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md font-mono font-bold">
                        {g.friends.length} Members
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-transit-ink p-8 rounded-3xl text-white flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-transit-red text-xs font-bold uppercase mb-3">
                Faculty Privilege
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Priority Seating Access</h3>
              <p className="text-sm text-slate-300">
                Faculty members receive priority front-row seating across all 4 VIT corridors (Tambaram, Alandur, Velachery, Sholinganallur).
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Campus ID Authenticated & Verified</span>
            </div>
          </div>
        )}

        {/* Live Policy / Commute Guide Card */}
        <div className="bg-white border border-transit-border p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-transit-red text-xs font-mono font-bold uppercase mb-2">
              <Sparkles className="w-4 h-4" /> BusMate 4-Corridor Network
            </div>
            <h3 className="text-xl font-black text-transit-ink mb-3">
              Official Campus Routes
            </h3>
            <ul className="space-y-2.5 text-xs text-transit-subtle">
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-transit-ink">1. Tambaram ⇄ VIT</span>
                <span className="text-[11px] font-mono text-status-live font-bold">Live GPS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-transit-ink">2. Alandur ⇄ VIT</span>
                <span className="text-[11px] font-mono text-status-live font-bold">Live GPS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-transit-ink">3. Velachery ⇄ VIT</span>
                <span className="text-[11px] font-mono text-status-live font-bold">Live GPS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-transit-ink">4. Sholinganallur ⇄ VIT</span>
                <span className="text-[11px] font-mono text-status-live font-bold">Live GPS</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-transit-ink">View live tracking map</span>
            <button
              type="button"
              onClick={() => navigate('/routes')}
              className="text-xs font-bold text-transit-red hover:underline"
            >
              All Routes Status →
            </button>
          </div>
        </div>

      </div>

      <SocialModals isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
