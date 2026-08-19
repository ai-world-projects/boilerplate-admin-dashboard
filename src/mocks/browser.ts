import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Browser-side MSW worker. */
export const worker = setupWorker(...handlers);

// Start the worker at most once per page load. React Strict Mode double-invokes
// effects in development, and calling worker.start() on an already-enabled
// worker throws ("cannot configure an already enabled network"). Caching the
// start promise makes repeated calls safe and share the same startup.
let startPromise: Promise<unknown> | null = null;

export function startMockWorker() {
  if (!startPromise) {
    // `bypass` lets non-API requests (Next assets, fonts) through untouched;
    // `quiet` silences MSW's per-request console logging in the prod demo.
    startPromise = worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }
  return startPromise;
}
