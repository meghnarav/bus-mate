import React, { useState } from 'react';

export const SocialModals = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    // In production, this would call GET /api/v1/friends/search?q=searchQuery
    // For now, we mock the response to show the UI
    if (searchQuery.trim().length > 0) {
      setSearchResults([
        { id: '1', full_name: 'Rahul Sharma', registration_number: '21BCE0999' },
        { id: '2', full_name: 'Priya Patel', registration_number: '21BCE0888' }
      ]);
    }
  };

  const handleSendRequest = (id: string) => {
    // In production, this calls POST /api/v1/friends/request
    setSentRequests(prev => new Set(prev).add(id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all border border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Find Friends</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-slate-50 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search by name or Reg No..." 
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="bg-amber-500 text-slate-900 px-5 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm">
              Search
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[300px] max-h-[60vh] overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="text-center text-slate-400 py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="font-medium">Search for friends to form a group</p>
              <p className="text-sm mt-1">They must accept before you can book seats.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Results</p>
              {searchResults.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user.full_name}</p>
                      <p className="text-xs font-medium text-slate-500">{user.registration_number}</p>
                    </div>
                  </div>
                  {sentRequests.has(user.id) ? (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Sent
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleSendRequest(user.id)}
                      className="text-sm bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
