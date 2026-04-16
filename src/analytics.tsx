import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';
import { track } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { activePageAtom } from './data/activePageAtom';
import { desktopViewAtom } from './desktop/atoms';

export const isAnalyticsEnabled =
  import.meta.env.PROD || import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS_DEV === 'true';

const analyticsMode = import.meta.env.PROD ? 'production' : 'development';

const getChecksRoute = (view: 'live' | 'historical') => ({
  route: `/checks/${view}`,
  path: `/checks/${view}`,
});

const getVirtualRoute = (activePage: string, view: 'live' | 'historical') => {
  if (activePage === 'checks') {
    return getChecksRoute(view);
  }

  return {
    route: `/${activePage}`,
    path: `/${activePage}`,
  };
};

export const getResultCountBucket = (count: number) => {
  if (count === 0) return '0';
  if (count === 1) return '1';
  if (count <= 5) return '2-5';
  if (count <= 20) return '6-20';
  return '21+';
};

export const trackEvent = (
  name: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  if (!isAnalyticsEnabled) {
    return;
  }

  try {
    track(name, properties);
  } catch {
    // Keep analytics failures from affecting the demo runtime.
  }
};

export const AppAnalytics = () => {
  const activePage = useAtomValue(activePageAtom);
  const view = useAtomValue(desktopViewAtom);
  const previousViewRef = useRef(view);
  const virtualRoute = useMemo(() => getVirtualRoute(activePage, view), [activePage, view]);

  // Enable debug mode in development to see events in console
  const isDebug = !import.meta.env.PROD;

  useEffect(() => {
    if (previousViewRef.current === view) {
      return;
    }

    trackEvent('workspace_view_changed', {
      active_page: activePage,
      from_view: previousViewRef.current,
      to_view: view,
    });

    previousViewRef.current = view;
  }, [activePage, view]);

  if (!isAnalyticsEnabled) {
    if (isDebug) {
      console.log('[Analytics] Local tracking skipped (isAnalyticsEnabled is false)');
    }
    return null;
  }

  return (
    <>
      <Analytics
        mode={analyticsMode}
        route={virtualRoute.route}
        path={virtualRoute.path}
        debug={isDebug}
      />
      <SpeedInsights />
    </>
  );
};
