import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import { TripProvider } from './context/TripContext.jsx';
import './index.css';

// Service worker (offline cache) — registered in production builds only
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TripProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </TripProvider>
    </BrowserRouter>
  </React.StrictMode>
);