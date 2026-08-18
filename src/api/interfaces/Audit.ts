/**
 * Immutable audit log entry (blueprint §3.4). Written by every mutating action —
 * the approvals module emits these on each transition. The read side / UI ships
 * in Phase 4; the contract is defined now so nothing has to be refactored later.
 */
export interface AuditEntry {
  _id: string;
  actorId: string;
  actorName: string; // (assumed) denormalized
  action: string; // "user.create", "record.approve", ...
  entity: string; // "User" | "Record" | ...
  entityId: string;
  before: unknown | null; // (assumed) snapshot
  after: unknown | null; // (assumed) snapshot
  ip: string; // (assumed)
  createdAt: string;
}
