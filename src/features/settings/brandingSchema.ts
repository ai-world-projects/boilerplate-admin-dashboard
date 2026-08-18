import { z } from 'zod';

/** Validation schema for the Branding Settings form. Zod v4 top-level `z.url()`. */
export const brandingSchema = z.object({
  appName: z.string().min(1, 'App name is required'),
  logoUrl: z.union([z.literal(''), z.url('Enter a valid URL')]),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Use a 6-digit hex color'),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;
