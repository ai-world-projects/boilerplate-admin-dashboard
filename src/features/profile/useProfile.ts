'use client';

import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/api/services/auth';
import type { ChangePasswordRequest } from '@/api/interfaces/Auth';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => changePassword(body),
    onSuccess: (res) => notify.success(res.message),
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });
}
