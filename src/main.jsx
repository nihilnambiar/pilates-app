import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// TEMPORARY — local-only evaluation of the ConversionXBot widget.
// Gated to dev mode so it can never end up in a production build even if
// this file is committed as-is. Remove once you're done testing it, and do
// not add this to index.html or any production-served file.
if (import.meta.env.DEV) {
  const conversionXBotScript = document.createElement('script');
  conversionXBotScript.src = 'https://api.conversionxbot.com/widget.js';
  conversionXBotScript.setAttribute('data-bot-id', 'cb_73641a652b0d06dd7f');
  document.head.appendChild(conversionXBotScript);
}

console.log('🚀 App starting...');
console.log('Firebase config check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ MISSING',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ MISSING',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ MISSING',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ MISSING',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
