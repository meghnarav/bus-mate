import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#ef4444' }}>Missing Clerk Publishable Key</h1>
      <p>Please create a <code>.env</code> file in the <code>frontend-pwa/</code> directory with your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable the UI.</p>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
}
