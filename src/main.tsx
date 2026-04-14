import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import { Analytics } from '@vercel/analytics/react'

import DesktopApp from './desktop/App'
import DesktopEnhancedApp from './desktop-enhanced/DesktopEnhancedApp'
import { HeartbeatManager } from './data/HeartbeatManager'
import { LayoutOrchestrator } from './components/LayoutOrchestrator'

import './styles/index.css'
import { STORAGE_PREFIX } from './config'

// --- VERSION BOMB ---
const APP_VERSION = 'v5_desktop';
const STORAGE_VERSION_KEY = `${STORAGE_PREFIX}version_marker`;

try {
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion !== APP_VERSION) {
    console.warn(`Version mismatch (found ${currentVersion}, expected ${APP_VERSION}). Clearing storage.`);
    localStorage.clear();
    localStorage.setItem(STORAGE_VERSION_KEY, APP_VERSION);
  }
} catch (e) {
  console.error('Failed to check/clear storage version:', e);
}
// --------------------

const getApp = () => {
  const pathname = window.location.pathname;

  // 1. Alternate Option (Standard View)
  if (pathname.includes('alternate')) {
    return <DesktopApp />;
  }

  // Default: Desktop Enhanced
  return <DesktopEnhancedApp />;
};

const shouldEnableAnalytics =
  import.meta.env.PROD || import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS_DEV === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {shouldEnableAnalytics ? (
      <Analytics mode={import.meta.env.PROD ? 'production' : 'development'} />
    ) : null}
    <Provider>
      <HeartbeatManager />
      <LayoutOrchestrator />
      {getApp()}
    </Provider>
  </React.StrictMode>,
)
