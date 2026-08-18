import { z } from 'zod';

/** Validation schema for the Security Settings form. The form keeps numeric
 * fields as numbers (converted in each input's onChange), so no coercion is
 * needed and the RHF input/output types stay aligned. */
export const securitySchema = z.object({
  password: z.object({
    minLength: z.number().int().min(4, 'Min 4').max(64, 'Max 64'),
    requireUpper: z.boolean(),
    requireNumber: z.boolean(),
    requireSymbol: z.boolean(),
    expiryDays: z.number().int().min(0, 'Cannot be negative').max(365, 'Max 365'),
  }),
  sessionTimeoutMinutes: z.number().int().min(1, 'Min 1').max(1440, 'Max 1440'),
  lockout: z.object({
    maxAttempts: z.number().int().min(1, 'Min 1').max(20, 'Max 20'),
    lockMinutes: z.number().int().min(1, 'Min 1').max(1440, 'Max 1440'),
  }),
});

export type SecurityFormValues = z.infer<typeof securitySchema>;
