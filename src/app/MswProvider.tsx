'use client';

import { useEffect, useState } from 'react';

const MOCKING_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

/**
 * Starts the MSW browser worker before rendering children so the very first API
 * calls are intercepted. When mocking is disabled (real backend), it renders
 * children immediately and no worker is registered.
 */
export default function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (!MOCKING_ENABLED) return;
    let active = true;
    (async () => {
      const { startMockWorker } = await import('@/mocks/browser');
      await startMockWorker();
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
