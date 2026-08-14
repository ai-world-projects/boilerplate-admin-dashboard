'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXConfirmDialog } from '@/components/AVXConfirmDialog';
import { PermissionGate } from '@/auth';
import type { Role } from '@/api/interfaces/Rbac';
import { useRoles, useRoleMutations } from '@/features/roles/useRoles';
import RoleFormDrawer from '@/features/roles/RoleFormDrawer';

export default function AccessSettingsPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { remove } = useRoleMutations();
  const [editing, setEditing] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (role: Role) => {
    setEditing(role);
    setDrawerOpen(true);
  };

  return (
    <>
      <AVXPageHeader
        title="Access (RBAC)"
        subtitle="Roles and their permissions"
        action={
          <PermissionGate permission="settings:rbac">
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Create role
            </Button>
          </PermissionGate>
        }
      />

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Permissions</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 320 }}>
                    {role.description}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={role.permissions.length} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={role.isSystem ? 'System' : 'Custom'}
                      size="small"
                      variant="outlined"
                      color={role.isSystem ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                      <PermissionGate permission="settings:rbac">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(role)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={role.isSystem ? 'System roles cannot be deleted' : 'Delete'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={role.isSystem}
                              onClick={() => setToDelete(role)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </PermissionGate>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                      No roles yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <RoleFormDrawer
        open={drawerOpen}
        role={editing}
        onClose={() => setDrawerOpen(false)}
      />

      <AVXConfirmDialog
        open={Boolean(toDelete)}
        title="Delete role"
        message={
          <>
            Delete the <strong>{toDelete?.name}</strong> role? Users assigned only
            this role will lose its permissions.
          </>
        }
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete._id);
          setToDelete(null);
        }}
      />
    </>
  );
}
