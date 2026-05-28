import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import FirebaseProvider from './components/FirebaseProvider.tsx';
import LanguageProvider from './components/LanguageProvider.tsx';
import './index.css';

// Global error handler for Google Maps authentication & billing failures (e.g. BillingNotEnabledMapError)
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = function() {
    console.warn("🚨 [Maps Auth Alert] Google Maps Key authentication failed (e.g., BillingNotEnabledMapError). Triggering dynamic UI fallback...");
    (window as any).GOOGLE_MAPS_AUTH_FAILED = true;
    window.dispatchEvent(new CustomEvent('google-maps-auth-failed'));
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </FirebaseProvider>
  </StrictMode>,
);

