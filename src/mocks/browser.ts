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
    startPromise = worker.start({ onUnhandledRequest: 'bypass' });
  }
  return startPromise;
}
