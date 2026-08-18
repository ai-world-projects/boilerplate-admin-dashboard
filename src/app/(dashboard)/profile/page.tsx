'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXTextField } from '@/components/AVXTextField';
import { useAuth } from '@/auth';
import { PERMISSIONS } from '@/auth/permissions';
import { getRoleColor } from '@/utils/roleColor';
import { useChangePassword } from '@/features/profile/useProfile';
import {
  emptyPassword,
  passwordSchema,
  type PasswordFormValues,
} from '@/features/profile/passwordSchema';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ProfilePage() {
  const { me } = useAuth();
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyPassword,
  });

  const onSubmit = handleSubmit(async (values) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    reset(emptyPassword);
  });

  const user = me?.user;
  const roles = me?.roles ?? [];
  const permissionLabels = (me?.permissions ?? []).map(
    (key) => PERMISSIONS.find((p) => p.key === key)?.label ?? key,
  );

  return (
    <>
      <AVXPageHeader title="My Profile" subtitle="Your account details and password" />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Account details */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main', fontSize: 20 }}>
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'A'}
              </Avatar>
              <Box>
                <Typography variant="h3">
                  {user ? `${user.firstName} ${user.lastName}` : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Field label="First name" value={user?.firstName ?? '—'} />
                <Field label="Last name" value={user?.lastName ?? '—'} />
                <Field label="Status" value={user?.status ?? '—'} />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {roles.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned.
                    </Typography>
                  )}
                  {roles.map((r) => {
                    const c = getRoleColor(r._id);
                    return (
                      <Chip
                        key={r._id}
                        label={r.name}
                        size="small"
                        sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 600 }}
                      />
                    );
                  })}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Permissions ({permissionLabels.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {permissionLabels.map((label) => (
                    <Chip key={label} label={label} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Change password
            </Typography>
            <Box
              component="form"
              onSubmit={onSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Controller
                name="currentPassword"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    type="password"
                    label="Current password"
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    type="password"
                    label="New password"
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <AVXTextField
                    {...field}
                    type="password"
                    label="Confirm new password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    fullWidth
                  />
                )}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={changePassword.isPending}
                >
                  Update password
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
