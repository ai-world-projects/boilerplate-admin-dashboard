import { enqueueSnackbar } from 'notistack';

/**
 * Toast helpers wrapping notistack's imperative API so features can fire
 * notifications without the useSnackbar hook.
 */
export const notify = {
  success: (message: string) => enqueueSnackbar(message, { variant: 'success' }),
  error: (message: string) => enqueueSnackbar(message, { variant: 'error' }),
  info: (message: string) => enqueueSnackbar(message, { variant: 'info' }),
  warning: (message: string) => enqueueSnackbar(message, { variant: 'warning' }),
};
