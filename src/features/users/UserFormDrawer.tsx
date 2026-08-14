'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import { AVXFormDrawer } from '@/components/AVXFormDrawer';
import { AVXTextField } from '@/components/AVXTextField';
import type { User, UserStatus } from '@/api/interfaces/User';
import { useRoles } from '@/features/roles/useRoles';
import { getRoleColor } from '@/utils/roleColor';
import { emptyUser, userSchema, type UserFormValues } from './userSchema';
import { useUserMutations } from './useUsers';

interface UserFormDrawerProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
}

const statuses: UserStatus[] = ['active', 'inactive', 'pending'];

/** Create/edit user form rendered inside the shared AVXFormDrawer. */
export default function UserFormDrawer({ open, user, onClose }: UserFormDrawerProps) {
  const { create, update } = useUserMutations();
  const { data: roles = [] } = useRoles();
  const isEdit = Boolean(user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyUser,
  });

  useEffect(() => {
    if (open) {
      reset(
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              roleIds: user.roleIds,
              status: user.status,
            }
          : emptyUser,
      );
    }
  }, [open, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && user) {
      await update.mutateAsync({ id: user._id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  });

  const loading = create.isPending || update.isPending;
  const roleName = (id: string) => roles.find((r) => r._id === id)?.name ?? id;

  return (
    <AVXFormDrawer
      open={open}
      title={isEdit ? 'Edit User' : 'Create User'}
      submitLabel={isEdit ? 'Save changes' : 'Create user'}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {/* First + last name share a row on wider screens, stack on mobile. */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, '& > *': { flex: 1, minWidth: 0 } }}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <AVXTextField
              {...field}
              label="First name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <AVXTextField
              {...field}
              label="Last name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Box>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="roleIds"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.roleIds}>
            <InputLabel id="roles-label">Roles</InputLabel>
            <Select
              {...field}
              labelId="roles-label"
              multiple
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((id) => {
                    const c = getRoleColor(id);
                    return (
                      <Chip
                        key={id}
                        label={roleName(id)}
                        size="small"
                        sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 600 }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            {errors.roleIds && <FormHelperText>{errors.roleIds.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              {...field}
              labelId="status-label"
              input={<OutlinedInput label="Status" />}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </AVXFormDrawer>
  );
}
