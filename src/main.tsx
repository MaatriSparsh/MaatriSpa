import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import FirebaseProvider from './components/FirebaseProvider.tsx';
import LanguageProvider from './components/LanguageProvider.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </FirebaseProvider>
  </StrictMode>,
);

