'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBrandingSettings,
  updateBrandingSettings,
} from '@/api/services/settings';
import type { BrandingSettings } from '@/api/interfaces/Settings';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';
import { hexToRgbTriplet } from '@/utils/color';

/**
 * Apply a hex primary color to the theme's CSS variable. The theme reads
 * `rgb(var(--rgb-primary))`, so hex must be converted to an "r g b" triplet.
 * This is the single place that conversion + write happens.
 */
export function applyPrimaryColor(hex: string): void {
  if (typeof document === 'undefined') return;
  const triplet = hexToRgbTriplet(hex);
  if (triplet) {
    document.documentElement.style.setProperty('--rgb-primary', triplet);
  }
}

export function useBrandingSettings() {
  return useQuery({
    queryKey: ['settings', 'branding'],
    queryFn: getBrandingSettings,
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

/**
 * Applies the saved branding color to the live theme. Mount once (in AppShell)
 * so the whole app re-skins from the stored branding on load and after edits.
 */
export function useApplyBranding() {
  const { data } = useBrandingSettings();
  useEffect(() => {
    if (data?.primaryColor) applyPrimaryColor(data.primaryColor);
  }, [data?.primaryColor]);
}

export function useBrandingSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BrandingSettings) => updateBrandingSettings(body),
    onSuccess: (res) => {
      notify.success(res.message);
      applyPrimaryColor(res.data.primaryColor);
      qc.invalidateQueries({ queryKey: ['settings', 'branding'] });
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });
}
