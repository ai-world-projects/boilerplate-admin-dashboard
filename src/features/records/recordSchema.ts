import { z } from 'zod';

/** Validation schema for the record create/edit form. */
export const recordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string().min(1, 'Status is required'),
});

export type RecordFormValues = z.infer<typeof recordSchema>;

export const emptyRecord: RecordFormValues = {
  title: '',
  description: '',
  status: 'draft',
};
