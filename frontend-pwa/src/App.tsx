import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SignedIn, UserButton, useAuth } from './context/AuthContext';
import { getUserRole } from './utils/role';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BookingSession from './pages/BookingSession';
import DriverScanner from './pages/DriverScanner';
import MyBookings from './pages/MyBookings';
import RoutesPage from './pages/Routes';
import SupportPage from './pages/Support';
import Friends from './pages/Friends';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role = getUserRole(user);
  const isDriver = role === 'driver';
  const isAdmin = role === 'admin';
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-transit-surface font-sans text-transit-ink">
      <nav className="bg-transit-ink text-white shadow-md border-b-2 border-transit-red relative z-50">
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-transit-red rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
                CT
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-white leading-tight">
                  Campus<span className="text-transit-red">Transit</span>
                </h1>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 -mt-0.5">Shuttle Tech</span>
              </div>
              <span className="text-[10px] uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold ml-1">LIVE</span>
            </Link>
            
            <SignedIn>
              <div className="hidden lg:flex items-center gap-1 ml-6 pl-6 border-l border-white/20">
                <Link to={isAdmin ? '/admin' : isDriver ? '/driver' : '/dashboard'} className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-busmate-400">Dashboard</Link>
                {!isDriver && !isAdmin && (
                  <>
                    <Link to="/bookings" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">My Bookings</Link>
                    <Link to="/friends" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Friends</Link>
                  </>
                )}
                {!isAdmin && <Link to="/routes" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Routes</Link>}
                <Link to="/account" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Account</Link>
                <Link to="/support" className="px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors text-slate-300">Support</Link>
              </div>
            </SignedIn>
          </div>
          
          <SignedIn>
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <div className="border-l border-white/20 pl-4 hidden lg:block">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Mobile Expandable Menu */}
        <SignedIn>
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-obsidian-900 border-b border-obsidian-800 shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
              <div className="flex flex-col p-4 divide-y divide-white/10">
                <Link onClick={() => setIsMenuOpen(false)} to={isAdmin ? '/admin' : isDriver ? '/driver' : '/dashboard'} className="py-3 text-base font-bold text-busmate-400">Dashboard</Link>
                {!isDriver && !isAdmin && (
                  <>
                    <Link onClick={() => setIsMenuOpen(false)} to="/bookings" className="py-3 text-base font-medium text-slate-300 hover:text-white">My Bookings</Link>
                    <Link onClick={() => setIsMenuOpen(false)} to="/friends" className="py-3 text-base font-medium text-slate-300 hover:text-white">Friends</Link>
                  </>
                )}
                {!isAdmin && <Link onClick={() => setIsMenuOpen(false)} to="/routes" className="py-3 text-base font-medium text-slate-300 hover:text-white">Routes</Link>}
                <Link onClick={() => setIsMenuOpen(false)} to="/account" className="py-3 text-base font-medium text-slate-300 hover:text-white">Account</Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/support" className="py-3 text-base font-medium text-slate-300 hover:text-white">Support</Link>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-base font-medium text-slate-300">Log Out / Manage</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          )}
        </SignedIn>
      </nav>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking/:sessionId" element={<BookingSession />} />
          <Route path="/driver" element={<DriverScanner />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
