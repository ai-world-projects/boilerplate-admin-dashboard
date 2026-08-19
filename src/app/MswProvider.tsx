'use client';

import { useEffect, useState } from 'react';

// Gated purely on the flag, not NODE_ENV — so the mock worker also runs in a
// production build (the Vercel demo has no backend). `NEXT_PUBLIC_*` is inlined
// at build time, so this must be `enabled` when the deploy is built.
const MOCKING_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

/**
 * Starts the MSW browser worker before rendering children so the very first API
 * calls are intercepted. Runs whenever mocking is `enabled` (dev *and* the
 * production demo). When disabled (real backend), it renders children
 * immediately and no worker is registered.
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
