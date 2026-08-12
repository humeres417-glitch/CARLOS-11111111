import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle background IndexedDB / Firebase "database is closing / page is hidden" exceptions gracefully
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason?.message || String(event.reason || '');
  if (
    reasonStr.includes('database is closing') ||
    reasonStr.includes('database connection is closing') ||
    reasonStr.includes('page is hidden') ||
    reasonStr.includes('IndexedDB') ||
    reasonStr.includes('failed-precondition') ||
    reasonStr.includes('Internal error')
  ) {
    console.warn('[Ignored background DB/Auth closing rejection]:', reasonStr);
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('database is closing') ||
    msg.includes('database connection is closing') ||
    msg.includes('page is hidden') ||
    msg.includes('IndexedDB')
  ) {
    console.warn('[Ignored background DB/Auth closing error]:', msg);
    event.preventDefault();
  }
});

// Register Service Worker for PWA support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

