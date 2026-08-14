import { AxiosError } from 'axios';
import { GENERIC_ERROR_MESSAGE } from './constants';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export interface HandledApiError {
  errorMessage: string;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Normalises any thrown value (Axios error, native Error, or unknown) into a
 * predictable shape the UI can display. Mirrors the reference admin's
 * `handleApiError`, minus the global-redirect side effects which now live in the
 * axios response interceptor (see api/client.ts).
 */
export function handleApiError(error: unknown): HandledApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    return {
      errorMessage: data?.message || error.message || GENERIC_ERROR_MESSAGE,
      errorCode: data?.error,
      statusCode: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: GENERIC_ERROR_MESSAGE };
}
