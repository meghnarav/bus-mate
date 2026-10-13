import React from 'react';

const RoutesPage: React.FC = () => {
  const allRoutes = [
    { id: 'tambaram', name: 'VIT - Tambaram', status: 'On Time', nextBus: '13:30 - 13:45' },
    { id: 'velachery', name: 'VIT - Velachery', status: 'On Time', nextBus: '13:30 - 13:45' },
    { id: 'sholinganallur', name: 'VIT - Sholinganallur', status: 'On Time', nextBus: '13:30 - 13:45' },
    { id: 'alandur', name: 'VIT - Alandur', status: 'Full', nextBus: '13:30 - 13:45' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-obsidian-900 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-black mb-2">Live Routes</h2>
        <p className="text-slate-400">View real-time status of all campus shuttles.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-4">
          {allRoutes.map(route => (
            <div key={route.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-slate-100 rounded-2xl hover:border-busmate-400 transition cursor-pointer group">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-obsidian-800 group-hover:bg-busmate-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-obsidian-900">{route.name}</h3>
                  <p className="text-sm text-slate-500">Route ID: {route.id.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Next Bus</p>
                  <p className="font-bold text-obsidian-900">{route.nextBus}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  route.status === 'On Time' ? 'bg-emerald-100 text-emerald-700' :
                  route.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {route.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;
