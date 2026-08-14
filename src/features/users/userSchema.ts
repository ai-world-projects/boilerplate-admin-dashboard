import { z } from 'zod';

/** Validation schema for the user create/edit form. */
export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email address'),
  roleIds: z.array(z.string()).min(1, 'Assign at least one role'),
  status: z.enum(['active', 'inactive', 'pending']),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const emptyUser: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  roleIds: [],
  status: 'pending',
};
