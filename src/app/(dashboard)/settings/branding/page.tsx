'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXTextField } from '@/components/AVXTextField';
import { AVXColorField } from '@/components/AVXColorField';
import { PermissionGate } from '@/auth';
import {
  useBrandingSettings,
  useBrandingSettingsMutation,
} from '@/features/settings/useBrandingSettings';
import {
  brandingSchema,
  type BrandingFormValues,
} from '@/features/settings/brandingSchema';

export default function BrandingSettingsPage() {
  const { data, isLoading, isError } = useBrandingSettings();
  const save = useBrandingSettingsMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { appName: '', logoUrl: '', primaryColor: '#192a56' },
  });

  const preview = useWatch({ control });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await save.mutateAsync(values);
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <>
        <AVXPageHeader title="Branding" subtitle="App name, logo and theme color" />
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Couldn&apos;t load the branding settings. Please try again.
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <AVXPageHeader
        title="Branding"
        subtitle="App name, logo and primary theme color"
        action={
          <PermissionGate permission="settings:branding">
            <Button type="submit" variant="contained" disabled={save.isPending}>
              Save changes
            </Button>
          </PermissionGate>
        }
      />

      <Card sx={{ maxWidth: 640 }}>
        <CardContent>
          <Stack spacing={2.5}>
            {/* Preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={preview.logoUrl || undefined}
                variant="rounded"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: preview.primaryColor,
                  fontWeight: 700,
                }}
              >
                {(preview.appName || 'A').charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4">{preview.appName || 'App name'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Preview of your brand mark
                </Typography>
              </Box>
            </Box>

            <Controller
              name="appName"
              control={control}
              render={({ field }) => (
                <AVXTextField
                  {...field}
                  label="App name"
                  error={!!errors.appName}
                  helperText={errors.appName?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                <AVXTextField
                  {...field}
                  label="Logo URL"
                  placeholder="https://…"
                  error={!!errors.logoUrl}
                  helperText={errors.logoUrl?.message ?? 'Optional — leave blank to use initials'}
                  fullWidth
                />
              )}
            />
            <Controller
              name="primaryColor"
              control={control}
              render={({ field }) => (
                <AVXColorField
                  label="Primary color"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.primaryColor}
                  helperText={
                    errors.primaryColor?.message ??
                    'Applied to the app theme on save'
                  }
                />
              )}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
