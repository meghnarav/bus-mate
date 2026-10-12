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
import { Users, Filter, SlidersHorizontal, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface SavedGroup {
  id: string;
  nickname: string;
  friends: string[];
  isFavorite: boolean;
}

const CAMPUS_LANDMARKS: RouteOption[] = [
  { id: 'hostel-d', name: 'Hostel Block D', landmark: 'North Gate Plaza' },
  { id: 'hostel-a', name: 'Hostel Block A & B', landmark: 'Student Hub Terminal' },
  { id: 'tech-park', name: 'Tech Park / AB3', landmark: 'Main Academic Quad' },
  { id: 'main-gate', name: 'VIT Main Gate', landmark: 'Kelambakkam Highway Stop' },
  { id: 'sports-complex', name: 'Indoor Sports Arena', landmark: 'South Boundary Road' },
  { id: 'library', name: 'Central Library', landmark: 'Clock Tower Circle' },
];

const MOCK_ROUTES: TransitRoute[] = [
  {
    id: 'route-1',
    shuttleCode: 'SH-102',
    shuttleName: 'Campus Express Line 1',
    category: 'Electric Express',
    departureTime: '08:15 AM',
    arrivalTime: '08:30 AM',
    duration: '15 mins',
    originLandmark: 'Hostel Block D',
    destinationLandmark: 'Tech Park / AB3',
    seatsTotal: 40,
    seatsAvailable: 8,
    status: 'filling',
    fare: 0,
    nextStopETA: '2 mins',
    isFemalePriority: true,
  },
  {
    id: 'route-2',
    shuttleCode: 'SH-204',
    shuttleName: 'Kelambakkam Shuttle Direct',
    category: 'AC',
    departureTime: '08:35 AM',
    arrivalTime: '08:55 AM',
    duration: '20 mins',
    originLandmark: 'Hostel Block D',
    destinationLandmark: 'VIT Main Gate',
    seatsTotal: 40,
    seatsAvailable: 22,
    status: 'live',
    fare: 0,
    nextStopETA: '6 mins',
    isFemalePriority: true,
  },
  {
    id: 'route-3',
    shuttleCode: 'SH-308',
    shuttleName: 'Academic Quad Circular',
    category: 'Electric Express',
    departureTime: '09:00 AM',
    arrivalTime: '09:12 AM',
    duration: '12 mins',
    originLandmark: 'Hostel Block A & B',
    destinationLandmark: 'Central Library',
    seatsTotal: 40,
    seatsAvailable: 16,
    status: 'live',
    fare: 0,
    nextStopETA: 'On Time',
    isFemalePriority: false,
  },
  {
    id: 'route-4',
    shuttleCode: 'SH-412',
    shuttleName: 'Evening Hostel Feeder',
    category: 'Non-AC',
    departureTime: '05:30 PM',
    arrivalTime: '05:48 PM',
    duration: '18 mins',
    originLandmark: 'Tech Park / AB3',
    destinationLandmark: 'Hostel Block D',
    seatsTotal: 40,
    seatsAvailable: 0,
    status: 'soldOut',
    fare: 0,
    isFemalePriority: true,
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFaculty = getUserRole(user) === 'faculty';

  // Origin / Destination states
  const [origin, setOrigin] = useState('hostel-d');
  const [destination, setDestination] = useState('tech-park');
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
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSelectRoute = (routeItem: TransitRoute) => {
    if (localStorage.getItem('activeTicket')) {
      alert("You already have an active booking! Please view it or cancel from 'My Bookings' before creating a new reservation.");
      navigate('/bookings');
      return;
    }
    const sessionId = Math.random().toString(36).substring(2, 15);
    navigate(`/booking/${sessionId}?route=${origin}&dest=${destination}&code=${routeItem.shuttleCode}&type=${routeItem.category}&groupSize=${groupSize}`);
  };

  const filteredRoutes = MOCK_ROUTES.filter(r => {
    if (categoryFilter === 'ALL') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* 1. Origin / Destination Search Hero */}
      <OriginDestinationHero
        origin={origin}
        destination={destination}
        landmarks={CAMPUS_LANDMARKS}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onSwap={handleSwap}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        onSearch={() => {
          const el = document.getElementById('shuttle-results');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Route Timetable & Fleet Occupancy List */}
      <div id="shuttle-results" className="space-y-4">
        
        {/* Results Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-transit-border">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-lg text-transit-ink">
              {filteredRoutes.length}
            </span>
            <span className="text-sm font-bold text-transit-subtle">
              Available Shuttles for Selected Corridor
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-transit-subtle font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
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
                <h3 className="text-xl font-black text-transit-ink">Group Transit Pass</h3>
                <p className="text-xs text-transit-subtle">Reserve adjacent seats in the 2x2 layout together.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-transit-subtle block mb-2">
                Passenger Party Size (Seats to lock)
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
              <h3 className="text-2xl font-black text-white mb-2">Priority Boarding Access</h3>
              <p className="text-sm text-slate-300">
                Faculty members receive reserved front-row seating across all AC and Electric Express shuttles without pre-booking queues.
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
              <Sparkles className="w-4 h-4" /> Transit Security Guidelines
            </div>
            <h3 className="text-xl font-black text-transit-ink mb-3">
              M-Ticket Verification Protocol
            </h3>
            <ul className="space-y-3 text-xs text-transit-subtle">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-transit-red mt-1.5 shrink-0" />
                <span>Show your dynamic rotating QR code at the conductor scanner terminal upon boarding.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-transit-red mt-1.5 shrink-0" />
                <span>Screenshots are strictly invalid due to real-time HMAC timestamp encryption.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-transit-red mt-1.5 shrink-0" />
                <span>Seats are locked for 10 minutes during reservation to prevent booking collisions.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-transit-ink">Need assistance?</span>
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="text-xs font-bold text-transit-red hover:underline"
            >
              Contact Transit Desk →
            </button>
          </div>
        </div>

      </div>

      <SocialModals isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
