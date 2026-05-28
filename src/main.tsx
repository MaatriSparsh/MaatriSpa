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

  // Intercept console.error to catch BillingNotEnabledMapError in real-time
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorStr = args.map(arg => {
      try {
        return typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    if (
      errorStr.includes("BillingNotEnabledMapError") || 
      errorStr.includes("gm_authFailure") || 
      errorStr.includes("billing-not-enabled-map-error")
    ) {
      console.warn("🚨 Detected Google Maps billing limitation error in console. Forcing secure UI fallback map toggle...");
      (window as any).GOOGLE_MAPS_AUTH_FAILED = true;
      window.dispatchEvent(new CustomEvent('google-maps-auth-failed'));
    }
    originalConsoleError.apply(console, args);
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

