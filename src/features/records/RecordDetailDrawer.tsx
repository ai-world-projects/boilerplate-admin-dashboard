'use client';

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import type { Attachment, RecordItem } from '@/api/interfaces/Record';
import WorkflowStatusChip from '@/features/settings/WorkflowStatusChip';
import { formatDateTime } from '@/utils/formatDate';
import { useRecordHistory } from './useRecords';
import ApprovalHistoryList from './ApprovalHistoryList';

interface RecordDetailDrawerProps {
  open: boolean;
  record: RecordItem | null;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

/** Read-only record detail: fields, attachments, and approval history. */
export default function RecordDetailDrawer({
  open,
  record,
  onClose,
}: RecordDetailDrawerProps) {
  const { data: history, isLoading, isError } = useRecordHistory(
    open ? record?._id ?? null : null,
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100vw', sm: 480 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h3">Record details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {record && (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
            <Stack spacing={2.5}>
              <Field label="Title">
                <Typography variant="h4">{record.title}</Typography>
              </Field>

              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Field label="Status">
                  <WorkflowStatusChip statusKey={record.status} />
                </Field>
                <Field label="Owner">
                  <Typography variant="body2">{record.ownerName}</Typography>
                </Field>
                <Field label="Approval level">
                  <Typography variant="body2">
                    L{record.currentApprovalLevel + 1}
                  </Typography>
                </Field>
              </Box>

              <Field label="Description">
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {record.description}
                </Typography>
              </Field>

              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Field label="Created">
                  <Typography variant="body2">
                    {formatDateTime(record.createdAt)}
                  </Typography>
                </Field>
                <Field label="Last updated">
                  <Typography variant="body2">
                    {formatDateTime(record.updatedAt)}
                  </Typography>
                </Field>
              </Box>

              <Divider />

              <Field label="Attachments">
                {record.attachments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No attachments.
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ mt: 0.5 }}>
                    {record.attachments.map((att: Attachment) => (
                      <Box
                        key={att._id}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <InsertDriveFileOutlinedIcon
                          fontSize="small"
                          sx={{ color: 'text.secondary' }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Link
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {att.fileName}
                          </Link>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                            {formatBytes(att.sizeBytes)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          component={Link}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download ${att.fileName}`}
                        >
                          <DownloadOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Field>

              <Divider />

              <Field label="Approval history">
                <Box sx={{ mt: 1 }}>
                  <ApprovalHistoryList
                    actions={history}
                    isLoading={isLoading}
                    isError={isError}
                  />
                </Box>
              </Field>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
