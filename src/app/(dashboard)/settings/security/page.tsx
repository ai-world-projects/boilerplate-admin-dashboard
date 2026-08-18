'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXTextField } from '@/components/AVXTextField';
import { PermissionGate } from '@/auth';
import {
  useSecuritySettings,
  useSecuritySettingsMutation,
} from '@/features/settings/useSecuritySettings';
import {
  securitySchema,
  type SecurityFormValues,
} from '@/features/settings/securitySchema';

/** number-input value → number | undefined (empty/invalid). */
const toNumber = (v: string) => (v === '' ? undefined : Number(v));

export default function SecuritySettingsPage() {
  const { data, isLoading, isError } = useSecuritySettings();
  const save = useSecuritySettingsMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      password: {
        minLength: 8,
        requireUpper: true,
        requireNumber: true,
        requireSymbol: false,
        expiryDays: 90,
      },
      sessionTimeoutMinutes: 30,
      lockout: { maxAttempts: 5, lockMinutes: 15 },
    },
  });

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
        <AVXPageHeader title="Security" subtitle="Password, session and lockout rules" />
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Couldn&apos;t load the security settings. Please try again.
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <AVXPageHeader
        title="Security"
        subtitle="Password, session and account-lockout rules"
        action={
          <PermissionGate permission="settings:security">
            <Button type="submit" variant="contained" disabled={save.isPending}>
              Save changes
            </Button>
          </PermissionGate>
        }
      />

      <Stack spacing={2.5}>
        {/* Password rules */}
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Password rules
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                mb: 1,
              }}
            >
              <Controller
                name="password.minLength"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                    type="number"
                    label="Minimum length"
                    error={!!errors.password?.minLength}
                    helperText={errors.password?.minLength?.message}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                )}
              />
              <Controller
                name="password.expiryDays"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                    type="number"
                    label="Expiry (days, 0 = never)"
                    error={!!errors.password?.expiryDays}
                    helperText={errors.password?.expiryDays?.message}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                )}
              />
            </Box>
            <Stack>
              <Controller
                name="password.requireUpper"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Require an uppercase letter"
                  />
                )}
              />
              <Controller
                name="password.requireNumber"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Require a number"
                  />
                )}
              />
              <Controller
                name="password.requireSymbol"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Require a symbol"
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Session */}
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Session
            </Typography>
            <Controller
              name="sessionTimeoutMinutes"
              control={control}
              render={({ field }) => (
                <AVXTextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e.target.value))}
                  type="number"
                  label="Idle timeout (minutes)"
                  error={!!errors.sessionTimeoutMinutes}
                  helperText={errors.sessionTimeoutMinutes?.message}
                  sx={{ maxWidth: 320 }}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Lockout */}
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Account lockout
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Controller
                name="lockout.maxAttempts"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                    type="number"
                    label="Max failed attempts"
                    error={!!errors.lockout?.maxAttempts}
                    helperText={errors.lockout?.maxAttempts?.message}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                )}
              />
              <Controller
                name="lockout.lockMinutes"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(toNumber(e.target.value))}
                    type="number"
                    label="Lock duration (minutes)"
                    error={!!errors.lockout?.lockMinutes}
                    helperText={errors.lockout?.lockMinutes?.message}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
