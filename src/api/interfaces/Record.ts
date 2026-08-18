/**
 * Records (blueprint §3.3) — the generic content domain that replaces the legacy
 * subjects feature. The TS symbol is `RecordItem` (not `Record`) to avoid
 * shadowing TypeScript's built-in `Record<K, V>` utility used across the repo;
 * the API entity and its field names still match the blueprint exactly.
 *
 * Fields marked (assumed) in the blueprint are isolated here so they are cheap to
 * change once the real API exists.
 */

export interface Attachment {
  _id: string;
  fileName: string;
  fileUrl: string; // absolute URL returned by the API (mock uses placeholder URLs)
  mimeType: string; // (assumed)
  sizeBytes: number; // (assumed)
  uploadedAt: string;
}

export interface RecordItem {
  _id: string;
  title: string;
  description: string;
  status: string; // references a WorkflowStatus.key (§3.6)
  ownerId: string; // (assumed) user who created it
  ownerName: string; // (assumed) denormalized for list display
  currentApprovalLevel: number; // (assumed) 0-based index into workflow levels
  attachments: Attachment[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalActionType = 'submit' | 'approve' | 'reject';

/** History entry appended on every approval transition (blueprint §3.3). */
export interface ApprovalAction {
  _id: string;
  recordId: string;
  actorId: string;
  actorName: string; // (assumed) denormalized
  level: number;
  action: ApprovalActionType;
  remarks: string;
  createdAt: string;
}

/** Payload for creating/editing a record. */
export interface RecordFormRequest {
  title: string;
  description: string;
  status: string;
}

export type PartialRecordFormRequest = Partial<RecordFormRequest>;

/** Body for the archive/restore endpoint. */
export interface ArchiveRecordRequest {
  isArchived: boolean;
}

/** Body for approving a record (remarks optional). */
export interface ApproveRecordRequest {
  remarks?: string;
}

/** Body for rejecting a record (remarks required — blueprint §2.4). */
export interface RejectRecordRequest {
  remarks: string;
}
