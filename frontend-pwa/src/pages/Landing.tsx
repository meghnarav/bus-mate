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
  const [lang, setLang] = useState<'en' | 'ta'>('en');
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
        alert(lang === 'ta' ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். உங்களிடம் கணக்கு இல்லை என்றால் பதிவு செய்யவும்.' : 'Invalid email or password. Please sign up if you do not have an account.');
      }
    } else {
      const dataToSubmit = {
        ...formData,
        firstName: formData.fullName.split(' ')[0]
      };
      const success = signup(dataToSubmit);
      if (success) {
        // Auto-login successful
      } else {
        alert(lang === 'ta' ? 'இந்த மின்னஞ்சலில் ஏற்கனவே ஒரு கணக்கு உள்ளது.' : 'An account with this email already exists.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      <SignedOut>
        <div className={`w-full ${lang === 'ta' ? 'max-w-lg' : 'max-w-md'} bg-white p-8 rounded-3xl shadow-2xl transition-all duration-300`}>
          <div className="flex justify-between items-start mb-6">
            <div className="text-left">
              <h2 className="text-3xl font-black text-obsidian-900 tracking-tight">
                {lang === 'ta' ? 'பஸ்மேட் போர்டல்' : 'BusMate Portal'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {mode === 'login' 
                  ? (lang === 'ta' ? 'உங்கள் டாஷ்போர்டை அணுக உள்நுழையவும்' : 'Sign in to access your dashboard') 
                  : (lang === 'ta' ? 'புதிய கணக்கை உருவாக்கவும்' : 'Create a new account')}
              </p>
            </div>
            
            <div className="flex bg-slate-100 rounded-lg p-1 ml-4 shrink-0">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${lang === 'en' ? 'bg-white shadow text-obsidian-900' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('ta')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${lang === 'ta' ? 'bg-white shadow text-obsidian-900' : 'text-slate-500'}`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {lang === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder={lang === 'ta' ? 'ராகுல் சர்மா' : 'Rahul Sharma'} 
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                    {lang === 'ta' ? 'கணக்கு வகை' : 'Account Role'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', label: lang === 'ta' ? 'மாணவர்' : 'student' },
                      { id: 'faculty', label: lang === 'ta' ? 'ஆசிரியர்' : 'faculty' },
                      { id: 'driver', label: lang === 'ta' ? 'ஓட்டுநர்' : 'driver (ஓட்டுநர்)' }
                    ].map((r) => (
                      <button 
                        key={r.id}
                        type="button"
                        onClick={() => setFormData({...formData, role: r.id as any})}
                        className={`py-2 rounded-lg text-xs font-bold uppercase ${formData.role === r.id ? 'bg-busmate-500 text-obsidian-900' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        {lang === 'ta' ? 'பதிவு எண்' : 'Registration No.'}
                      </label>
                      <input 
                        required 
                        type="text" 
                        placeholder={lang === 'ta' ? 'உ.ம். 21BCE1001' : 'e.g. 21BCE1001'} 
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                        value={formData.registrationNumber} 
                        onChange={e => setFormData({...formData, registrationNumber: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        {lang === 'ta' ? 'திட்டம்' : 'Plan'}
                      </label>
                      <select 
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                        value={formData.subscriptionType} 
                        onChange={e => setFormData({...formData, subscriptionType: e.target.value})}
                      >
                        <option value="AC Transport">{lang === 'ta' ? 'ஏசி போக்குவரத்து' : 'AC Transport'}</option>
                        <option value="Non-AC Transport">{lang === 'ta' ? 'ஏசி இல்லாத போக்குவரத்து' : 'Non-AC Transport'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.role === 'faculty' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      {lang === 'ta' ? 'ஆசிரியர் அடையாள எண்' : 'Faculty ID'}
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder={lang === 'ta' ? 'உ.ம். FAC-9981' : 'e.g. FAC-9981'} 
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                      value={formData.facultyId} 
                      onChange={e => setFormData({...formData, facultyId: e.target.value})} 
                    />
                  </div>
                )}

                {formData.role === 'driver' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">{lang === 'ta' ? 'ஒதுக்கப்பட்ட வழித்தடம்' : 'Assigned Route'}</label>
                      <select required className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})}>
                        <option value="Tambaram - VIT">{lang === 'ta' ? 'தாம்பரம் - விஐடி' : 'Tambaram - VIT'}</option>
                        <option value="Alandur - VIT">{lang === 'ta' ? 'ஆலந்தூர் - விஐடி' : 'Alandur - VIT'}</option>
                        <option value="Velachery - VIT">{lang === 'ta' ? 'வேளச்சேரி - விஐடி' : 'Velachery - VIT'}</option>
                        <option value="Sholinganallur - VIT">{lang === 'ta' ? 'சோழிங்கநல்லூர் - விஐடி' : 'Sholinganallur - VIT'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">{lang === 'ta' ? 'பேருந்து வகை' : 'Bus Type'}</label>
                      <select required className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" value={formData.subscriptionType} onChange={e => setFormData({...formData, subscriptionType: e.target.value})}>
                        <option value="AC">{lang === 'ta' ? 'ஏசி பேருந்து' : 'AC Bus'}</option>
                        <option value="NON-AC">{lang === 'ta' ? 'ஏசி இல்லாத பேருந்து' : 'Non-AC Bus'}</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className={mode === 'login' ? 'w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
              <div className="w-full">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  {mode === 'login' 
                    ? (lang === 'ta' ? 'மின்னஞ்சல் அல்லது தொலைபேசி' : 'Email or Phone') 
                    : (lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address')}
                </label>
                <input 
                  required 
                  type="text" 
                  placeholder={mode === 'login' 
                    ? (lang === 'ta' ? 'மின்னஞ்சல் அல்லது தொலைபேசி' : 'Email or Phone') 
                    : (lang === 'ta' ? 'மின்னஞ்சல்@example.com' : 'email@example.com')} 
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold focus:border-busmate-500 outline-none text-sm md:text-base" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {lang === 'ta' ? 'தொலைபேசி எண்' : 'Phone Number'}
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="+91 9876543210" 
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                {lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-bold focus:border-busmate-500 outline-none" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <button type="submit" className="w-full bg-obsidian-900 text-white font-bold py-3 rounded-xl hover:bg-black transition mt-4">
              {mode === 'login' 
                ? (lang === 'ta' ? 'உள்நுழைய' : 'Sign In') 
                : (lang === 'ta' ? 'கணக்கை உருவாக்கு' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            {mode === 'login' 
              ? (lang === 'ta' ? "கணக்கு இல்லையா? " : "Don't have an account? ") 
              : (lang === 'ta' ? "ஏற்கனவே கணக்கு உள்ளதா? " : "Already have an account? ")}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-busmate-600 font-bold hover:underline">
              {mode === 'login' 
                ? (lang === 'ta' ? 'பதிவு செய்யவும்' : 'Sign Up') 
                : (lang === 'ta' ? 'உள்நுழையவும்' : 'Sign In')}
            </button>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-black mb-4">
            {lang === 'ta' ? `மீண்டும் வருக, ${user?.firstName || ''}` : `Welcome back, ${user?.firstName}`}
          </h2>
          <button 
            onClick={() => navigate(isAdmin ? '/admin' : isDriver ? '/driver' : '/dashboard')}
            className="bg-busmate-500 text-obsidian-900 font-bold px-8 py-3 rounded-xl shadow-md hover:bg-busmate-600 transition"
          >
            {lang === 'ta' ? 'டாஷ்போர்டுக்குச் செல்லவும்' : 'Go to Dashboard'}
          </button>
        </div>
      </SignedIn>
    </div>
  );
};

export default Landing;
