'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { AVXTextField } from '@/components/AVXTextField';
import type { RecordItem } from '@/api/interfaces/Record';

export type ApprovalDecision = 'approve' | 'reject';

interface ApprovalDecisionDialogProps {
  open: boolean;
  mode: ApprovalDecision;
  record: RecordItem | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (remarks: string) => void;
}

/**
 * Approve / reject dialog with a remarks field. Remarks are optional when
 * approving but required when rejecting (blueprint §2.4).
 */
export default function ApprovalDecisionDialog({
  open,
  mode,
  record,
  loading = false,
  onCancel,
  onConfirm,
}: ApprovalDecisionDialogProps) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const isReject = mode === 'reject';

  // Every close path (cancel, backdrop, confirm) runs through these handlers, so
  // the next open always starts clean — no reset-in-effect needed.
  const clear = () => {
    setRemarks('');
    setError('');
  };

  const handleCancel = () => {
    clear();
    onCancel();
  };

  const handleConfirm = () => {
    if (isReject && !remarks.trim()) {
      setError('Remarks are required to reject a record');
      return;
    }
    onConfirm(remarks.trim());
    clear();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{isReject ? 'Reject record' : 'Approve record'}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div" sx={{ mb: 2 }}>
          {isReject ? 'Reject' : 'Approve'} <strong>{record?.title}</strong>
          {isReject
            ? '. Please explain why so the owner can revise it.'
            : '. You can add optional remarks for the record history.'}
        </DialogContentText>
        <AVXTextField
          label={isReject ? 'Remarks (required)' : 'Remarks (optional)'}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
          multiline
          minRows={3}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={isReject ? 'error' : 'primary'}
        >
          {isReject ? 'Reject' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
