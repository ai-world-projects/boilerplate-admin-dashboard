'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { AVXFormDrawer } from '@/components/AVXFormDrawer';
import { AVXTextField } from '@/components/AVXTextField';
import type { RecordItem } from '@/api/interfaces/Record';
import { useWorkflowSettings } from '@/features/settings/useWorkflowSettings';
import { emptyRecord, recordSchema, type RecordFormValues } from './recordSchema';
import { useRecordMutations } from './useRecords';

interface RecordFormDrawerProps {
  open: boolean;
  record?: RecordItem | null;
  onClose: () => void;
}

/** Create/edit record form rendered inside the shared AVXFormDrawer. */
export default function RecordFormDrawer({
  open,
  record,
  onClose,
}: RecordFormDrawerProps) {
  const { create, update } = useRecordMutations();
  const { data: workflow } = useWorkflowSettings();
  const isEdit = Boolean(record);

  // Archived isn't a state you set from the form — it's applied via the archive
  // action — so it's excluded from the picker.
  const statuses = (workflow?.statuses ?? []).filter((s) => s.key !== 'archived');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: emptyRecord,
  });

  useEffect(() => {
    if (open) {
      reset(
        record
          ? {
              title: record.title,
              description: record.description,
              status: record.status,
            }
          : { ...emptyRecord, status: statuses[0]?.key ?? 'draft' },
      );
    }
    // statuses derives from workflow; only re-seed on open/record change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && record) {
      await update.mutateAsync({ id: record._id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  });

  const loading = create.isPending || update.isPending;

  return (
    <AVXFormDrawer
      open={open}
      title={isEdit ? 'Edit Record' : 'Create Record'}
      submitLabel={isEdit ? 'Save changes' : 'Create record'}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Title"
            error={!!errors.title}
            helperText={errors.title?.message}
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
            minRows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="record-status-label">Status</InputLabel>
            <Select
              {...field}
              labelId="record-status-label"
              input={<OutlinedInput label="Status" />}
            >
              {statuses.map((s) => (
                <MenuItem key={s.key} value={s.key}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </AVXFormDrawer>
  );
}
