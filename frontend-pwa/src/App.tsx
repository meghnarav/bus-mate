import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import DriverScanner from './pages/DriverScanner';
import SeatPickerGrid from './components/SeatPickerGrid';
import DynamicQRCode from './components/DynamicQRCode';
import { SocialModals } from './components/SocialModals';

interface SavedGroup {
  id: string;
  nickname: string;
  friends: string[];
  isFavorite: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'passenger' | 'driver'>('passenger');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'driver' | 'admin' | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [route, setRoute] = useState('tambaram');
  const [busType, setBusType] = useState('AC');
  const [acceptedInvites, setAcceptedInvites] = useState(0);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [prefZone, setPrefZone] = useState<'any' | 'front' | 'middle' | 'back'>('any');
  const [prefType, setPrefType] = useState<'any' | 'window' | 'aisle'>('any');
  
  const { user } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('busMateGroups');
    if (saved) setSavedGroups(JSON.parse(saved));
  }, []);

  const saveGroup = (nickname: string) => {
    const newGroup = { id: Date.now().toString(), nickname, friends: [], isFavorite: false };
    const next = [...savedGroups, newGroup];
    setSavedGroups(next);
    localStorage.setItem('busMateGroups', JSON.stringify(next));
  };

  const toggleFavorite = (id: string) => {
    const next = savedGroups.map(g => g.id === id ? { ...g, isFavorite: !g.isFavorite } : g);
    setSavedGroups(next);
    localStorage.setItem('busMateGroups', JSON.stringify(next));
  };

  // If user is a driver (preset account), force driver view
  const isDriver = user?.publicMetadata?.role === 'DRIVER';
  const isFaculty = user?.publicMetadata?.role === 'FACULTY' || selectedRole === 'faculty';

  const getReservedSeats = () => {
    if (route === 'alandur') return Array.from({length: 50}, (_, i) => i + 1); // Full
    if (route === 'tambaram') return busType === 'AC' ? [3, 4, 12, 15, 22, 23, 24, 30] : [1, 2, 8, 9, 10, 48, 49];
    if (route === 'velachery') return Array.from({length: 46}, (_, i) => i + 1); // Almost full
    return [5, 18, 19, 33]; // Sholinganallur
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
    // Randomize blocks to fill random sections instead of front-to-back
    let blocksWithContext = layout.map((block, i) => {
      // Row is approx block index / 2
      const row = Math.floor(i / 2);
      let zone = 'middle';
      if (row < 3) zone = 'front';
      else if (row > 6) zone = 'back';
      
      const isRightSide = i % 2 === 1;
      // Very basic aisle/window heuristic
      // Left block [w, a], Right block [a, m, w]
      return { block, zone, isRightSide };
    });
    
    // Filter by zone if requested
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
            // Check aisle/window preference
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
              currentRun.shift(); // keep trying in this block
            }
          }
        } else {
          currentRun = []; // Reset run if obstacle hit
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <nav className="bg-gradient-to-r from-obsidian-900 via-obsidian-800 to-indigo-900 text-white p-4 shadow-lg flex justify-between items-center border-b-[3px] border-busmate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-busmate-400 rounded-lg flex items-center justify-center text-obsidian-900 font-black">
              B
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              Bus<span className="text-busmate-400">Mate</span>
            </h1>
            <span className="text-[10px] uppercase bg-accent-500 text-white px-2 py-0.5 rounded-full font-bold ml-1">VIT</span>
          </div>
          
          <SignedIn>
            <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-white/20">
              <a href="#" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-busmate-400">Dashboard</a>
              <a href="#" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">My Bookings</a>
              <a href="#" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Routes</a>
              <a href="#" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Support</a>
            </div>
          </SignedIn>
        </div>
        
        <SignedIn>
          <div className="flex items-center gap-4">
            {!isDriver && (
              <div className="space-x-1 bg-obsidian-900/50 p-1 rounded-xl border border-white/10 flex">
                <button 
                  onClick={() => setCurrentView('passenger')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentView === 'passenger' ? 'bg-busmate-500 text-obsidian-900 shadow-md' : 'text-slate-300 hover:bg-white/10'}`}
                >
                  Passenger
                </button>
                <button 
                  onClick={() => setCurrentView('driver')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentView === 'driver' ? 'bg-accent-500 text-obsidian-900 shadow-md' : 'text-slate-300 hover:bg-white/10'}`}
                >
                  Driver
                </button>
              </div>
            )}
            <div className="border-l border-white/20 pl-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      </nav>

      <main className="p-6">
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[75vh]">
            {!selectedRole ? (
              <div className="w-full max-w-4xl text-center">
                <h2 className="text-4xl font-black text-obsidian-900 mb-4 tracking-tighter">Welcome to BusMate</h2>
                <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto">Select your portal to continue. Access is strictly authenticated via VIT university credentials and assigned operational roles.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                  
                  {/* Passenger Card */}
                  <div 
                    onClick={() => setSelectedRole('student')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-busmate-400 group"
                  >
                    <div className="w-20 h-20 bg-amber-50 text-busmate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-obsidian-900 mb-2">Passenger</h3>
                    <p className="text-sm text-slate-500">Students & Faculty</p>
                    <p className="text-xs text-busmate-600 mt-4 font-semibold">Google SSO Only (@vit.ac.in)</p>
                  </div>

                  {/* Driver Card */}
                  <div 
                    onClick={() => setSelectedRole('driver')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-obsidian-800 group"
                  >
                    <div className="w-20 h-20 bg-slate-100 text-obsidian-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-obsidian-900 mb-2">Driver</h3>
                    <p className="text-sm text-slate-500">Fleet Operations</p>
                    <p className="text-xs text-obsidian-700 mt-4 font-semibold">Terminal Access</p>
                  </div>

                  {/* Admin Card */}
                  <div 
                    onClick={() => setSelectedRole('admin')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group opacity-50 cursor-not-allowed"
                  >
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-obsidian-900 mb-2">Transport Admin</h3>
                    <p className="text-sm text-slate-500">Management Only</p>
                    <p className="text-xs text-blue-600 mt-4 font-semibold">Coming Soon</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-2xl text-center border border-slate-100 relative">
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="absolute top-8 left-8 text-slate-400 hover:text-obsidian-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  selectedRole === 'student' ? 'bg-busmate-400 text-obsidian-900' :
                  selectedRole === 'driver' ? 'bg-obsidian-900 text-white' : 'bg-purple-100 text-purple-600'
                }`}>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                
                <h2 className="text-3xl font-black text-obsidian-900 mb-2 tracking-tight">
                  {selectedRole === 'student' ? 'Passenger Login' :
                   selectedRole === 'driver' ? 'Driver Terminal' : 'Admin Login'}
                </h2>
                <p className="text-sm text-slate-500 mb-8 px-4 font-medium">
                  {selectedRole === 'student' ? 'Please sign in using your official @vit.ac.in or @vitstudent.ac.in Google account.' :
                   selectedRole === 'driver' ? 'Please sign in using the username and password provided by the transport department.' :
                   'Authorized fleet administrators only.'}
                </p>
                
                <SignInButton mode="modal">
                  <button className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 ${
                    selectedRole === 'student' ? 'bg-obsidian-900 hover:bg-black shadow-slate-300' :
                    selectedRole === 'driver' ? 'bg-busmate-500 text-obsidian-900 hover:bg-busmate-600 shadow-busmate-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  }`}>
                    Proceed to Authenticate
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </SignedOut>

        <SignedIn>
          {(currentView === 'driver' || isDriver) ? (
          <DriverScanner />
        ) : (
          <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left Column: Route Selection & Seat Grid */}
            <div className="flex-[3] space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
                <div className="flex w-full justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Select Route & Bus</h2>
                    <p className="text-sm text-slate-500">Choose your destination and preferred bus type.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xl font-black ${50 - reservedSeats.length === 0 ? 'text-red-500' : 'text-emerald-500'}`}>{50 - reservedSeats.length} Seats Left</span>
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  <select 
                    value={route}
                    disabled={isConfirmed}
                    onChange={(e) => {
                      setRoute(e.target.value);
                      setSelectedSeats([]);
                    }}
                    className="flex-1 bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-busmate-500 block p-3 shadow-sm outline-none disabled:opacity-50"
                  >
                    <option value="tambaram">Tambaram - VIT</option>
                    <option value="velachery">Velachery - VIT</option>
                    <option value="sholinganallur">Sholinganallur - VIT</option>
                    <option value="alandur">Alandur - VIT</option>
                  </select>
                  
                  <select 
                    value={busType}
                    disabled={isConfirmed}
                    onChange={(e) => {
                      setBusType(e.target.value);
                      setSelectedSeats([]);
                    }}
                    className="w-1/3 bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-busmate-500 block p-3 shadow-sm outline-none disabled:opacity-50"
                  >
                    <option value="AC">AC (Bus 1-4)</option>
                    <option value="NON-AC">Non-AC (Bus 5)</option>
                  </select>
                </div>
              </div>

              <SeatPickerGrid 
                rows={10} 
                reservedSeats={reservedSeats} 
                selectedSeats={selectedSeats}
                onSeatSelect={setSelectedSeats} 
                groupSize={groupSize}
                disabled={isConfirmed}
              />
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between mt-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  <select 
                    value={prefZone}
                    onChange={(e) => setPrefZone(e.target.value as any)}
                    disabled={isConfirmed}
                    className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-busmate-500 block p-2 outline-none disabled:opacity-50"
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
                    className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-busmate-500 block p-2 outline-none disabled:opacity-50"
                  >
                    <option value="any">Any Seat</option>
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                  </select>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleAutoAssign}
                    disabled={isConfirmed}
                    className="bg-white border-2 border-obsidian-900 text-obsidian-900 font-bold py-2 px-4 rounded-xl hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Auto-Assign {groupSize}
                  </button>
                  {isConfirmed ? (
                    <button 
                      onClick={() => setIsConfirmed(false)}
                      className="bg-red-500 text-white font-bold py-2 px-6 rounded-xl shadow-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Unlock Selection
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (selectedSeats.length === groupSize) setIsConfirmed(true);
                        else alert(`Please select ${groupSize} seats first.`);
                      }}
                      className="bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl shadow-md hover:bg-emerald-600 transition-colors text-sm"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Group Booking Panel & Ticket */}
            <div className="flex-[2] space-y-6">
              {!isFaculty ? (
                <div className="bg-obsidian-900 border border-obsidian-800 p-8 rounded-3xl shadow-lg relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-busmate-400">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 relative z-10">Group Bookings</h3>
                  <p className="text-sm text-slate-400 mb-6 relative z-10 leading-relaxed">
                    Want to sit with your friends? Form a group and the <b>Contiguous Allocation Engine</b> will automatically reserve consecutive seats for all of you!
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <label className="text-sm font-bold text-busmate-400">Booking Size:</label>
                    <select 
                      value={groupSize} 
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                      className="bg-obsidian-800 border-2 border-obsidian-700 text-white text-sm font-bold rounded-lg focus:ring-busmate-500 focus:border-busmate-500 block p-2 outline-none"
                    >
                      <option value={1}>1 (Solo)</option>
                      <option value={2} disabled={acceptedInvites < 1}>2 Friends {acceptedInvites < 1 && '(Wait 1 accept)'}</option>
                      <option value={3} disabled={acceptedInvites < 2}>3 Friends {acceptedInvites < 2 && '(Wait 2 accepts)'}</option>
                      <option value={4} disabled={acceptedInvites < 3}>4 Friends {acceptedInvites < 3 && '(Wait 3 accepts)'}</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                     <button onClick={() => setAcceptedInvites(p => p+1)} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">MOCK: +1 Friend Accept</button>
                     <button onClick={() => setAcceptedInvites(0)} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Reset</button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <button 
                      onClick={() => setIsSocialModalOpen(true)}
                      className="w-full bg-busmate-500 hover:bg-busmate-600 text-obsidian-900 font-bold py-3.5 px-4 rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Create a New Group
                    </button>
                    <button className="w-full bg-obsidian-800 hover:bg-obsidian-700 text-busmate-400 font-bold py-3.5 px-4 rounded-xl border-2 border-obsidian-700 transition-all flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      View Pending Invites
                    </button>
                  </div>

                  <div className="mt-8 border-t border-obsidian-800 pt-6 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-white">Saved Groups</h4>
                      <button onClick={() => {
                        const name = prompt('Enter a nickname for your new group:');
                        if (name) saveGroup(name);
                      }} className="text-xs font-bold bg-obsidian-800 text-busmate-400 px-3 py-1 rounded-full hover:bg-obsidian-700 transition-colors shadow-sm border border-obsidian-700">+ New</button>
                    </div>
                    {savedGroups.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4 bg-obsidian-800/50 rounded-xl border border-obsidian-800">No saved groups yet. Create one to quickly invite friends!</p>
                    ) : (
                      <div className="space-y-2">
                        {savedGroups.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)).map(g => (
                          <div key={g.id} className="flex justify-between items-center bg-obsidian-800 p-3 rounded-xl border border-obsidian-700 shadow-sm group">
                            <span className="font-bold text-sm text-white">{g.nickname}</span>
                            <button 
                              onClick={() => toggleFavorite(g.id)} 
                              className={`text-xl focus:outline-none transition-transform hover:scale-125 ${g.isFavorite ? 'text-busmate-400 drop-shadow-sm' : 'text-slate-600 hover:text-busmate-500'}`}
                            >
                              ★
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-obsidian-900 border border-obsidian-800 p-8 rounded-3xl shadow-sm text-white">
                  <h3 className="text-xl font-bold text-busmate-400 mb-2">Faculty Priority Access</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    As a faculty member, you have priority booking access. Group bookings are disabled for faculty accounts.
                  </p>
                </div>
              )}

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-busmate-400 to-accent-400"></div>
                <h2 className="text-xl font-black text-obsidian-900 mb-4 tracking-tighter">Your Boarding Pass</h2>
                <div className="flex justify-center p-4 bg-slate-50 rounded-2xl inline-block border border-slate-100">
                  <DynamicQRCode ticketId="TKT-12345" secretSeed="sample-secret-seed-for-testing" />
                </div>
                <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">Cryptographic HMAC-SHA256 Ticket</p>
              </div>
            </div>
          </div>
        )}
        </SignedIn>
      </main>

      <SocialModals isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
    </div>
  );
}

export default App;
