import React, { useState } from 'react';
import { SignedIn, SignedOut, useUser } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { login, signup } = useAuth();
  
  const isDriver = user?.publicMetadata?.role === 'driver';
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    firstName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'student' as 'student' | 'driver' | 'faculty' | 'admin',
    registrationNumber: '',
    facultyId: '',
    route: 'Tambaram',
    subscriptionType: 'AC Transport'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const success = login(formData.email, formData.password);
      if (success) {
        // Will auto-redirect via <SignedIn> block
      } else {
        alert('Invalid email or password. Please sign up if you do not have an account.');
      }
    } else {
      const success = signup(formData);
      if (success) {
        // Auto-login successful
      } else {
        alert('An account with this email already exists.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      <SignedOut>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-obsidian-900 tracking-tight">BusMate Portal</h2>
            <p className="text-sm text-slate-500 mt-2">{mode === 'login' ? 'Sign in to access your dashboard' : 'Create a new account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                    <input required type="text" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <input required type="text" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['student', 'faculty', 'driver'].map((r) => (
                      <button 
                        key={r}
                        type="button"
                        onClick={() => setFormData({...formData, role: r as any})}
                        className={`py-2 rounded-lg text-xs font-bold uppercase ${formData.role === r ? 'bg-busmate-500 text-obsidian-900' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Registration No.</label>
                      <input required type="text" placeholder="e.g. 21BCE1001" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Plan</label>
                      <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.subscriptionType} onChange={e => setFormData({...formData, subscriptionType: e.target.value})}>
                        <option>AC Transport</option>
                        <option>Non-AC Transport</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.role === 'faculty' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Faculty ID</label>
                    <input required type="text" placeholder="e.g. FAC-9981" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})} />
                  </div>
                )}

                {formData.role === 'driver' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Assigned Route</label>
                    <input required type="text" placeholder="e.g. Tambaram - VIT" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">{mode === 'login' ? 'Email or Phone' : 'Email Address'}</label>
                <input required type="text" placeholder={mode === 'login' ? 'Email or Phone' : 'email@example.com'} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input required type="text" placeholder="+91 9876543210" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <input required type="password" placeholder="••••••••" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" className="w-full bg-obsidian-900 text-white font-bold py-3 rounded-xl hover:bg-black transition mt-4">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-busmate-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-black mb-4">Welcome back, {user?.firstName}</h2>
          <button 
            onClick={() => navigate(isAdmin ? '/admin' : isDriver ? '/driver' : '/dashboard')}
            className="bg-busmate-500 text-obsidian-900 font-bold px-8 py-3 rounded-xl shadow-md hover:bg-busmate-600 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </SignedIn>
    </div>
  );
};

export default Landing;
