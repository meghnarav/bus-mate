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
              const hasWindow = currentRun.includes(block[0]) || currentRun.includes(block[block.length - 1]);
              const hasAisle = isRightSide ? currentRun.includes(block[0]) : currentRun.includes(block[block.length - 1]);
              
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
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-wide">Campus Shuttle</h1>
          <span className="text-xs bg-indigo-800 px-2 py-0.5 rounded-full font-semibold">VIT</span>
        </div>
        
        <SignedIn>
          <div className="flex items-center gap-6">
            {!isDriver && (
              <div className="space-x-2 bg-indigo-700/50 p-1 rounded-lg">
                <button 
                  onClick={() => setCurrentView('passenger')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currentView === 'passenger' ? 'bg-indigo-500 shadow-sm' : 'hover:bg-indigo-500/50'}`}
                >
                  Passenger
                </button>
                <button 
                  onClick={() => setCurrentView('driver')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${currentView === 'driver' ? 'bg-indigo-500 shadow-sm' : 'hover:bg-indigo-500/50'}`}
                >
                  Driver
                </button>
              </div>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </nav>

      <main className="p-6">
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[75vh]">
            {!selectedRole ? (
              <div className="w-full max-w-4xl text-center">
                <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Welcome to Campus Shuttle</h2>
                <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto">Select your portal to continue. Access is strictly authenticated via VIT university credentials and assigned operational roles.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                  
                  {/* Passenger Card */}
                  <div 
                    onClick={() => setSelectedRole('student')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-amber-400 group"
                  >
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Passenger</h3>
                    <p className="text-sm text-slate-500">Students & Faculty</p>
                    <p className="text-xs text-amber-600 mt-4 font-semibold">Google SSO Only (@vit.ac.in)</p>
                  </div>

                  {/* Driver Card */}
                  <div 
                    onClick={() => setSelectedRole('driver')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-slate-800 group"
                  >
                    <div className="w-20 h-20 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Driver Terminal</h3>
                    <p className="text-sm text-slate-500">Bus Operators</p>
                    <p className="text-xs text-slate-600 mt-4 font-semibold">Preset Username / Password</p>
                  </div>

                  {/* Admin Card */}
                  <div 
                    onClick={() => setSelectedRole('admin')}
                    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-purple-600 group"
                  >
                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Admin Portal</h3>
                    <p className="text-sm text-slate-500">Fleet Management</p>
                    <p className="text-xs text-purple-600 mt-4 font-semibold">Authorized Accounts Only</p>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100 relative">
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-semibold text-sm flex items-center gap-1"
                >
                  ← Back
                </button>
                
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  selectedRole === 'student' ? 'bg-amber-100 text-amber-600' :
                  selectedRole === 'driver' ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-600'
                }`}>
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
                  {selectedRole === 'student' ? 'Passenger Login' :
                   selectedRole === 'driver' ? 'Driver Terminal' : 'Admin Login'}
                </h2>
                <p className="text-sm text-slate-500 mb-8 px-4">
                  {selectedRole === 'student' ? 'Please sign in using your official @vit.ac.in or @vitstudent.ac.in Google account.' :
                   selectedRole === 'driver' ? 'Please sign in using the username and password provided by the transport department.' :
                   'Authorized fleet administrators only.'}
                </p>
                
                <SignInButton mode="modal">
                  <button className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 ${
                    selectedRole === 'student' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                    selectedRole === 'driver' ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-300' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
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
                    className="flex-1 bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-amber-500 block p-3 shadow-sm outline-none disabled:opacity-50"
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
                    className="w-1/3 bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-amber-500 block p-3 shadow-sm outline-none disabled:opacity-50"
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
                    className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-amber-500 block p-2 outline-none disabled:opacity-50"
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
                    className="bg-slate-50 border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-amber-500 block p-2 outline-none disabled:opacity-50"
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
                    className="bg-white border-2 border-amber-500 text-amber-600 font-bold py-2 px-4 rounded-xl hover:bg-amber-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-900">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-amber-800 mb-2 relative z-10">Group Bookings</h3>
                  <p className="text-sm text-amber-700 mb-6 relative z-10 leading-relaxed">
                    Want to sit with your friends? Form a group and the <b>Contiguous Allocation Engine</b> will automatically reserve consecutive seats for all of you!
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <label className="text-sm font-bold text-amber-800">Booking Size:</label>
                    <select 
                      value={groupSize} 
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                      className="bg-white border-2 border-amber-200 text-amber-800 text-sm font-bold rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2"
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
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Create a New Group
                    </button>
                    <button className="w-full bg-white hover:bg-amber-100 text-amber-700 font-bold py-3.5 px-4 rounded-xl border-2 border-amber-300 transition-all flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      View Pending Invites
                    </button>
                  </div>

                  <div className="mt-8 border-t border-amber-200/50 pt-6 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-amber-800">Saved Groups</h4>
                      <button onClick={() => {
                        const name = prompt('Enter a nickname for your new group:');
                        if (name) saveGroup(name);
                      }} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors shadow-sm border border-amber-200">+ New</button>
                    </div>
                    {savedGroups.length === 0 ? (
                      <p className="text-xs text-amber-600/70 italic text-center py-4 bg-amber-50/50 rounded-xl border border-amber-100/50">No saved groups yet. Create one to quickly invite friends!</p>
                    ) : (
                      <div className="space-y-2">
                        {savedGroups.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)).map(g => (
                          <div key={g.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm group">
                            <span className="font-bold text-sm text-slate-700">{g.nickname}</span>
                            <button 
                              onClick={() => toggleFavorite(g.id)} 
                              className={`text-xl focus:outline-none transition-transform hover:scale-125 ${g.isFavorite ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200 hover:text-amber-200'}`}
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
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-8 rounded-3xl shadow-sm">
                  <h3 className="text-xl font-bold text-indigo-800 mb-2">Faculty Priority Access</h3>
                  <p className="text-sm text-indigo-700 leading-relaxed">
                    As a faculty member, you have priority booking access. Group bookings are disabled for faculty accounts.
                  </p>
                </div>
              )}

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Your Dynamic Ticket</h2>
                <div className="flex justify-center">
                  <DynamicQRCode ticketId="TKT-12345" secretSeed="sample-secret-seed-for-testing" />
                </div>
                <p className="text-xs text-slate-400 mt-4">Cryptographic HMAC-SHA256 Ticket</p>
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
