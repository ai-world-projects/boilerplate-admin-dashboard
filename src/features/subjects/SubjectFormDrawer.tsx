'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControlLabel, Switch } from '@mui/material';
import { AVXFormDrawer } from '@/components/AVXFormDrawer';
import { AVXTextField } from '@/components/AVXTextField';
import type { Subject } from '@/api/interfaces/Subject';
import {
  emptySubject,
  subjectSchema,
  type SubjectFormValues,
} from './subjectSchema';
import { useSubjectMutations } from './useSubjects';

interface SubjectFormDrawerProps {
  open: boolean;
  subject?: Subject | null;
  onClose: () => void;
}

/** Create/edit subject form rendered inside the shared AVXFormDrawer. */
export default function SubjectFormDrawer({
  open,
  subject,
  onClose,
}: SubjectFormDrawerProps) {
  const { create, update } = useSubjectMutations();
  const isEdit = Boolean(subject);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: emptySubject,
  });

  useEffect(() => {
    if (open) {
      reset(
        subject
          ? {
              name: subject.name,
              code: subject.code,
              description: subject.description,
              instructor: subject.instructor,
              isPublished: subject.isPublished,
            }
          : emptySubject,
      );
    }
  }, [open, subject, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && subject) {
      await update.mutateAsync({ id: subject._id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  });

  const loading = create.isPending || update.isPending;

  return (
    <AVXFormDrawer
      open={open}
      title={isEdit ? 'Edit Subject' : 'Create Subject'}
      submitLabel={isEdit ? 'Save changes' : 'Create subject'}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Subject name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="code"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Code"
            error={!!errors.code}
            helperText={errors.code?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="instructor"
        control={control}
        render={({ field }) => (
          <AVXTextField
            {...field}
            label="Instructor"
            error={!!errors.instructor}
            helperText={errors.instructor?.message}
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
        name="isPublished"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Published"
          />
        )}
      />
    </AVXFormDrawer>
  );
}
