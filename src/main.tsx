import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker safely with auto-update
try {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.warn('PWA service worker registration skipped (Safari/Private mode):', error);
    },
  });
} catch (err) {
  console.warn('Service worker not supported in this browser context:', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
