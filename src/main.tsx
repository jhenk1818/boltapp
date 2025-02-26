import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set referrer policy programmatically as well
if (document.head) {
  // Check if meta tag already exists
  let metaReferrer = document.head.querySelector('meta[name="referrer"]');
  if (!metaReferrer) {
    metaReferrer = document.createElement('meta');
    metaReferrer.name = 'referrer';
    metaReferrer.content = 'no-referrer';
    document.head.appendChild(metaReferrer);
  } else {
    metaReferrer.content = 'no-referrer';
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);