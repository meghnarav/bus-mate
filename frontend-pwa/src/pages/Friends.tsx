import React, { useState, useEffect } from 'react';
import { mockStudents, Student } from '../data/mockStudents';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'my-friends'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sentRequests, setSentRequests] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('busmate_sent_reqs');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [myFriends, setMyFriends] = useState<Student[]>(() => {
    const saved = localStorage.getItem('busmate_friends');
    if (saved) return JSON.parse(saved);
    // Starter pack
    return mockStudents.slice(0, 5);
  });
  
  const [incomingRequests, setIncomingRequests] = useState<Student[]>(() => {
    const saved = localStorage.getItem('busmate_incoming');
    if (saved) return JSON.parse(saved);
    return [mockStudents[5], mockStudents[12]];
  });

  useEffect(() => {
    localStorage.setItem('busmate_sent_reqs', JSON.stringify(Array.from(sentRequests)));
    localStorage.setItem('busmate_friends', JSON.stringify(myFriends));
    localStorage.setItem('busmate_incoming', JSON.stringify(incomingRequests));
  }, [sentRequests, myFriends, incomingRequests]);

  const searchResults = searchQuery.trim().length > 0 
    ? mockStudents.filter(s => 
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSendRequest = (student: Student) => {
    setSentRequests(prev => new Set(prev).add(student.id));
    alert(`Friend request sent to ${student.full_name}`);
  };

  const handleAccept = (student: Student) => {
    setIncomingRequests(prev => prev.filter(s => s.id !== student.id));
    setMyFriends(prev => [...prev, student]);
  };

  const handleReject = (student: Student) => {
    setIncomingRequests(prev => prev.filter(s => s.id !== student.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-obsidian-900 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-black mb-2">Social Hub</h2>
        <p className="text-slate-400">Find friends, manage requests, and build your travel groups.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('find')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'find' ? 'bg-slate-50 text-busmate-600 border-b-2 border-busmate-500' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Find Friends
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-4 font-bold text-sm transition-colors flex justify-center items-center gap-2 ${activeTab === 'requests' ? 'bg-slate-50 text-busmate-600 border-b-2 border-busmate-500' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Friend Requests
            {incomingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('my-friends')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'my-friends' ? 'bg-slate-50 text-busmate-600 border-b-2 border-busmate-500' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            My Friends
          </button>
        </div>

        <div className="p-8 min-h-[400px]">
          {activeTab === 'find' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search by name or registration number (e.g. 21BCE...)" 
                  className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-busmate-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchQuery.trim().length > 0 ? (
                <div className="space-y-3">
                  {searchResults.length === 0 ? (
                    <p className="text-slate-400 text-center py-8 font-medium">No students found matching your query.</p>
                  ) : (
                    searchResults.map(user => (
                      <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:border-busmate-400 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-lg">
                            {user.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.full_name}</p>
                            <p className="text-sm font-medium text-slate-500">{user.registration_number}</p>
                          </div>
                        </div>
                        
                        {myFriends.find(f => f.id === user.id) ? (
                          <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl text-center">Friends</span>
                        ) : sentRequests.has(user.id) ? (
                          <span className="text-sm font-bold text-amber-500 bg-amber-50 px-4 py-2 rounded-xl text-center">Request Sent</span>
                        ) : (
                          <button 
                            onClick={() => handleSendRequest(user)}
                            className="bg-busmate-100 text-busmate-700 font-bold px-6 py-2 rounded-xl hover:bg-busmate-200 transition-colors text-sm w-full sm:w-auto"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-16 flex flex-col items-center">
                  <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <p className="font-medium">Search for students to send a friend request</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="text-center text-slate-400 py-16 font-medium">
                  You have no pending friend requests.
                </div>
              ) : (
                incomingRequests.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center font-black text-lg">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.full_name}</p>
                        <p className="text-sm font-medium text-slate-500">{user.registration_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAccept(user)}
                        className="flex-1 sm:flex-none bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleReject(user)}
                        className="flex-1 sm:flex-none bg-slate-100 text-slate-600 font-bold px-6 py-2 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'my-friends' && (
            <div className="space-y-4">
              {myFriends.length === 0 ? (
                <div className="text-center text-slate-400 py-16 font-medium">
                  You haven't added any friends yet.
                </div>
              ) : (
                myFriends.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-busmate-100 text-busmate-700 rounded-full flex items-center justify-center font-black text-lg">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user.full_name}</p>
                      <p className="text-sm font-medium text-slate-500">{user.registration_number}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
