import React, { useState, useEffect } from 'react';
import { useUser } from '../context/AuthContext';
import { getUserRole } from '../utils/role';

const Account: React.FC = () => {
  const { user } = useUser();
  const role = getUserRole(user);

  // Load from localStorage or use defaults
  const [isLocked, setIsLocked] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    phoneNumber: '',
    branch: '',
    bloodGroup: '',
    subscriptionType: 'AC Transport',
  });

  useEffect(() => {
    const saved = localStorage.getItem('busmate_account_details');
    if (saved) {
      setFormData(JSON.parse(saved));
      setIsLocked(true);
    } else {
      setFormData({
        registrationNumber: role === 'faculty' ? 'FAC-2023-' : '21BCE',
        phoneNumber: '+91 ',
        branch: 'Computer Science and Engineering',
        bloodGroup: 'O+',
        subscriptionType: 'AC Transport',
      });
    }
  }, [role]);

  const handleSave = () => {
    if (window.confirm('Are you sure? These details can only be set once and cannot be changed later without admin approval.')) {
      localStorage.setItem('busmate_account_details', JSON.stringify(formData));
      setIsLocked(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-obsidian-900 rounded-3xl p-8 text-white shadow-xl flex items-center gap-6 border-l-4 border-busmate-400">
        <img src={user?.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-busmate-400 shadow-lg" />
        <div>
          <h2 className="text-3xl font-black mb-1">{user?.fullName}</h2>
          <p className="text-busmate-400 font-bold uppercase tracking-wider text-sm">{role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            {!isLocked && (
              <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs font-bold text-center py-1 uppercase tracking-wider">
                Action Required
              </div>
            )}
            <h3 className={`font-bold text-obsidian-900 mb-4 text-lg border-b border-slate-100 pb-2 ${!isLocked ? 'mt-4' : ''}`}>University Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Registration Number</p>
                {isLocked ? (
                  <p className="font-bold text-slate-800">{formData.registrationNumber}</p>
                ) : (
                  <input type="text" className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-busmate-400 outline-none" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Official Email</p>
                <p className="font-bold text-slate-800">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Branch / Department</p>
                {isLocked ? (
                  <p className="font-bold text-slate-800">{formData.branch}</p>
                ) : (
                  <input type="text" className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-busmate-400 outline-none" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Transport Plan</p>
                <p className="font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg">{formData.subscriptionType}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Emergency Contact</p>
                {isLocked ? (
                  <p className="font-bold text-slate-800">{formData.phoneNumber}</p>
                ) : (
                  <input type="text" className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-busmate-400 outline-none" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                )}
              </div>
              
              {!isLocked && (
                <button 
                  onClick={handleSave}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Lock Details
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-obsidian-900 mb-4 text-xl border-b border-slate-100 pb-4">Security Settings</h3>
            <p className="text-slate-500 mb-6 text-sm">Update your password here. To change email, please contact IT support.</p>
            
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full border-2 border-slate-200 rounded-lg px-4 py-2 font-bold focus:border-busmate-400 outline-none" />
              </div>
              <button className="bg-obsidian-900 text-white font-bold py-2 px-6 rounded-xl hover:bg-black transition">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
