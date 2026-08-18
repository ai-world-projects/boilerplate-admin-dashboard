'use client';

import { Chip } from '@mui/material';
import { hexToRgba } from '@/utils/color';
import { useWorkflowSettings } from './useWorkflowSettings';

interface WorkflowStatusChipProps {
  /** A workflow status key, e.g. `pending`. */
  statusKey: string;
  size?: 'small' | 'medium';
}

/**
 * Renders a record's status as a colored chip using the live Workflow config, so
 * the same status is the same color everywhere and re-labeling/re-coloring a
 * status in Settings flows through automatically. Falls back to the raw key.
 */
export default function WorkflowStatusChip({
  statusKey,
  size = 'small',
}: WorkflowStatusChipProps) {
  const { data } = useWorkflowSettings();
  const status = data?.statuses.find((s) => s.key === statusKey);
  const color = status?.color ?? '#8a94a6';

  return (
    <Chip
      label={status?.label ?? statusKey}
      size={size}
      sx={{
        bgcolor: hexToRgba(color, 0.15),
        color,
        fontWeight: 600,
        textTransform: 'capitalize',
        border: 'none',
      }}
    />
  );
}
