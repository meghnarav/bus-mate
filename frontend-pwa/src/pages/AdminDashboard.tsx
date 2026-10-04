import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getBookings, Booking } from '../data/mockBookings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'routes'>('bookings');
  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);
  const { simulateRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLiveBookings(getBookings());
    
    // Poll for live updates
    const interval = setInterval(() => {
      setLiveBookings(getBookings());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = (role: 'student' | 'faculty' | 'driver') => {
    if (simulateRole) {
      simulateRole(role);
      navigate(role === 'driver' ? '/driver' : '/dashboard');
    }
  };

  const [routes, setRoutes] = useState([
    { id: 'tambaram', name: 'Tambaram - VIT', stops: ['Tambaram', 'Perungalathur', 'Vandalur', 'VIT'] },
    { id: 'alandur', name: 'Alandur - VIT', stops: ['Alandur', 'Guindy', 'Pallavaram', 'Chromepet', 'VIT'] },
    { id: 'velachery', name: 'Velachery - VIT', stops: ['Velachery', 'Pallikaranai', 'Medavakkam', 'VIT'] },
    { id: 'sholinganallur', name: 'Sholinganallur - VIT', stops: ['Sholinganallur', 'Navalur', 'Kelambakkam', 'VIT'] },
  ]);

  const handleEditStops = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const stopsStr = prompt(`Edit stops for ${route.name} (comma separated):`, route.stops.join(', '));
      if (stopsStr) {
        setRoutes(routes.map(r => r.id === routeId ? { ...r, stops: stopsStr.split(',').map(s => s.trim()) } : r));
      }
    }
  };

  const handleAddRoute = () => {
    const name = prompt('Enter Route Name (e.g., Guindy - VIT):');
    const stopsStr = prompt('Enter stops separated by commas:');
    if (name && stopsStr) {
      const id = name.split(' ')[0].toLowerCase();
      const stops = stopsStr.split(',').map(s => s.trim());
      setRoutes([...routes, { id, name, stops }]);
    }
  };

  const handleRemoveRoute = (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      setRoutes(routes.filter(r => r.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-obsidian-900 text-sm uppercase tracking-widest">Simulate View</h3>
            <p className="text-xs text-slate-500">View the app exactly as a specific role sees it.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSimulate('student')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition">Student View</button>
          <button onClick={() => handleSimulate('faculty')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition">Faculty View</button>
          <button onClick={() => handleSimulate('driver')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition">Driver View</button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black mb-2">Transport Admin Console</h2>
          <p className="text-purple-200">Manage fleet operations, bookings, and route definitions.</p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center">
          <p className="text-4xl font-black text-amber-400">{liveBookings.length}</p>
          <p className="text-xs uppercase font-bold tracking-wider">Active Bookings</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 font-bold text-sm transition-colors ${activeTab === 'bookings' ? 'bg-white text-purple-700 border-t-2 border-l-2 border-r-2 border-slate-200 rounded-t-xl -mb-[1px]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Booking Overview
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          className={`px-8 py-4 font-bold text-sm transition-colors ${activeTab === 'routes' ? 'bg-white text-purple-700 border-t-2 border-l-2 border-r-2 border-slate-200 rounded-t-xl -mb-[1px]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Route Management
        </button>
      </div>

      <div className="bg-white p-8 rounded-b-3xl rounded-tr-3xl border border-slate-200 shadow-sm min-h-[500px]">
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-obsidian-900">Live Booking Ledger</h3>
              <input type="text" placeholder="Search Ticket ID or Student Name..." className="border border-slate-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-purple-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold rounded-tl-xl">Ticket ID</th>
                    <th className="p-4 font-bold">Passenger (s)</th>
                    <th className="p-4 font-bold">Seats</th>
                    <th className="p-4 font-bold">Route</th>
                    <th className="p-4 font-bold">Bus Type</th>
                    <th className="p-4 font-bold rounded-tr-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-600">{b.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{b.name}</span>
                        {b.subMembers.length > 0 && (
                          <span className="text-xs text-slate-500 font-medium mt-1 block">
                            + {b.subMembers.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-obsidian-900 bg-amber-100 px-2 py-1 rounded text-xs">
                          {b.noOfSeats} {b.noOfSeats > 1 ? 'Seats' : 'Seat'}
                        </span>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          {b.seats.join(', ')}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{b.route}</td>
                      <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{b.bus}</span></td>
                      <td className="p-4 text-sm text-slate-500">{b.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-obsidian-900">Active Routes & Stops</h3>
              <button 
                onClick={handleAddRoute}
                className="bg-purple-600 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-purple-700 transition"
              >
                + Add New Route
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.map(route => (
                <div key={route.id} className="border border-slate-200 p-6 rounded-2xl relative group hover:border-purple-300 transition-colors">
                  <button 
                    onClick={() => handleRemoveRoute(route.id)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                  <h4 className="text-lg font-bold text-obsidian-900 mb-4">{route.name}</h4>
                  
                  <div className="relative border-l-2 border-purple-200 ml-2 pl-4 py-2 space-y-6">
                    {route.stops.map((stop, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-bold text-slate-700">{stop}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={() => handleEditStops(route.id)} className="mt-6 w-full py-2 bg-slate-50 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-100 border border-slate-200">
                    Edit Stops
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
