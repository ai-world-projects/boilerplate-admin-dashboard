import { z } from 'zod';

/** Validation schema for the subject create/edit form. */
export const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().max(280, 'Keep the description under 280 characters'),
  instructor: z.string().min(1, 'Instructor is required'),
  isPublished: z.boolean(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

export const emptySubject: SubjectFormValues = {
  name: '',
  code: '',
  description: '',
  instructor: '',
  isPublished: false,
};
