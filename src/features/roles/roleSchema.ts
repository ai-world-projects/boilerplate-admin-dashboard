import { z } from 'zod';

/** Validation schema for the role create/edit form. */
export const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().max(200, 'Keep the description under 200 characters'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export const emptyRole: RoleFormValues = {
  name: '',
  description: '',
  permissions: [],
};
