import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <App/>
  </StrictMode>,
);
// Signal the boot watchdog in index.html that the app code executed.
rootEl.dataset.mounted = "true";
