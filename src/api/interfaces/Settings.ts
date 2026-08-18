/**
 * System Settings entities (blueprint §3.6). Workflow ships in Phase 3; Security
 * and Branding are added in Phase 5.
 */

export interface WorkflowStatus {
  key: string; // machine key referenced by Record.status
  label: string;
  color: string; // hex, e.g. "#2ea043"
}

export interface WorkflowLevel {
  level: number; // 0-based order
  name: string;
  approverRoleIds: string[]; // roles allowed to act at this level
}

export interface WorkflowSettings {
  statuses: WorkflowStatus[];
  approvalLevels: WorkflowLevel[];
}

export interface SecuritySettings {
  password: {
    minLength: number;
    requireUpper: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
    expiryDays: number;
  };
  sessionTimeoutMinutes: number;
  lockout: {
    maxAttempts: number;
    lockMinutes: number;
  };
}

export interface BrandingSettings {
  appName: string;
  logoUrl: string;
  primaryColor: string; // hex; feeds the theme CSS variables
}
