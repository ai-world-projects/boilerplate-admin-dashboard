'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Typography,
} from '@mui/material';
import { AVXFormDrawer } from '@/components/AVXFormDrawer';
import { AVXTextField } from '@/components/AVXTextField';
import { PERMISSIONS, type PermissionKey } from '@/auth/permissions';
import type { Role } from '@/api/interfaces/Rbac';
import { emptyRole, roleSchema, type RoleFormValues } from './roleSchema';
import { useRoleMutations } from './useRoles';

interface RoleFormDrawerProps {
  open: boolean;
  role?: Role | null;
  onClose: () => void;
}

// Group the permission catalogue for the matrix UI.
const groupedPermissions = PERMISSIONS.reduce<Record<string, typeof PERMISSIONS[number][]>>(
  (acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  },
  {},
);

// Stable empty default so useWatch's fallback doesn't change identity each render.
const EMPTY_PERMISSIONS: string[] = [];

/** Create/edit role form with a grouped permission matrix. */
export default function RoleFormDrawer({ open, role, onClose }: RoleFormDrawerProps) {
  const { create, update } = useRoleMutations();
  const isEdit = Boolean(role);
  const isSystem = Boolean(role?.isSystem);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyRole,
  });

  const selected = useWatch({ control, name: 'permissions' }) ?? EMPTY_PERMISSIONS;

  useEffect(() => {
    if (open) {
      reset(
        role
          ? { name: role.name, description: role.description, permissions: role.permissions }
          : emptyRole,
      );
    }
  }, [open, role, reset]);

  const toggle = (key: PermissionKey, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(key);
    else next.delete(key);
    setValue('permissions', [...next], { shouldValidate: true });
  };

  const toggleGroup = (keys: PermissionKey[], on: boolean) => {
    const next = new Set(selected);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    setValue('permissions', [...next], { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    // The Zod schema stores permissions as string[]; the API expects PermissionKey[].
    const body = { ...values, permissions: values.permissions as PermissionKey[] };
    if (isEdit && role) {
      await update.mutateAsync({ id: role._id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  });

  const loading = create.isPending || update.isPending;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <AVXFormDrawer
      open={open}
      title={isEdit ? 'Edit Role' : 'Create Role'}
      submitLabel={isEdit ? 'Save changes' : 'Create role'}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
      width={520}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Role name"
            disabled={isSystem}
            error={!!errors.name}
            helperText={errors.name?.message ?? (isSystem ? 'System role name is locked' : '')}
            fullWidth
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Description"
            multiline
            minRows={2}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />
        )}
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Permissions
        </Typography>
        {errors.permissions && (
          <Typography variant="caption" color="error">
            {errors.permissions.message}
          </Typography>
        )}
        {Object.entries(groupedPermissions).map(([group, perms]) => {
          const keys = perms.map((p) => p.key);
          const allOn = keys.every((k) => selectedSet.has(k));
          return (
            <Box key={group} sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {group}
                </Typography>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => toggleGroup(keys, !allOn)}
                  sx={{ cursor: 'pointer' }}
                >
                  {allOn ? 'Clear' : 'Select all'}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
                {perms.map((p) => (
                  <FormControlLabel
                    key={p.key}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedSet.has(p.key)}
                        onChange={(e) => toggle(p.key, e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">{p.label}</Typography>}
                  />
                ))}
              </Box>
              <Divider sx={{ mt: 1 }} />
            </Box>
          );
        })}
      </Box>
    </AVXFormDrawer>
  );
}
