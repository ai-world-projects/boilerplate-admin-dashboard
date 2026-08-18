import { z } from 'zod';

/** Validation schema for the Workflow Settings form. */
export const workflowSchema = z.object({
  statuses: z
    .array(
      z.object({
        key: z.string(),
        label: z.string().min(1, 'Label is required'),
        color: z
          .string()
          .regex(/^#([0-9a-fA-F]{6})$/, 'Use a 6-digit hex color'),
      }),
    )
    .min(1, 'Define at least one status'),
  approvalLevels: z
    .array(
      z.object({
        level: z.number(),
        name: z.string().min(1, 'Level name is required'),
        approverRoleIds: z
          .array(z.string())
          .min(1, 'Assign at least one approver role'),
      }),
    )
    .min(1, 'Define at least one approval level'),
});

export type WorkflowFormValues = z.infer<typeof workflowSchema>;

/** Turn a status label into a stable machine key for new statuses. */
export function slugifyStatusKey(label: string): string {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `status-${Date.now()}`
  );
}
