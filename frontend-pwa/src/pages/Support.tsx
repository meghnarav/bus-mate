import React from 'react';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-obsidian-900 to-obsidian-800 rounded-3xl p-12 text-white shadow-xl text-center">
        <h2 className="text-4xl font-black mb-4">How can we help?</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Get in touch with the VIT Transport Operations team or browse our FAQs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-obsidian-900 mb-2">Emergency & SOS</h3>
          <p className="text-slate-500 mb-6">If you are currently on a bus and require immediate security or medical assistance.</p>
          <button 
            onClick={() => {
              alert('🚨 SOS Triggered! Your live location and identity have been sent to the Campus Security Control Room. Help is on the way.');
            }}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition"
          >
            Trigger SOS Alert
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="w-14 h-14 bg-busmate-100 text-busmate-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-obsidian-900 mb-2">Contact Transport Office</h3>
          <p className="text-slate-500 mb-6 flex-1">For route feedback, lost & found, or general inquiries.</p>
          <a 
            href="mailto:transport@vit.ac.in"
            className="w-full bg-obsidian-900 text-white font-bold py-3 rounded-xl hover:bg-black transition block text-center"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
