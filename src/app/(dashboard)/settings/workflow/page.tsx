'use client';

import { useEffect } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXTextField } from '@/components/AVXTextField';
import { AVXColorField } from '@/components/AVXColorField';
import { PermissionGate } from '@/auth';
import { useRoles } from '@/features/roles/useRoles';
import {
  useWorkflowSettings,
  useWorkflowSettingsMutation,
} from '@/features/settings/useWorkflowSettings';
import {
  slugifyStatusKey,
  workflowSchema,
  type WorkflowFormValues,
} from '@/features/settings/workflowSchema';

export default function WorkflowSettingsPage() {
  const { data, isLoading, isError } = useWorkflowSettings();
  const { data: roles = [] } = useRoles();
  const save = useWorkflowSettingsMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { statuses: [], approvalLevels: [] },
  });

  const statuses = useFieldArray({ control, name: 'statuses' });
  const levels = useFieldArray({ control, name: 'approvalLevels' });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    // Backfill machine keys for new statuses and re-sequence level order.
    const body: WorkflowFormValues = {
      statuses: values.statuses.map((s) => ({
        ...s,
        key: s.key || slugifyStatusKey(s.label),
      })),
      approvalLevels: values.approvalLevels.map((l, i) => ({ ...l, level: i })),
    };
    await save.mutateAsync(body);
  });

  const roleName = (id: string) => roles.find((r) => r._id === id)?.name ?? id;

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
        <AVXPageHeader title="Workflow" subtitle="Statuses and approval levels" />
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Couldn&apos;t load the workflow settings. Please try again.
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <AVXPageHeader
        title="Workflow"
        subtitle="Define record statuses and the approval levels they move through"
        action={
          <PermissionGate permission="settings:workflow">
            <Button type="submit" variant="contained" disabled={save.isPending}>
              Save changes
            </Button>
          </PermissionGate>
        }
      />

      <Stack spacing={2.5}>
        {/* Statuses ------------------------------------------------------- */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h4">Statuses</Typography>
                <Typography variant="body2" color="text.secondary">
                  The states a record can be in. Colors are used for chips
                  throughout the app.
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  statuses.append({ key: '', label: '', color: '#8a94a6' })
                }
              >
                Add status
              </Button>
            </Box>

            <Stack spacing={2}>
              {statuses.fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <Controller
                    name={`statuses.${index}.label`}
                    control={control}
                    render={({ field: f }) => (
                      <AVXTextField
                        {...f}
                        label="Label"
                        error={!!errors.statuses?.[index]?.label}
                        helperText={errors.statuses?.[index]?.label?.message}
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                    )}
                  />
                  <Controller
                    name={`statuses.${index}.color`}
                    control={control}
                    render={({ field: f }) => (
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <AVXColorField
                          label="Color"
                          value={f.value}
                          onChange={f.onChange}
                          error={!!errors.statuses?.[index]?.color}
                          helperText={errors.statuses?.[index]?.color?.message}
                        />
                      </Box>
                    )}
                  />
                  <Tooltip title="Remove status">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => statuses.remove(index)}
                        disabled={statuses.fields.length <= 1}
                        sx={{ mt: { xs: 0, sm: 0.5 } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Approval levels ------------------------------------------------ */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h4">Approval levels</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ordered stages a record passes through. Each level lists the
                  roles allowed to approve it.
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  levels.append({
                    level: levels.fields.length,
                    name: '',
                    approverRoleIds: [],
                  })
                }
              >
                Add level
              </Button>
            </Box>

            {typeof errors.approvalLevels?.message === 'string' && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                {errors.approvalLevels.message}
              </Typography>
            )}

            <Stack spacing={2}>
              {levels.fields.map((field, index) => (
                <LevelRow
                  key={field.id}
                  index={index}
                  total={levels.fields.length}
                  control={control}
                  errors={errors}
                  roles={roles}
                  roleName={roleName}
                  onRemove={() => levels.remove(index)}
                  onMoveUp={() => levels.move(index, index - 1)}
                  onMoveDown={() => levels.move(index, index + 1)}
                />
              ))}
              {levels.fields.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 1 }}>
                  No approval levels yet. Add one to require review before a record
                  is approved.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

interface LevelRowProps {
  index: number;
  total: number;
  control: Control<WorkflowFormValues>;
  errors: FieldErrors<WorkflowFormValues>;
  roles: { _id: string; name: string }[];
  roleName: (id: string) => string;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function LevelRow({
  index,
  total,
  control,
  errors,
  roles,
  roleName,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LevelRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Chip label={`L${index + 1}`} size="small" sx={{ mt: { sm: 1 }, flexShrink: 0 }} />
      <Controller
        name={`approvalLevels.${index}.name`}
        control={control}
        render={({ field: f }) => (
          <AVXTextField
            {...f}
            label="Level name"
            error={!!errors.approvalLevels?.[index]?.name}
            helperText={errors.approvalLevels?.[index]?.name?.message}
            sx={{ flex: 1, minWidth: 0 }}
          />
        )}
      />
      <Controller
        name={`approvalLevels.${index}.approverRoleIds`}
        control={control}
        render={({ field: f }) => (
          <FormControl
            fullWidth
            error={!!errors.approvalLevels?.[index]?.approverRoleIds}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <InputLabel id={`approvers-${index}`}>Approver roles</InputLabel>
            <Select
              {...f}
              labelId={`approvers-${index}`}
              multiple
              input={<OutlinedInput label="Approver roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((id) => (
                    <Chip key={id} label={roleName(id)} size="small" />
                  ))}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            {errors.approvalLevels?.[index]?.approverRoleIds && (
              <FormHelperText>
                {errors.approvalLevels?.[index]?.approverRoleIds?.message}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
      <Stack direction="row" sx={{ mt: { sm: 0.5 } }}>
        <Tooltip title="Move up">
          <span>
            <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Move down">
          <span>
            <IconButton
              size="small"
              onClick={onMoveDown}
              disabled={index === total - 1}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Remove level">
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
